"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface DashboardShellConfig {
  backHref: string;
  backLabel: string;
  title: string;
  rightContent?: ReactNode;
}

const defaultConfig: DashboardShellConfig = {
  backHref: "/",
  backLabel: "Home",
  title: "Dashboard",
};

interface DashboardShellContextValue {
  config: DashboardShellConfig;
  setConfig: (config: DashboardShellConfig) => void;
}

const DashboardShellContext = createContext<DashboardShellContextValue>({
  config: defaultConfig,
  setConfig: () => {},
});

export function DashboardShellProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<DashboardShellConfig>(defaultConfig);

  const setConfig = useCallback((c: DashboardShellConfig) => {
    setConfigState(c);
  }, []);

  return (
    <DashboardShellContext.Provider value={{ config, setConfig }}>
      {children}
    </DashboardShellContext.Provider>
  );
}

export function useDashboardShell() {
  return useContext(DashboardShellContext);
}
