"use client";

import { Skeleton, SkeletonItem } from "@fluentui/react-components";

export default function DetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Title skeleton */}
      <Skeleton className="mb-8">
        <div className="flex items-center gap-3">
          <SkeletonItem style={{ width: 180, height: 32 }} />
          <SkeletonItem style={{ width: 90, height: 22, borderRadius: 12 }} />
        </div>
        <SkeletonItem style={{ width: 320, height: 16, marginTop: 8 }} />
      </Skeleton>

      {/* Top row — 3 sensor cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <SkeletonItem shape="circle" style={{ width: 20, height: 20 }} />
              <SkeletonItem style={{ width: 100, height: 16 }} />
            </div>
            <SkeletonItem
              shape="circle"
              style={{ width: 140, height: 140 }}
            />
          </Skeleton>
        ))}
      </div>

      {/* Bottom row — chart + status */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Chart skeleton */}
        <Skeleton className="col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <SkeletonItem shape="circle" style={{ width: 20, height: 20 }} />
            <SkeletonItem style={{ width: 130, height: 16 }} />
          </div>
          <SkeletonItem style={{ width: "100%", height: 160, borderRadius: 8 }} />
          <div className="mt-2 flex justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonItem key={i} style={{ width: 36, height: 12 }} />
            ))}
          </div>
        </Skeleton>

        {/* Status panel skeleton */}
        <Skeleton className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <SkeletonItem shape="circle" style={{ width: 20, height: 20 }} />
            <SkeletonItem style={{ width: 90, height: 16 }} />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonItem shape="circle" style={{ width: 16, height: 16 }} />
                <SkeletonItem style={{ width: "100%", height: 14 }} />
              </div>
            ))}
          </div>
        </Skeleton>
      </div>
    </div>
  );
}
