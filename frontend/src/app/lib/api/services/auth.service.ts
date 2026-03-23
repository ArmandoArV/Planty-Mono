/**
 * @module services/auth
 * Authentication service — register, login, JWT management.
 */

import type { HttpClient } from "../http-client";
import { TokenManager } from "../token-manager";
import { Routes } from "../routes";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
} from "../types";

export class AuthService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Register a new user account.
   * Automatically stores the returned JWT for subsequent requests.
   *
   * @param data - name, email, password, optional role
   * @returns The created user and JWT token
   * @throws {ApiError} 400 if fields missing, 409 if email taken
   */
  async register(data: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const res = await this.http.post<AuthResponse>(Routes.Auth.Register, data, signal);
    TokenManager.set(res.token);
    TokenManager.setUser(res.user);
    return res;
  }

  /**
   * Authenticate an existing user.
   * Automatically stores the returned JWT for subsequent requests.
   *
   * @param data - email and password
   * @returns The authenticated user and JWT token
   * @throws {ApiError} 401 on invalid credentials
   */
  async login(data: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    const res = await this.http.post<AuthResponse>(Routes.Auth.Login, data, signal);
    TokenManager.set(res.token);
    TokenManager.setUser(res.user);
    return res;
  }

  /**
   * Clear the JWT and cached user from storage.
   * Does NOT call the backend (stateless JWT — no server-side invalidation).
   */
  logout(): void {
    TokenManager.clear();
  }

  /**
   * Validate the stored token by fetching the current user profile.
   * Returns the user if valid, or null if the token is expired/invalid.
   */
  async validate(signal?: AbortSignal): Promise<User | null> {
    if (!TokenManager.exists) return null;
    try {
      const user = await this.http.get<User>(Routes.User.Profile, signal);
      TokenManager.setUser(user);
      return user;
    } catch {
      TokenManager.clear();
      return null;
    }
  }

  /** Check whether a token currently exists in storage (sync, no network). */
  get isAuthenticated(): boolean {
    return TokenManager.exists;
  }
}
