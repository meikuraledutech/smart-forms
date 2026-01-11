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
          <title>Smart Forms - Build Intelligent Forms with Conditional Logic</title>
          <meta name="description" content="Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Create personalized forms with dynamic question flows, multiple choice options, and text inputs. Perfect for surveys, assessments, and data collection." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#6366F1" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/favicon.svg" />
          <link rel="manifest" href="/manifest.json" />
          <meta property="og:image" content="https://smartforms.app/img/Checklist.jpg" />
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
        <title>Smart Forms - Build Intelligent Forms with Conditional Logic</title>
        <meta name="description" content="Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Create personalized forms with dynamic question flows, multiple choice options, and text inputs. Perfect for surveys, assessments, and data collection." />
        <meta name="keywords" content="smart forms, conditional forms, dynamic forms, form builder, survey builder, questionnaire, branching logic, conditional logic, online forms, form creator" />
        <meta name="author" content="Smart Forms" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6366F1" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartforms.app" />
        <meta property="og:title" content="Smart Forms - Build Intelligent Forms with Conditional Logic" />
        <meta property="og:description" content="Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Ask only what matters, collect less data, gain deeper insights." />
        <meta property="og:image" content="https://smartforms.app/img/Checklist.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Smart Forms - Intelligent Form Builder" />
        <meta property="og:site_name" content="Smart Forms" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://smartforms.app" />
        <meta name="twitter:title" content="Smart Forms - Build Intelligent Forms with Conditional Logic" />
        <meta name="twitter:description" content="Stop asking irrelevant questions. Build intelligent, tree-structured forms with conditional branching. Ask only what matters, collect less data, gain deeper insights." />
        <meta name="twitter:image" content="https://smartforms.app/img/Checklist.jpg" />
        <meta name="twitter:image:alt" content="Smart Forms - Intelligent Form Builder" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://smartforms.app" />
      </head>
      <body className={firaSans.variable}>{children} <Toaster /> </body>
    </html>
  )
}
