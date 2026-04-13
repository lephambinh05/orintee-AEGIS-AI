'use client';

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("skeleton rounded-md", className)} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 overflow-hidden">
      {/* Left Column - Chart Skeleton */}
      <div className="card !p-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-7 w-10" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="w-full h-full" />
        </div>
      </div>

      {/* Right Column - Controls Skeletons */}
      <div className="flex flex-col gap-3">
        {/* Score Gauge Skeleton */}
        <div className="card flex flex-col items-center">
          <Skeleton className="h-4 w-24 self-start mb-4" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        
        {/* Intelligence Skeleton */}
        <div className="card">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        
        {/* Risk Guard Skeleton */}
        <div className="card">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>

        {/* Button Skeleton */}
        <Skeleton className="h-[52px] w-full rounded-lg" />
      </div>
    </div>
  );
}
