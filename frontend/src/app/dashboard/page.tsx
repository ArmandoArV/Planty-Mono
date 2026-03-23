"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";
import { Spinner, Text } from "@fluentui/react-components";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && user) {
      router.replace(`/dashboard/${user.id}`);
    } else {
      router.replace("/dashboard/demo");
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="large" />
        <Text size={300} className="text-muted">Redirecting…</Text>
      </div>
    </main>
  );
}
