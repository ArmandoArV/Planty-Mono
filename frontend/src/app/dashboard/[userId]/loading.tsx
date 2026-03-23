"use client";

import { Skeleton, SkeletonItem } from "@fluentui/react-components";

export default function OverviewLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Title skeleton */}
      <Skeleton className="mb-8">
        <SkeletonItem style={{ width: 200, height: 32 }} />
        <SkeletonItem style={{ width: 340, height: 16, marginTop: 8 }} />
      </Skeleton>

      {/* Card grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-2xl border border-border bg-surface p-0 shadow-sm">
            {/* Image placeholder */}
            <SkeletonItem
              style={{ width: "100%", height: 180, borderRadius: "16px 16px 0 0" }}
            />
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <SkeletonItem style={{ width: 140, height: 18 }} />
                  <SkeletonItem style={{ width: 90, height: 14 }} />
                </div>
                <SkeletonItem style={{ width: 72, height: 22, borderRadius: 12 }} />
              </div>

              {/* Mini gauge + stats */}
              <div className="flex items-center gap-4">
                <SkeletonItem
                  shape="circle"
                  style={{ width: 64, height: 64 }}
                />
                <div className="flex flex-col gap-2">
                  <SkeletonItem style={{ width: 80, height: 14 }} />
                  <SkeletonItem style={{ width: 60, height: 14 }} />
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
                <SkeletonItem style={{ width: "100%", height: 32, borderRadius: 6 }} />
                <SkeletonItem style={{ width: 80, height: 32, borderRadius: 6 }} />
              </div>
            </div>
          </Skeleton>
        ))}
      </div>
    </div>
  );
}
