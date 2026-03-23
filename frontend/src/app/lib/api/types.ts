/**
 * @module api/types
 * Domain types for the Planty API — exact mirror of Go backend models.
 *
 * Design decisions:
 * - Branded UUID types prevent mixing up plantId/userId/roleId at compile time
 * - Request DTOs are separated from Response DTOs (never reuse a response type as input)
 * - Discriminated unions enforce the exact set of values the backend accepts
 * - Timestamps are ISO-8601 strings as returned by Go's `time.Time` JSON marshaller
 */

// ─── Branded UUID Types ─────────────────────────────────
// Nominal typing prevents accidentally passing a UserId where a PlantId is expected.

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** UUID string branded as a User identifier */
export type UserId = Brand<string, "UserId">;
/** UUID string branded as a Plant identifier */
export type PlantId = Brand<string, "PlantId">;
/** UUID string branded as a Role identifier */
export type RoleId = Brand<string, "RoleId">;
/** UUID string branded as a SensorReading identifier */
export type ReadingId = Brand<string, "ReadingId">;

/**
 * Cast a raw string (e.g. from URL params) into a branded UUID.
 * No runtime validation — this is a compile-time safety net.
 */
export function asUserId(raw: string): UserId { return raw as UserId; }
export function asPlantId(raw: string): PlantId { return raw as PlantId; }
export function asRoleId(raw: string): RoleId { return raw as RoleId; }
export function asReadingId(raw: string): ReadingId { return raw as ReadingId; }

// ─── Enum-like constants ────────────────────────────────

/** Plant mood derived from moisture thresholds (matches Arduino main.ino) */
export const PlantMood = {
  Happy: "happy",
  Normal: "normal",
  Sad: "sad",
} as const;
export type PlantMood = (typeof PlantMood)[keyof typeof PlantMood];

/** Well-known role descriptions seeded by init.sql */
export const RoleKind = {
  Admin: "admin",
  User: "user",
  Viewer: "viewer",
} as const;
export type RoleKind = (typeof RoleKind)[keyof typeof RoleKind];

/** HTTP methods used by the API */
export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;
export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

// ─── ISO Timestamp ──────────────────────────────────────

/** ISO-8601 datetime string as returned by Go's time.Time JSON marshaller */
export type ISOTimestamp = string;

// ─── Response Models (what the backend returns) ─────────

/** Matches `models.Role` JSON output */
export interface Role {
  readonly id: RoleId;
  readonly description: string;
}

/** Matches `models.User` JSON output (password_hash is `json:"-"`) */
export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly role_id: RoleId;
  readonly role: Role;
  readonly created_at: ISOTimestamp;
  readonly updated_at: ISOTimestamp;
  readonly plants?: Plant[];
}

/** Matches `models.Plant` JSON output */
export interface Plant {
  readonly id: PlantId;
  readonly user_id: UserId;
  readonly name: string;
  readonly species: string;
  readonly pump_status: boolean;
  readonly created_at: ISOTimestamp;
  readonly updated_at: ISOTimestamp;
  readonly readings?: SensorReading[];
}

/** Matches `models.SensorReading` JSON output */
export interface SensorReading {
  readonly id: ReadingId;
  readonly plant_id: PlantId;
  readonly moisture: number;
  readonly pump_on: boolean;
  readonly plant_mood: PlantMood;
  readonly created_at: ISOTimestamp;
}

// ─── Auth Responses ─────────────────────────────────────

/** Returned by POST /auth/register and POST /auth/login */
export interface AuthResponse {
  readonly user: User;
  readonly token: string;
}

// ─── Generic Response Envelopes ─────────────────────────

/** Returned by DELETE endpoints on success */
export interface MessageResponse {
  readonly message: string;
}

/** Returned on any error (non-2xx) */
export interface ErrorBody {
  readonly error: string;
}

// ─── Request DTOs (what the backend accepts) ────────────
// Strict separation: never pass a response type as a request body.

/** POST /auth/register */
export interface RegisterRequest {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role?: RoleKind | string;
}

/** POST /auth/login */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/** PUT /user/profile */
export interface UpdateProfileRequest {
  readonly name?: string;
  readonly email?: string;
  readonly password?: string;
}

/** POST /plants */
export interface CreatePlantRequest {
  readonly name: string;
  readonly species?: string;
}

/** PUT /plants/:plantId */
export interface UpdatePlantRequest {
  readonly name?: string;
  readonly species?: string;
}

/** POST /plants/:plantId/readings */
export interface CreateReadingRequest {
  readonly moisture: number;
  readonly pump_on?: boolean;
  readonly plant_mood?: PlantMood;
}

/** POST /roles (admin only) */
export interface CreateRoleRequest {
  readonly description: string;
}

/** PUT /roles/:roleId (admin only) */
export interface UpdateRoleRequest {
  readonly description: string;
}

/** PATCH /users/:userId/role (admin only) */
export interface AssignRoleRequest {
  readonly role_id: RoleId;
}

// ─── Device Keys ────────────────────────────────────────

/** Matches `models.DeviceKey` JSON output */
export interface DeviceKey {
  readonly id: string;
  readonly user_id: UserId;
  readonly plant_id: PlantId;
  readonly key: string;
  readonly label: string;
  readonly active: boolean;
}

/** POST /device-keys */
export interface CreateDeviceKeyRequest {
  readonly plant_id: string;
  readonly label?: string;
}

// ─── Health ─────────────────────────────────────────────

/** GET /health */
export interface HealthResponse {
  readonly status: string;
}
