"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProgressiveForm } from "@/components/progressive-form"
import { API_BASE_URL } from "@/lib/api"
import { Block } from "@/types/form"

// Normalize blocks - convert null children to empty arrays
const normalizeBlocks = (blocks: any[]): Block[] => {
  if (!blocks) return []
  return blocks.map((block) => ({
    ...block,
    children: normalizeBlocks(block.children || []),
  }))
}

export default function PublicFormPage() {
  const params = useParams()
  const slug = params.slug as string

  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/f/${slug}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch form")
        }

        const data = await response.json()

        // Normalize the blocks data
        if (data.flow?.blocks) {
          data.flow.blocks = normalizeBlocks(data.flow.blocks)
        }

        setFormData(data)
      } catch (err: any) {
        setError(err.message || "Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchForm()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading form</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    )
  }

  if (!formData.accepting_responses) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">This form is not accepting responses</p>
        </div>
      </div>
    )
  }

  return (
    <ProgressiveForm
      initialBlocks={formData.flow?.blocks || []}
      formTitle={formData.title}
      formDescription={formData.description}
    />
  )
}
