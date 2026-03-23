/**
 * @module api/http-client
 * Production-grade HTTP client with interceptors, retry, timeout & cancellation.
 *
 * Design:
 * - Services receive an `HttpClient` instance via constructor injection → testable
 * - Request/response interceptors allow cross-cutting concerns (auth, logging, metrics)
 * - Retry with exponential back-off for transient (5xx / network) failures
 * - AbortController integration so React `useEffect` cleanup cancels in-flight requests
 * - Typed convenience methods: get, post, put, patch, del
 */

import { TokenManager } from "./token-manager";
import {
  ApiError,
  NetworkError,
  TimeoutError,
  AbortError,
  type HttpStatusCode,
} from "./errors";
import type { ErrorBody, HttpMethod } from "./types";

// ─── Configuration ──────────────────────────────────────

export interface HttpClientConfig {
  /** Base URL prepended to every request path (no trailing slash) */
  baseUrl: string;
  /** Default request timeout in ms (0 = no timeout). @default 30_000 */
  timeoutMs?: number;
  /** Max automatic retries for retryable failures. @default 2 */
  maxRetries?: number;
  /** Base delay (ms) for exponential back-off. @default 500 */
  retryBaseMs?: number;
  /** Custom headers merged into every request */
  defaultHeaders?: Record<string, string>;
}

// ─── Interceptor Types ──────────────────────────────────

export interface RequestContext {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export interface ResponseContext<T = unknown> {
  status: number;
  headers: Headers;
  data: T;
  url: string;
  durationMs: number;
}

export type RequestInterceptor  = (ctx: RequestContext)  => RequestContext  | Promise<RequestContext>;
export type ResponseInterceptor = <T>(ctx: ResponseContext<T>) => ResponseContext<T> | Promise<ResponseContext<T>>;
export type ErrorInterceptor    = (err: unknown) => void;

// ─── Sleep utility ──────────────────────────────────────

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

// ─── HttpClient ─────────────────────────────────────────

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly defaultHeaders: Record<string, string>;

  private readonly requestInterceptors:  RequestInterceptor[]  = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly errorInterceptors:    ErrorInterceptor[]    = [];

  constructor(config: HttpClientConfig) {
    this.baseUrl        = config.baseUrl;
    this.timeoutMs      = config.timeoutMs ?? 30_000;
    this.maxRetries     = config.maxRetries ?? 2;
    this.retryBaseMs    = config.retryBaseMs ?? 500;
    this.defaultHeaders = { "Content-Type": "application/json", ...config.defaultHeaders };
  }

  // ── Interceptor registration ────────────────────────

  /** Add a function that transforms every outgoing request */
  onRequest(fn: RequestInterceptor): this {
    this.requestInterceptors.push(fn);
    return this;
  }

  /** Add a function that transforms every successful response */
  onResponse(fn: ResponseInterceptor): this {
    this.responseInterceptors.push(fn);
    return this;
  }

  /** Add a function called on every error (logging, telemetry) */
  onError(fn: ErrorInterceptor): this {
    this.errorInterceptors.push(fn);
    return this;
  }

  // ── Typed convenience methods ───────────────────────

  /** GET request — no body */
  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>("GET", path, undefined, signal);
  }

  /** POST request with JSON body */
  post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>("POST", path, body, signal);
  }

  /** PUT request with JSON body */
  put<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>("PUT", path, body, signal);
  }

  /** PATCH request with JSON body */
  patch<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>("PATCH", path, body, signal);
  }

  /** DELETE request — optional body */
  del<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>("DELETE", path, undefined, signal);
  }

  // ── Core request ────────────────────────────────────

  async request<T>(
    method: HttpMethod | string,
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    // Build initial request context
    let ctx: RequestContext = {
      url,
      method: method as HttpMethod,
      headers: { ...this.defaultHeaders },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    };

    // Inject auth token
    const token = TokenManager.get();
    if (token) {
      ctx.headers["Authorization"] = `Bearer ${token}`;
    }

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      ctx = await interceptor(ctx);
    }

    // Retry loop
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.execute<T>(ctx);
      } catch (err) {
        lastError = err;

        // Don't retry aborts or non-retryable errors
        if (err instanceof AbortError) throw err;
        if (err instanceof ApiError && !err.retryable) throw err;

        // Last attempt — don't retry
        if (attempt === this.maxRetries) break;

        // Exponential back-off: 500ms, 1000ms, 2000ms …
        const delayMs = this.retryBaseMs * Math.pow(2, attempt);
        await sleep(delayMs, signal).catch(() => {
          throw new AbortError(url);
        });
      }
    }

    // Notify error interceptors and rethrow
    for (const fn of this.errorInterceptors) {
      try { fn(lastError); } catch { /* interceptor must not throw */ }
    }
    throw lastError;
  }

  // ── Single execution attempt ────────────────────────

  private async execute<T>(ctx: RequestContext): Promise<T> {
    const controller = new AbortController();
    const mergedSignal = ctx.signal;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Wire up external abort signal
    if (mergedSignal) {
      if (mergedSignal.aborted) throw new AbortError(ctx.url);
      mergedSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    // Wire up timeout
    if (this.timeoutMs > 0) {
      timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    }

    const start = performance.now();

    try {
      const res = await fetch(ctx.url, {
        method: ctx.method,
        headers: ctx.headers,
        body: ctx.body,
        signal: controller.signal,
      });

      const durationMs = performance.now() - start;

      // 204 No Content
      if (res.status === 204) {
        return undefined as T;
      }

      const data = await res.json();

      if (!res.ok) {
        const error = new ApiError(
          res.status as HttpStatusCode,
          data as ErrorBody,
          ctx.url,
        );

        // Auto-clear token on 401
        if (error.isUnauthorized) {
          TokenManager.clear();
        }

        throw error;
      }

      // Run response interceptors
      let resCtx: ResponseContext<T> = {
        status: res.status,
        headers: res.headers,
        data: data as T,
        url: ctx.url,
        durationMs,
      };
      for (const interceptor of this.responseInterceptors) {
        resCtx = await interceptor(resCtx);
      }

      return resCtx.data;
    } catch (err) {
      // Rethrow our own errors
      if (err instanceof ApiError) throw err;
      if (err instanceof AbortError) throw err;

      // Timeout (AbortController fired by our timer)
      if (err instanceof DOMException && err.name === "AbortError") {
        if (mergedSignal?.aborted) {
          throw new AbortError(ctx.url);
        }
        throw new TimeoutError(ctx.url, this.timeoutMs);
      }

      // Network failure
      throw new NetworkError(err, ctx.url);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}
