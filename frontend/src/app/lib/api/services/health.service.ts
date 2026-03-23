/**
 * @module services/health
 * Backend health check.
 */

import type { HttpClient } from "../http-client";
import { Routes } from "../routes";
import type { HealthResponse } from "../types";

export class HealthService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Ping the backend health endpoint.
   *
   * @returns `{ status: "ok" }` when the server is reachable
   * @throws {NetworkError} when the backend is unreachable
   */
  check(signal?: AbortSignal): Promise<HealthResponse> {
    return this.http.get<HealthResponse>(Routes.Health, signal);
  }
}
