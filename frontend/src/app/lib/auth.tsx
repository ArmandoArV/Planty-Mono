"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  api,
  TokenManager,
  ApiError,
  isApiError,
  type User,
  type AuthResponse,
} from "./api";

// ─── Types ──────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, role?: string) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ─── Context ────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Synchronous hydration from localStorage — no effect needed
    const token = TokenManager.get();
    if (!token) return { user: null, token: null, loading: false };
    const cached = TokenManager.getUser<User>();
    return { user: cached, token, loading: !!token };
  });

  // Validate the stored token against the backend on mount
  useEffect(() => {
    if (!state.token) return;

    let cancelled = false;
    api.auth
      .validate()
      .then((u) => {
        if (cancelled) return;
        if (u) {
          setState({ user: u, token: state.token, loading: false });
        } else {
          setState({ user: null, token: null, loading: false });
        }
      })
      .catch(() => {
        if (cancelled) return;
        TokenManager.clear();
        setState({ user: null, token: null, loading: false });
      });

    return () => { cancelled = true; };
    // Only run once on mount — state.token is from the lazy initialiser
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for token expiry / external logout
  useEffect(() => {
    return TokenManager.on("expired", () => {
      setState({ user: null, token: null, loading: false });
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setState({ user: res.user, token: res.token, loading: false });
    return res;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role?: string) => {
      const res = await api.auth.register({ name, email, password, role });
      setState({ user: res.user, token: res.token, loading: false });
      return res;
    },
    [],
  );

  const logout = useCallback(() => {
    api.auth.logout();
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        isAuthenticated: !!state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

export { ApiError, isApiError };
