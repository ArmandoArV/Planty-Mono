/**
 * @module services/user
 * User profile management — get, update, delete the authenticated user.
 */

import type { HttpClient } from "../http-client";
import { Routes } from "../routes";
import type { User, UpdateProfileRequest, MessageResponse } from "../types";

export class UserService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch the authenticated user's profile (includes role association).
   *
   * @throws {ApiError} 401 if token missing/expired, 404 if user deleted
   */
  getProfile(signal?: AbortSignal): Promise<User> {
    return this.http.get<User>(Routes.User.Profile, signal);
  }

  /**
   * Update one or more profile fields.
   * Only non-undefined fields are persisted (PATCH semantics on the backend).
   *
   * @param data - fields to update (name, email, password)
   * @returns The updated user
   * @throws {ApiError} 400 on invalid body
   */
  updateProfile(data: UpdateProfileRequest, signal?: AbortSignal): Promise<User> {
    return this.http.put<User>(Routes.User.Profile, data, signal);
  }

  /**
   * Soft-delete the authenticated user account.
   *
   * @returns Confirmation message
   * @throws {ApiError} 500 on database error
   */
  deleteProfile(signal?: AbortSignal): Promise<MessageResponse> {
    return this.http.del<MessageResponse>(Routes.User.Profile, signal);
  }
}
