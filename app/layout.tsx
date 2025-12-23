"use client"

import { useEffect } from "react"
import { Fira_Sans } from "next/font/google"
import { useAuthStore } from "@/lib/auth-store"
import FullscreenLoader from "@/components/fullscreen-loader"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

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
        <body className={firaSans.variable}>
          <FullscreenLoader />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={firaSans.variable}>{children} <Toaster /> </body>
    </html>
  )
}
