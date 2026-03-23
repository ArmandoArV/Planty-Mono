"use client";

import { Suspense } from "react";
import { DashboardShellProvider } from "./context/DashboardShellContext";
import DashboardHeader from "./components/DashboardHeader";
import DashboardFooter from "./components/DashboardFooter";
import { ProtectedRoute } from "@/app/lib/guards";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowDemo>
      <DashboardShellProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <DashboardHeader />
          <Suspense>
            {children}
          </Suspense>
          <DashboardFooter />
        </div>
      </DashboardShellProvider>
    </ProtectedRoute>
  );
}
