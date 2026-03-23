/**
 * @module api/errors
 * Typed error hierarchy for the Planty HTTP layer.
 *
 * Why a hierarchy?
 * - Callers can `catch (e) { if (isApiError(e)) ... }` without guessing
 * - Each subclass carries structured metadata (status, body, retryable flag)
 * - Type guards narrow the type in catch blocks
 */

import type { ErrorBody } from "./types";

// ─── HTTP Status Code Constants ─────────────────────────

export const HttpStatus = {
  OK:           200,
  Created:      201,
  NoContent:    204,
  BadRequest:   400,
  Unauthorized: 401,
  Forbidden:    403,
  NotFound:     404,
  Conflict:     409,
  ServerError:  500,
  BadGateway:   502,
  Unavailable:  503,
  Timeout:      504,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

// ─── Base ───────────────────────────────────────────────

/** Base class for all Planty API errors */
export abstract class PlantyError extends Error {
  abstract readonly code: string;
  abstract readonly retryable: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── ApiError (server returned non-2xx) ─────────────────

export class ApiError extends PlantyError {
  readonly code = "API_ERROR";
  readonly retryable: boolean;

  constructor(
    public readonly status: number,
    public readonly body: ErrorBody,
    public readonly url: string,
  ) {
    super(body.error ?? `HTTP ${status}`);
    this.retryable = status >= 500;
  }

  /** True when the token is invalid or expired (triggers auto-logout) */
  get isUnauthorized(): boolean {
    return this.status === HttpStatus.Unauthorized;
  }

  get isForbidden(): boolean {
    return this.status === HttpStatus.Forbidden;
  }

  get isNotFound(): boolean {
    return this.status === HttpStatus.NotFound;
  }

  get isConflict(): boolean {
    return this.status === HttpStatus.Conflict;
  }

  get isValidation(): boolean {
    return this.status === HttpStatus.BadRequest;
  }
}

// ─── NetworkError (fetch threw — no connectivity, DNS, CORS) ──

export class NetworkError extends PlantyError {
  readonly code = "NETWORK_ERROR";
  readonly retryable = true;

  constructor(
    public readonly cause: unknown,
    public readonly url: string,
  ) {
    const msg = cause instanceof Error ? cause.message : "Network request failed";
    super(msg);
  }
}

// ─── TimeoutError ───────────────────────────────────────

export class TimeoutError extends PlantyError {
  readonly code = "TIMEOUT_ERROR";
  readonly retryable = true;

  constructor(
    public readonly url: string,
    public readonly timeoutMs: number,
  ) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`);
  }
}

// ─── AbortError (user / component unmount cancelled) ────

export class AbortError extends PlantyError {
  readonly code = "ABORT_ERROR";
  readonly retryable = false;

  constructor(public readonly url: string) {
    super(`Request to ${url} was aborted`);
  }
}

// ─── Type Guards ────────────────────────────────────────

export function isPlantyError(err: unknown): err is PlantyError {
  return err instanceof PlantyError;
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function isNetworkError(err: unknown): err is NetworkError {
  return err instanceof NetworkError;
}

export function isTimeoutError(err: unknown): err is TimeoutError {
  return err instanceof TimeoutError;
}

export function isAbortError(err: unknown): err is AbortError {
  return err instanceof AbortError;
}

/** True if the error is transient and worth retrying */
export function isRetryable(err: unknown): boolean {
  return isPlantyError(err) && err.retryable;
}
