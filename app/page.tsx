"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/api"
import { toast } from "sonner"

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_BASE_URL}/status`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error("Something went wrong on our end. Please try again later.")
        } else if (res.status === 503) {
          throw new Error("Service temporarily unavailable. Please try again in a moment.")
        } else {
          throw new Error("Failed to fetch status")
        }
      }

      const json = await res.json()
      setData(json)
      toast.success("Status fetched successfully")
    } catch (err: any) {
      const errorMessage =
        err.message === "Failed to fetch"
          ? "Unable to connect to server. Please check your connection."
          : err.message || "An unexpected error occurred"

      setError(errorMessage)
      setData({ error: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  return (
    <div className="p-6">
      <Button onClick={fetchStatus} className="mb-4" disabled={loading}>
        {loading ? "Checking..." : "Check Status"}
      </Button>

      {error && (
        <div className="mb-4 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <pre className="bg-muted p-4 rounded-md text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
