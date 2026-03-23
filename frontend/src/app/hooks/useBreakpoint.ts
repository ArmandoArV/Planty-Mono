"use client";

import { useMediaQuery } from "./useMediaQuery";

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, string> = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

/**
 * Returns a set of boolean flags for each Tailwind breakpoint.
 *
 * @example
 * const { isMd, isLg } = useBreakpoint();
 */
export function useBreakpoint() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2xl = useMediaQuery(breakpoints["2xl"]);

  return { isSm, isMd, isLg, isXl, is2xl } as const;
}
