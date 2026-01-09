"use client"

import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import FullscreenLoader from "@/components/fullscreen-loader"
import { FileText, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getErrorMessage } from "@/lib/error-handler"

interface Form {
  id: string
  title: string
  description: string
  status: string
  is_template?: boolean
  created_at: string
  updated_at: string
}

export default function TemplatesPage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const router = useRouter()

  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [confirmFormName, setConfirmFormName] = useState("")
  const [pendingToggle, setPendingToggle] = useState<{ formId: string; currentValue: boolean; formTitle: string } | null>(null)

  useEffect(() => {
    // Redirect if not super admin
    if (!isLoading && user?.role !== "super_admin") {
      router.replace("/not-found")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchForms()
    }
  }, [user])

  const fetchForms = async () => {
    try {
      setLoading(true)
      const response = await api.get("/forms")
      setForms(response.data.items || [])
    } catch (error: any) {
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to load forms")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleClick = (formId: string, currentValue: boolean, formTitle: string) => {
    setPendingToggle({ formId, currentValue, formTitle })
    setConfirmFormName("")
    setConfirmDialogOpen(true)
  }

  const handleConfirmToggle = async () => {
    if (!pendingToggle) return

    const { formId, currentValue } = pendingToggle

    try {
      setTogglingId(formId)
      setConfirmDialogOpen(false)

      await api.patch(`/admin/forms/${formId}/template`, {
        is_template: !currentValue
      })

      // Update local state
      setForms(forms.map(form =>
        form.id === formId
          ? { ...form, is_template: !currentValue }
          : form
      ))

      toast.success(
        !currentValue
          ? "Form marked as template"
          : "Template status removed"
      )
    } catch (error: any) {
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to update template status")
      }
    } finally {
      setTogglingId(null)
      setPendingToggle(null)
      setConfirmFormName("")
    }
  }

  const handleCancelToggle = () => {
    setConfirmDialogOpen(false)
    setPendingToggle(null)
    setConfirmFormName("")
  }

  // Show loading state
  if (isLoading) {
    return <FullscreenLoader />
  }

  // Show nothing while redirecting
  if (user?.role !== "super_admin") {
    return null
  }

  // Separate forms into published (not templates) and active templates
  const publishedForms = forms.filter(f => f.status === "published" && !f.is_template)
  const activeTemplates = forms.filter(f => f.is_template)

  // Super admin content
  return (
    <AuthGuard requireAuth>
      <SidebarProvider>
        <AppSidebar activeItem="Templates" />
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
                      Templates
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
            <div className="mx-auto w-full max-w-6xl space-y-8">
              {/* Published Forms Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Published Forms</CardTitle>
                  <CardDescription>
                    Mark published forms as templates to make them available to all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">Loading forms...</p>
                    </div>
                  ) : publishedForms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No published forms available</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Publish a form first to mark it as a template
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Form Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Mark as Template</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {publishedForms.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">{form.title}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {form.description || "No description"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-3">
                                <Label
                                  htmlFor={`template-${form.id}`}
                                  className="text-sm cursor-pointer"
                                >
                                  Template
                                </Label>
                                <Switch
                                  id={`template-${form.id}`}
                                  checked={false}
                                  disabled={togglingId === form.id}
                                  onCheckedChange={() => handleToggleClick(form.id, false, form.title)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Active Templates Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Templates</CardTitle>
                  <CardDescription>
                    Templates that are currently available to all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-muted-foreground">Loading templates...</p>
                    </div>
                  ) : activeTemplates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <LayoutTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active templates</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mark published forms as templates to see them here
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Template Active</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeTemplates.map((form) => (
                          <TableRow key={form.id}>
                            <TableCell className="font-medium">{form.title}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {form.description || "No description"}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                TEMPLATE
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-3">
                                <Label
                                  htmlFor={`template-active-${form.id}`}
                                  className="text-sm cursor-pointer"
                                >
                                  Active
                                </Label>
                                <Switch
                                  id={`template-active-${form.id}`}
                                  checked={true}
                                  disabled={togglingId === form.id}
                                  onCheckedChange={() => handleToggleClick(form.id, true, form.title)}
                                />
                              </div>
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

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.currentValue ? "Disable Template" : "Enable Template"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.currentValue ? (
                <>
                  Are you sure you want to remove template status? This template will no longer be available to users.
                  <br /><br />
                  Type <strong>{pendingToggle?.formTitle}</strong> to confirm.
                </>
              ) : (
                <>
                  Are you sure you want to mark this form as a template? It will be available to all users.
                  <br /><br />
                  Type <strong>{pendingToggle?.formTitle}</strong> to confirm.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter form name"
              value={confirmFormName}
              onChange={(e) => setConfirmFormName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && confirmFormName === pendingToggle?.formTitle) {
                  handleConfirmToggle()
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelToggle}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleConfirmToggle}
              disabled={confirmFormName !== pendingToggle?.formTitle}
              variant={pendingToggle?.currentValue ? "destructive" : "default"}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  )
}
