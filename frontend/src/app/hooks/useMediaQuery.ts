"use client";

import { useState, useEffect } from "react";

/**
 * Reactive media-query hook. Returns `true` when the query matches.
 * Always returns `false` during SSR / first render to avoid hydration mismatch,
 * then syncs with the real value after mount.
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = () => setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
