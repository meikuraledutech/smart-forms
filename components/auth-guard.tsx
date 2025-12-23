"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import FullscreenLoader from "@/components/fullscreen-loader"

type AuthGuardProps = {
    children: React.ReactNode
    requireAuth?: boolean
    guestOnly?: boolean
}

export default function AuthGuard({
    children,
    requireAuth,
    guestOnly,
}: AuthGuardProps) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuthStore()

    useEffect(() => {
        if (isLoading) return

        // Protected route
        if (requireAuth && !isAuthenticated) {
            router.replace("/login")
        }

        // Guest-only route
        if (guestOnly && isAuthenticated) {
            router.replace("/dashboard")
        }
    }, [isAuthenticated, isLoading, requireAuth, guestOnly, router])

    // While checking auth or redirecting
    if (isLoading) {
        return <FullscreenLoader />
    }

    // Block render during redirect
    if (requireAuth && !isAuthenticated) return null
    if (guestOnly && isAuthenticated) return null

    return <>{children}</>
}
