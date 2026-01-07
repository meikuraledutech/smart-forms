"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import AuthGuard from "@/components/auth-guard"
import { NavActions } from "@/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FullscreenLoader from "@/components/fullscreen-loader"

export default function PricingPage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const router = useRouter()

  useEffect(() => {
    // Redirect if not super admin
    if (!isLoading && user?.role !== "super_admin") {
      router.replace("/not-found")
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return <FullscreenLoader />
  }

  // Show nothing while redirecting
  if (user?.role !== "super_admin") {
    return null
  }

  // Super admin content
  return (
    <AuthGuard requireAuth>
      <SidebarProvider>
        <AppSidebar activeItem="Pricing" />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Pricing
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
              <NavActions />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="mx-auto w-full max-w-6xl">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Management</CardTitle>
                  <CardDescription>
                    Manage subscription plans and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      Pricing management UI coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
