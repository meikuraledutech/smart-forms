"use client"

import Image from "next/image"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormCardProps {
  title: string
  description?: string
  status: string
  isTemplate?: boolean
  onClick?: () => void
  onClone?: () => void
}

export function FormCard({ title, description, status, isTemplate, onClick, onClone }: FormCardProps) {
  const handleClick = () => {
    if (isTemplate && onClone) {
      onClone()
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm cursor-pointer transition-colors hover:bg-accent overflow-hidden",
        "min-h-[280px]"
      )}
    >
      {/* Preview Image */}
      <div className="w-full h-32 relative bg-white">
        <Image
          src="/img/Checklist.jpg"
          alt={title}
          fill
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex gap-1">
            {isTemplate && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                TEMPLATE
              </span>
            )}
            {!isTemplate && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {status}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-semibold leading-tight line-clamp-2 mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || "No description"}
        </p>
      </div>
    </div>
  )
}
