"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import AuthGuard from "@/components/auth-guard"
import { NavActions } from "@/components/nav-actions"
import { AddPlanDialog } from "@/components/add-plan-dialog"
import { EditPlanDialog } from "@/components/edit-plan-dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import FullscreenLoader from "@/components/fullscreen-loader"
import api from "@/lib/axios"
import { getErrorMessage } from "@/lib/error-handler"

interface Plan {
  id: string
  name: string
  plan_type: string
  price_inr: number
  features: {
    can_export?: boolean
    data_retention_days?: number
    full_analytics?: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function PricingPage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    // Redirect if not super admin
    if (!isLoading && user?.role !== "super_admin") {
      router.replace("/not-found")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchPlans()
    }
  }, [user])

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true)
      const response = await api.get("/admin/plans")
      setPlans(response.data.plans)
    } catch (error: any) {
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to load plans")
      }
    } finally {
      setLoadingPlans(false)
    }
  }

  const formatPrice = (priceInPaise: number) => {
    const rupees = priceInPaise / 100
    return `₹${rupees.toLocaleString("en-IN")}`
  }

  const getPlanTypeBadge = (planType: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      free: "secondary",
      monthly: "default",
      yearly: "outline",
    }
    return (
      <Badge variant={variants[planType] || "default"}>
        {planType.charAt(0).toUpperCase() + planType.slice(1)}
      </Badge>
    )
  }

  const handleToggleActive = async (plan: Plan) => {
    // Optimistic update - update UI immediately
    const originalState = plan.is_active
    const newState = !plan.is_active

    setPlans(prevPlans =>
      prevPlans.map(p =>
        p.id === plan.id ? { ...p, is_active: newState } : p
      )
    )

    try {
      await api.patch(`/admin/plans/${plan.id}`, {
        is_active: newState,
      })
      toast.success(`Plan ${newState ? "activated" : "deactivated"} successfully`)
    } catch (error: any) {
      // Revert to original state on error
      setPlans(prevPlans =>
        prevPlans.map(p =>
          p.id === plan.id ? { ...p, is_active: originalState } : p
        )
      )

      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to update plan status")
      }
    }
  }

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan)
    setEditDialogOpen(true)
  }

  const handlePlanUpdated = (updatedPlan: Plan) => {
    // Optimistic update - update only the edited plan in the list
    setPlans(prevPlans =>
      prevPlans.map(p =>
        p.id === updatedPlan.id ? updatedPlan : p
      )
    )
  }

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
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1.5">
                    <CardTitle>Pricing Management</CardTitle>
                    <CardDescription>
                      Manage subscription plans and pricing
                    </CardDescription>
                  </div>
                  <AddPlanDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onPlanCreated={fetchPlans}
                  />
                </CardHeader>
                <CardContent>
                  {loadingPlans ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">Loading plans...</p>
                    </div>
                  ) : plans.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">
                        No plans found. Create your first plan to get started.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Features</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell className="font-medium">
                              {plan.name}
                            </TableCell>
                            <TableCell>{getPlanTypeBadge(plan.plan_type)}</TableCell>
                            <TableCell>{formatPrice(plan.price_inr)}</TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground">
                                {plan.features.data_retention_days === 0
                                  ? "Unlimited retention"
                                  : `${plan.features.data_retention_days} days retention`}
                                {plan.features.can_export && ", Export"}
                                {plan.features.full_analytics && ", Analytics"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={plan.is_active}
                                  onCheckedChange={() => handleToggleActive(plan)}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {plan.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(plan.created_at).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(plan)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Edit Dialog */}
      <EditPlanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        plan={selectedPlan}
        onPlanUpdated={handlePlanUpdated}
      />
    </AuthGuard>
  )
}
