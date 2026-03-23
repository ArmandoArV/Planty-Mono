/**
 * @module api.caller
 * Backward-compatible re-export facade.
 *
 * Existing imports like:
 *   import api, { ApiError, type Plant } from "@/app/lib/api.caller";
 *
 * continue to work — they now delegate to the modular api/ package.
 *
 * For new code, prefer importing from "@/app/lib/api" directly:
 *   import { api, isApiError, type Plant } from "@/app/lib/api";
 */

export {
  api as default,
  api,
  ApiError,
  isApiError,
  TokenManager,
} from "./api";

// Legacy named helpers (map to TokenManager methods)
export { TokenManager as _tm } from "./api";
import { TokenManager } from "./api";
export const getToken   = TokenManager.get.bind(TokenManager);
export const setToken   = TokenManager.set.bind(TokenManager);
export const clearToken = TokenManager.clear.bind(TokenManager);

// Re-export all types so existing `import type { X } from "api.caller"` works
export type {
  Role,
  User,
  Plant,
  SensorReading,
  AuthResponse,
  MessageResponse,
  PlantMood,
  RoleKind,
  UserId,
  PlantId,
  RoleId,
  ReadingId,
  ISOTimestamp,
  HealthResponse,
  ErrorBody,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  CreatePlantRequest,
  UpdatePlantRequest,
  CreateReadingRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
} from "./api";
