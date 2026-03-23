/**
 * @module api/token-manager
 * Centralised JWT token storage with an event-driven notification system.
 *
 * The HttpClient injects the token from here; the AuthProvider listens
 * for `change` events so a 401 response auto-clears state everywhere.
 */

const TOKEN_KEY = "planty_token";
const USER_KEY  = "planty_user";

// ─── Event system ───────────────────────────────────────

type TokenEvent = "change" | "expired";
type TokenListener = (token: string | null) => void;

const listeners = new Map<TokenEvent, Set<TokenListener>>();

function emit(event: TokenEvent, token: string | null): void {
  listeners.get(event)?.forEach((fn) => fn(token));
}

// ─── Public API ─────────────────────────────────────────

export const TokenManager = {

  /** Retrieve the stored JWT. Returns null on the server or if no token is set. */
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Persist a new JWT and notify all listeners. */
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    emit("change", token);
  },

  /** Remove the JWT and notify listeners (e.g. on logout or 401). */
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    emit("change", null);
    emit("expired", null);
  },

  /** Cache the full user JSON so the AuthProvider can hydrate instantly. */
  setUser(user: unknown): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Storage full or private browsing — silently ignore
    }
  },

  /** Retrieve the cached user without a network call. */
  getUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  /** Subscribe to token lifecycle events. Returns an unsubscribe function. */
  on(event: TokenEvent, listener: TokenListener): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(listener);
    return () => { listeners.get(event)?.delete(listener); };
  },

  /** True if a non-empty token exists in storage. */
  get exists(): boolean {
    return !!this.get();
  },

} as const;
