"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShowMoreCardProps {
  isExpanded: boolean
  onClick: () => void
}

export function ShowMoreCard({ isExpanded, onClick }: ShowMoreCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card text-card-foreground flex flex-col items-center justify-center rounded-xl border shadow-sm cursor-pointer transition-colors hover:bg-accent",
        "min-h-[280px]"
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {isExpanded ? (
          <>
            <ChevronUp className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Show Less</p>
          </>
        ) : (
          <>
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Show More</p>
          </>
        )}
      </div>
    </div>
  )
}
