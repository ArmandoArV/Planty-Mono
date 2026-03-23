"use client";

/**
 * @module guards/GuestRoute
 * Wraps pages that should only be accessible to unauthenticated users (login, register).
 *
 * Behaviour:
 * - While auth is loading → shows spinner
 * - If already authenticated → redirects to dashboard
 * - If not authenticated → renders children
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner, Text } from "@fluentui/react-components";
import { useAuth } from "../auth";

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && user) {
      // If there's a ?redirect= param, go there; otherwise go to user's dashboard
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.replace(decodeURIComponent(redirect));
      } else {
        router.replace(`/dashboard/${user.id}`);
      }
    }
  }, [loading, isAuthenticated, user, router, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Checking session…</Text>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Redirecting to dashboard…</Text>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
