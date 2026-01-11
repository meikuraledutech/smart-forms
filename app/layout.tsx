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
        <head>
          <title>Smart Forms</title>
          <meta name="description" content="Build intelligent forms with conditional logic and dynamic question flows" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#6366F1" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/favicon.svg" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className={firaSans.variable}>
          <FullscreenLoader />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>Smart Forms - Build Intelligent Forms</title>
        <meta name="description" content="Build intelligent forms with conditional logic and dynamic question flows. Create custom forms with options, text inputs, and nested questions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6366F1" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Smart Forms - Build Intelligent Forms" />
        <meta property="og:description" content="Build intelligent forms with conditional logic and dynamic question flows" />
        <meta property="og:site_name" content="Smart Forms" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Smart Forms - Build Intelligent Forms" />
        <meta name="twitter:description" content="Build intelligent forms with conditional logic and dynamic question flows" />
      </head>
      <body className={firaSans.variable}>{children} <Toaster /> </body>
    </html>
  )
}
