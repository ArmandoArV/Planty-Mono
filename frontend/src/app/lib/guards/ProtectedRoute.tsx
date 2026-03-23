"use client";

/**
 * @module guards/ProtectedRoute
 * Wraps content that requires authentication.
 *
 * Behaviour:
 * - While auth is loading → shows skeleton / spinner
 * - If not authenticated → redirects to /login (with ?redirect= for return)
 * - If authenticated → renders children
 * - "demo" userId is always allowed (no auth required)
 */

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner, Text } from "@fluentui/react-components";
import { useAuth } from "../auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Allow unauthenticated access for demo routes */
  allowDemo?: boolean;
}

export function ProtectedRoute({ children, allowDemo = true }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isDemo = allowDemo && pathname.includes("/demo");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !isDemo) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, isAuthenticated, isDemo, pathname, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Verifying session…</Text>
        </div>
      </div>
    );
  }

  // Not authenticated and not demo → redirect in progress
  if (!isAuthenticated && !isDemo) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Redirecting to login…</Text>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
