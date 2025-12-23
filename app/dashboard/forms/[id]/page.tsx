"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

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

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await api.get(`/forms/${formId}`)
        setForm(response.data)
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

  return (
    <AuthGuard requireAuth>
      <SidebarProvider>
        <AppSidebar />
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
                  {/* Form Details Card */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{form.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {form.description || "No description provided"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              form.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {form.status}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Form ID: {form.id}</p>
                        <p>Created: {new Date(form.created_at).toLocaleString()}</p>
                        <p>Updated: {new Date(form.updated_at).toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Form Builder Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Form Fields</CardTitle>
                      <CardDescription>
                        Build your form by adding fields
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                          No fields added yet. Start building your form by adding fields.
                        </p>
                        <Button disabled>
                          Add Field (Coming Soon)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
