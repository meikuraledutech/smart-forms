"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function FormCardSkeleton() {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm overflow-hidden",
        "min-h-[280px]"
      )}
    >
      {/* Preview Image Skeleton */}
      <Skeleton className="w-full h-32 rounded-none" />

      {/* Content Skeleton */}
      <div className="px-6 py-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </div>
    </div>
  )
}
