"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Trash2 } from "lucide-react"

import AuthGuard from "@/components/auth-guard"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { NavActions } from "@/components/nav-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import api from "@/lib/axios"
import { getErrorMessage } from "@/lib/error-handler"

interface Form {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

export default function FormDetailPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("questions")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Settings form state
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editStatus, setEditStatus] = useState<"draft" | "published">("draft")

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(`/forms/${formId}`)
        setForm(response.data)
        // Initialize settings state
        setEditTitle(response.data.title)
        setEditDescription(response.data.description)
        setEditStatus(response.data.status)
      } catch (err: any) {
        const serverError = getErrorMessage(err)
        if (serverError) {
          setError(serverError)
          toast.error(serverError)
        } else if (err.response?.status === 404) {
          setError("Form not found")
          toast.error("Form not found")
        } else {
          setError("Failed to load form")
          toast.error("Failed to load form")
        }
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      fetchForm()
    }
  }, [formId])

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "questions"
      setActiveTab(hash)
    }

    // Set initial tab from hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Sync form data to edit fields when switching to settings tab
  useEffect(() => {
    if (form && activeTab === "settings") {
      setEditTitle(form.title)
      setEditDescription(form.description || "")
      setEditStatus(form.status as "draft" | "published")
    }
  }, [activeTab, form])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)

      await api.patch(`/forms/${formId}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      })

      // Update local state
      setForm({
        ...form!,
        title: editTitle,
        description: editDescription,
        status: editStatus,
      })

      toast.success("Settings updated successfully")
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to update settings")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteForm = async () => {
    try {
      setDeleting(true)

      await api.patch(`/forms/${formId}/delete`)

      toast.success("Form deleted successfully")
      router.push("/dashboard")
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to delete form")
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AuthGuard requireAuth>
      <SidebarProvider>
        <AppSidebar activeItem="My Forms" />
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
                      {loading ? "Loading..." : form?.title || "Form"}
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
            <div className="mx-auto w-full max-w-4xl">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4 gap-2"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading form...</div>
                </div>
              )}

              {error && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                  </CardHeader>
                </Card>
              )}

              {!loading && !error && form && (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="border-b">
                    <nav className="flex gap-6">
                      <a
                        href="#questions"
                        className={`pb-3 border-b-2 transition-colors ${
                          activeTab === "questions"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Questions
                      </a>
                      <a
                        href="#response"
                        className={`pb-3 border-b-2 transition-colors ${
                          activeTab === "response"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Response
                      </a>
                      <a
                        href="#settings"
                        className={`pb-3 border-b-2 transition-colors ${
                          activeTab === "settings"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Settings
                      </a>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "questions" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Questions</CardTitle>
                        <CardDescription>
                          Build your form by adding questions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-muted-foreground">
                            Questions tab content
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "response" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Responses</CardTitle>
                        <CardDescription>
                          View and manage form responses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-muted-foreground">
                            Response tab content
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "settings" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Settings</CardTitle>
                        <CardDescription>
                          Manage form settings and configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Title */}
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Form title"
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Form description"
                            />
                          </div>

                          {/* Publish Status */}
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="publish-switch">Publish Form</Label>
                              <p className="text-sm text-muted-foreground">
                                Make this form available to the public
                              </p>
                            </div>
                            <Switch
                              id="publish-switch"
                              checked={editStatus === "published"}
                              onCheckedChange={(checked) =>
                                setEditStatus(checked ? "published" : "draft")
                              }
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end pt-4">
                            <Button
                              onClick={handleSaveSettings}
                              disabled={saving || !editTitle.trim()}
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>

                          {/* Danger Zone - Delete Form */}
                          <div className="pt-8 border-t">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-medium text-red-800">
                                  Danger Zone
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Permanently delete this form and all its data
                                </p>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    disabled={deleting}
                                    className="bg-red-800 hover:bg-red-900"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Form
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be reversed. This will permanently delete
                                      your form and remove all associated data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDeleteForm}
                                      className="bg-red-800 text-white hover:bg-red-900"
                                    >
                                      {deleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
