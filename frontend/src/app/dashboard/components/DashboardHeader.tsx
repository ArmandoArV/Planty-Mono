"use client";

import { Text, Badge } from "@fluentui/react-components";
import {
  ArrowLeftRegular,
  WifiSettingsRegular,
  PersonRegular,
} from "@fluentui/react-icons";
import Link from "next/link";
import Image from "next/image";
import { useDashboardShell } from "../context/DashboardShellContext";

export default function DashboardHeader() {
  const { config } = useDashboardShell();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Link
            href={config.backHref}
            className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeftRegular className="text-base" />
            <span className="hidden sm:inline">{config.backLabel}</span>
          </Link>

          <div className="h-5 w-px bg-border" />

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Images/logoPlanty.png"
              alt="Planty logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <Text weight="bold" size={400}>
              {config.title}
            </Text>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {config.rightContent ?? (
            <>
              <WifiSettingsRegular className="text-lg text-accent" />
              <Badge appearance="filled" color="success" size="small">
                Live
              </Badge>
              <div className="hidden items-center gap-2 border-l border-border pl-3 md:flex">
                <PersonRegular className="text-base text-muted" />
                <Text size={300} className="text-muted">
                  Dashboard
                </Text>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
