"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/api"

export default function Home() {
  const [data, setData] = useState<any>(null)

  const fetchStatus = async () => {
    const res = await fetch(`${API_BASE_URL}/status`)
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  return (
    <div className="p-6">
      <Button onClick={fetchStatus} className="mb-4">
        Check Status
      </Button>

      <pre className="bg-muted p-4 rounded-md text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
