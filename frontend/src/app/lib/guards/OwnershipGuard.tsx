"use client";

/**
 * @module guards/OwnershipGuard
 * Ensures the authenticated user can only access their own dashboard.
 *
 * Behaviour:
 * - "demo" userId → always allowed (no ownership check)
 * - Authenticated user whose ID matches the route userId → allowed
 * - Authenticated user whose ID does NOT match → redirects to their own dashboard
 * - Not authenticated → handled by ProtectedRoute (this guard only checks ownership)
 */

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner, Text } from "@fluentui/react-components";
import { ShieldErrorRegular } from "@fluentui/react-icons";
import Link from "next/link";
import { Button } from "@fluentui/react-components";
import { useAuth } from "../auth";

interface OwnershipGuardProps {
  userId: string;
  children: ReactNode;
}

export function OwnershipGuard({ userId, children }: OwnershipGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const isDemo = userId === "demo";
  const isOwner = isAuthenticated && user?.id === userId;
  const allowed = isDemo || isOwner;

  useEffect(() => {
    if (loading) return;
    // If authenticated but accessing someone else's dashboard, redirect to own
    if (isAuthenticated && !isDemo && !isOwner && user) {
      router.replace(`/dashboard/${user.id}`);
    }
  }, [loading, isAuthenticated, isDemo, isOwner, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Verifying access…</Text>
        </div>
      </div>
    );
  }

  if (!allowed && isAuthenticated) {
    // Redirecting — show spinner
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Redirecting to your dashboard…</Text>
        </div>
      </div>
    );
  }

  if (!allowed && !isAuthenticated && !isDemo) {
    // Not logged in accessing a real user's page (ProtectedRoute should catch this,
    // but as a safety net show an access denied)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ShieldErrorRegular className="text-5xl text-red-400" />
          <Text size={500} weight="semibold" className="text-foreground">
            Access Denied
          </Text>
          <Text size={300} className="text-muted">
            You don&apos;t have permission to view this dashboard.
          </Text>
          <Link href="/login">
            <Button appearance="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
