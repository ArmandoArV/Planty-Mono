/**
 * @module api/routes
 * Type-safe route definitions — exact mirror of backend/routes/routes.go.
 *
 * Static routes are string literals; parameterised routes are pure functions
 * that accept branded UUID types to prevent parameter mix-ups.
 */

import type { UserId, PlantId, RoleId } from "./types";

// ─── Route Map ──────────────────────────────────────────

export const Routes = {
  // ── Public ──────────────────────────────────────────
  Health: "/health",

  Auth: {
    Register: "/auth/register",
    Login:    "/auth/login",
  },

  // ── Protected (Bearer token required) ──────────────
  User: {
    Profile: "/user/profile",
  },

  Plants: {
    List:       "/plants",
    Create:     "/plants",
    Get:        (id: PlantId) => `/plants/${id}` as const,
    Update:     (id: PlantId) => `/plants/${id}` as const,
    Delete:     (id: PlantId) => `/plants/${id}` as const,
    TogglePump: (id: PlantId) => `/plants/${id}/pump` as const,
  },

  Readings: {
    List:   (plantId: PlantId) => `/plants/${plantId}/readings` as const,
    Create: (plantId: PlantId) => `/plants/${plantId}/readings` as const,
    Latest: (plantId: PlantId) => `/plants/${plantId}/readings/latest` as const,
  },

  Roles: {
    List:   "/roles",
    Create: "/roles",
    Get:    (id: RoleId) => `/roles/${id}` as const,
    Update: (id: RoleId) => `/roles/${id}` as const,
    Delete: (id: RoleId) => `/roles/${id}` as const,
  },

  // ── Admin only ─────────────────────────────────────
  Admin: {
    AssignRole: (userId: UserId) => `/users/${userId}/role` as const,
  },

  // ── Device Keys (managed via JWT, used by Arduino) ─
  DeviceKeys: {
    List:   "/device-keys",
    Create: "/device-keys",
    Revoke: (keyId: string) => `/device-keys/${keyId}` as const,
  },
} as const;
