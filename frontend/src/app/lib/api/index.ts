/**
 * @module api
 * Barrel export & singleton factory for the Planty API client.
 *
 * Usage:
 *   import { api } from "@/app/lib/api";
 *   const plants = await api.plants.list();
 *
 * Or import specific pieces:
 *   import { ApiError, isApiError } from "@/app/lib/api";
 *   import type { Plant, PlantId } from "@/app/lib/api";
 */

import { HttpClient, type HttpClientConfig } from "./http-client";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { PlantsService } from "./services/plants.service";
import { SensorsService } from "./services/sensors.service";
import { RolesService } from "./services/roles.service";
import { HealthService } from "./services/health.service";
import { DeviceKeysService } from "./services/device-keys.service";

// ─── API Client Facade ──────────────────────────────────

export class PlantyApi {
  readonly http: HttpClient;
  readonly auth: AuthService;
  readonly user: UserService;
  readonly plants: PlantsService;
  readonly sensors: SensorsService;
  readonly roles: RolesService;
  readonly health: HealthService;
  readonly deviceKeys: DeviceKeysService;

  constructor(config: HttpClientConfig) {
    this.http       = new HttpClient(config);
    this.auth       = new AuthService(this.http);
    this.user       = new UserService(this.http);
    this.plants     = new PlantsService(this.http);
    this.sensors    = new SensorsService(this.http);
    this.roles      = new RolesService(this.http);
    this.health     = new HealthService(this.http);
    this.deviceKeys = new DeviceKeysService(this.http);
  }
}

// ─── Default singleton ──────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

/** Pre-configured singleton — import this for normal usage */
export const api = new PlantyApi({
  baseUrl:    BASE_URL,
  timeoutMs:  30_000,
  maxRetries: 2,
});

// ─── Re-exports ─────────────────────────────────────────

// Types
export type {
  UserId,
  PlantId,
  RoleId,
  ReadingId,
  ISOTimestamp,
  Role,
  User,
  Plant,
  SensorReading,
  AuthResponse,
  MessageResponse,
  ErrorBody,
  HealthResponse,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  CreatePlantRequest,
  UpdatePlantRequest,
  CreateReadingRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  DeviceKey,
  CreateDeviceKeyRequest,
  PlantMood,
  RoleKind,
  HttpMethod,
} from "./types";

// Branded ID constructors
export {
  asUserId,
  asPlantId,
  asRoleId,
  asReadingId,
  PlantMood as PlantMoodEnum,
  RoleKind as RoleKindEnum,
} from "./types";

// Errors
export {
  PlantyError,
  ApiError,
  NetworkError,
  TimeoutError,
  AbortError,
  HttpStatus,
  isPlantyError,
  isApiError,
  isNetworkError,
  isTimeoutError,
  isAbortError,
  isRetryable,
} from "./errors";
export type { HttpStatusCode } from "./errors";

// Token management
export { TokenManager } from "./token-manager";

// Routes
export { Routes } from "./routes";

// HTTP client (for custom instances / testing)
export { HttpClient } from "./http-client";
export type {
  HttpClientConfig,
  RequestContext,
  ResponseContext,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "./http-client";

// Services (for custom composition / testing)
export { AuthService } from "./services/auth.service";
export { UserService } from "./services/user.service";
export { PlantsService } from "./services/plants.service";
export { SensorsService } from "./services/sensors.service";
export { RolesService } from "./services/roles.service";
export { HealthService } from "./services/health.service";
export { DeviceKeysService } from "./services/device-keys.service";
