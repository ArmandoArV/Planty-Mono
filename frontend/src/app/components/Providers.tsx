"use client";

import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { AuthProvider } from "../lib/auth";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FluentProvider theme={webLightTheme}>
      <AuthProvider>{children}</AuthProvider>
    </FluentProvider>
  );
}
