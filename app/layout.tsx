"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import FullscreenLoader from "@/components/fullscreen-loader"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initAuth = useAuthStore((s) => s.initAuth)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  if (isLoading) {
    return (
      <html>
        <body>
          <FullscreenLoader />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body>{children} <Toaster /> </body>
    </html>
  )
}
