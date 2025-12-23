"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, Search } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import AuthGuard from "@/components/auth-guard"
import { NavActions } from "@/components/nav-actions"
import { FormCard } from "@/components/form-card"
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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

export default function MyFormsPage() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      setLoading(true)
      const response = await api.get("/forms")
      setForms(response.data.items)
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

  const filteredForms = (forms || []).filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                      My Forms
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
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search forms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading forms...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && (forms || []).length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No forms yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Get started by creating your first form.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Forms Grid */}
              {!loading && filteredForms.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {filteredForms.map((form) => (
                    <FormCard
                      key={form.id}
                      title={form.title}
                      description={form.description}
                      status={form.status}
                      onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                    />
                  ))}
                </div>
              )}

              {/* No Search Results */}
              {!loading && (forms || []).length > 0 && filteredForms.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No forms found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search query.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
