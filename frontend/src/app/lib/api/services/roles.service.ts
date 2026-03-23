/**
 * @module services/roles
 * Role management — list/CRUD (admin-only for mutations) and role assignment.
 */

import type { HttpClient } from "../http-client";
import { Routes } from "../routes";
import type {
  Role,
  RoleId,
  UserId,
  User,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  MessageResponse,
} from "../types";

export class RolesService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all available roles (any authenticated user).
   *
   * @returns Roles ordered by description ascending
   */
  list(signal?: AbortSignal): Promise<Role[]> {
    return this.http.get<Role[]>(Routes.Roles.List, signal);
  }

  /**
   * Get a single role by ID (any authenticated user).
   *
   * @param id - branded RoleId
   * @throws {ApiError} 404 if not found
   */
  get(id: RoleId, signal?: AbortSignal): Promise<Role> {
    return this.http.get<Role>(Routes.Roles.Get(id), signal);
  }

  /**
   * Create a new role (admin only).
   *
   * @param data - role description (must be unique)
   * @returns The created role
   * @throws {ApiError} 403 if not admin, 409 if duplicate
   */
  create(data: CreateRoleRequest, signal?: AbortSignal): Promise<Role> {
    return this.http.post<Role>(Routes.Roles.Create, data, signal);
  }

  /**
   * Update a role's description (admin only).
   *
   * @param id - branded RoleId
   * @param data - new description
   * @returns The updated role
   * @throws {ApiError} 403 if not admin, 404 if not found
   */
  update(id: RoleId, data: UpdateRoleRequest, signal?: AbortSignal): Promise<Role> {
    return this.http.put<Role>(Routes.Roles.Update(id), data, signal);
  }

  /**
   * Delete a role (admin only).
   *
   * @param id - branded RoleId
   * @returns Confirmation message
   * @throws {ApiError} 403 if not admin, 404 if not found
   */
  delete(id: RoleId, signal?: AbortSignal): Promise<MessageResponse> {
    return this.http.del<MessageResponse>(Routes.Roles.Delete(id), signal);
  }

  /**
   * Assign a role to a user (admin only).
   *
   * @param userId - target user's branded UserId
   * @param roleId - new role's branded RoleId
   * @returns The updated user with new role association
   * @throws {ApiError} 403 if not admin, 404 if user or role not found
   */
  assign(userId: UserId, roleId: RoleId, signal?: AbortSignal): Promise<User> {
    const body: AssignRoleRequest = { role_id: roleId };
    return this.http.patch<User>(Routes.Admin.AssignRole(userId), body, signal);
  }
}
