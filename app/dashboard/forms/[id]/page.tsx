"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, Save, Settings, Copy, Eye } from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { FormEditor } from "@/components/form-editor"
import { Block } from "@/types/form"
import api from "@/lib/axios"
import { getErrorMessage } from "@/lib/error-handler"

interface Form {
  id: string
  title: string
  description: string
  status: string
  auto_slug?: string
  custom_slug?: string
  accepting_responses?: boolean
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

  // Form builder state
  const [blocks, setBlocks] = useState<Block[]>([])
  const [flowLoading, setFlowLoading] = useState(false)
  const [flowSaving, setFlowSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [acceptingResponses, setAcceptingResponses] = useState(true)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  // Response state
  const [responses, setResponses] = useState<any[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [responsesError, setResponsesError] = useState<string | null>(null)
  const [responsesTotal, setResponsesTotal] = useState(0)
  const [responsesLimit, setResponsesLimit] = useState(10)
  const [responsesOffset, setResponsesOffset] = useState(0)

  // Individual response view state
  const [viewingResponse, setViewingResponse] = useState<any>(null)
  const [viewingAnswers, setViewingAnswers] = useState<any[]>([])
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [loadingResponseId, setLoadingResponseId] = useState<string | null>(null)

  // Analytics state
  const [analyticsNodes, setAnalyticsNodes] = useState<any[]>([])
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

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
        // Initialize accepting responses state
        setAcceptingResponses(response.data.accepting_responses ?? true)
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

  // Normalize blocks - convert null children to empty arrays
  const normalizeBlocks = (blocks: any[]): Block[] => {
    if (!blocks) return []
    return blocks.map((block) => ({
      ...block,
      children: normalizeBlocks(block.children || []),
    }))
  }

  // Fetch flow when switching to questions tab
  useEffect(() => {
    const loadFlow = async () => {
      try {
        setFlowLoading(true)
        const response = await api.get(`/forms/${formId}/flow`)
        const normalizedBlocks = normalizeBlocks(response.data.blocks || [])
        setBlocks(normalizedBlocks)
      } catch (err: any) {
        // If flow doesn't exist yet (404), that's ok - start with empty blocks
        if (err.response?.status !== 404) {
          const serverError = getErrorMessage(err)
          if (serverError) {
            toast.error(serverError)
          }
        }
      } finally {
        setFlowLoading(false)
      }
    }

    if (form && activeTab === "questions" && blocks.length === 0) {
      loadFlow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, form, formId])

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

  const handleSaveFlow = async () => {
    try {
      setFlowSaving(true)

      await api.patch(`/forms/${formId}/flow`, {
        blocks: blocks,
      })

      toast.success("Flow saved successfully")
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to save flow")
      }
    } finally {
      setFlowSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setPublishing(true)

      // First save the flow
      await api.patch(`/forms/${formId}/flow`, {
        blocks: blocks,
      })

      // Then publish the form using new endpoint
      const response = await api.patch(`/forms/${formId}/publish`, {})

      // Update local state with new fields
      setForm({
        ...form!,
        status: "published",
        auto_slug: response.data.links.auto_slug,
        custom_slug: response.data.links.custom_slug,
        accepting_responses: true,
      })

      toast.success("Form published successfully")
      // Keep dialog open to show URL
      setPublishDialogOpen(true)
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to publish form")
      }
    } finally {
      setPublishing(false)
    }
  }

  const copyFormUrl = () => {
    const slug = form?.custom_slug || form?.auto_slug
    const formUrl = `${window.location.origin}/f/${slug}`
    navigator.clipboard.writeText(formUrl)
    toast.success("Form URL copied to clipboard")
  }

  const handleToggleAcceptingResponses = async (accepting: boolean) => {
    try {
      setAcceptingResponses(accepting)

      await api.patch(`/forms/${formId}/accepting-responses`, {
        accepting: accepting,
      })

      // Update local form state
      setForm({
        ...form!,
        accepting_responses: accepting,
      })

      toast.success(accepting ? "Now accepting responses" : "Stopped accepting responses")
    } catch (err: any) {
      // Revert on error
      setAcceptingResponses(!accepting)
      const serverError = getErrorMessage(err)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to update accepting responses")
      }
    }
  }

  // Fetch responses
  const fetchResponses = async () => {
    try {
      setResponsesLoading(true)
      setResponsesError(null)

      const response = await api.get(`/forms/${formId}/responses`, {
        params: {
          limit: responsesLimit,
          offset: responsesOffset,
        },
      })

      setResponses(response.data.items || [])
      setResponsesTotal(response.data.total || 0)
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        setResponsesError(serverError)
      } else {
        setResponsesError("Failed to load responses")
      }
    } finally {
      setResponsesLoading(false)
    }
  }

  // Fetch responses when switching to response tab
  useEffect(() => {
    if (form && activeTab === "response") {
      fetchResponses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, form, formId, responsesLimit, responsesOffset])

  // Fetch individual response details
  const fetchResponseDetails = async (responseId: string) => {
    try {
      setLoadingResponseId(responseId)
      const response = await api.get(`/responses/${responseId}`)
      setViewingResponse(response.data.response)
      setViewingAnswers(response.data.answers || [])
      setViewDialogOpen(true)
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        toast.error(serverError)
      } else {
        toast.error("Failed to load response details")
      }
    } finally {
      setLoadingResponseId(null)
    }
  }

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      setAnalyticsError(null)

      const response = await api.get(`/forms/${formId}/analytics/nodes`)
      setAnalyticsNodes(response.data.nodes || [])
      setAnalyticsSummary(response.data.summary || null)
    } catch (err: any) {
      const serverError = getErrorMessage(err)
      if (serverError) {
        setAnalyticsError(serverError)
      } else {
        setAnalyticsError("Failed to load analytics")
      }
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Fetch analytics when switching to analytics tab
  useEffect(() => {
    if (form && activeTab === "analytics") {
      fetchAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, form, formId])

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
            <div className="mx-auto w-full max-w-6xl">
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
                        className={`pb-3 border-b-2 transition-colors text-sm ${
                          activeTab === "questions"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Questions
                      </a>
                      <a
                        href="#response"
                        className={`pb-3 border-b-2 transition-colors text-sm ${
                          activeTab === "response"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Response
                      </a>
                      <a
                        href="#analytics"
                        className={`pb-3 border-b-2 transition-colors text-sm ${
                          activeTab === "analytics"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Analytics
                      </a>
                      <a
                        href="#settings"
                        className={`pb-3 border-b-2 transition-colors text-sm ${
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
                    <div className="space-y-4">
                      <div className="sticky top-0 z-10 bg-background pb-4 flex items-center justify-between border-b">
                        <div>
                          <h2 className="text-lg font-semibold">Form Questions</h2>
                          <p className="text-sm text-muted-foreground">
                            Build your form by adding questions
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSaveFlow}
                            disabled={flowSaving}
                            variant="outline"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {flowSaving ? "Saving..." : "Save Flow"}
                          </Button>
                          <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button disabled={publishing}>
                                <Settings className="h-4 w-4 mr-2" />
                                {publishing ? "Publishing..." : form?.status === "published" ? "Published" : "Publish"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              {form?.status === "published" ? (
                                <>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Form Published</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Your form is live and accepting responses
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Form URL</Label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          readOnly
                                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form?.custom_slug || form?.auto_slug || ''}`}
                                          className="flex-1"
                                        />
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={copyFormUrl}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label htmlFor="accepting-responses">Accepting Responses</Label>
                                        <p className="text-sm text-muted-foreground">
                                          Allow users to submit this form
                                        </p>
                                      </div>
                                      <Switch
                                        id="accepting-responses"
                                        checked={acceptingResponses}
                                        onCheckedChange={handleToggleAcceptingResponses}
                                      />
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                  </AlertDialogFooter>
                                </>
                              ) : (
                                <>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Publish this form?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will make your form publicly available. Make sure you've saved all your changes before publishing.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePublish}>
                                      {publishing ? "Publishing..." : "Publish"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </>
                              )}
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {flowLoading ? (
                        <Card className="p-6">
                          <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading flow...</p>
                          </div>
                        </Card>
                      ) : (
                        <FormEditor
                          initialBlocks={blocks}
                          onBlocksChange={setBlocks}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === "response" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Responses</CardTitle>
                        <CardDescription>
                          View and manage form responses ({responsesTotal} total)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {responsesLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading responses...</p>
                          </div>
                        ) : responsesError ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-destructive mb-2">Error loading responses</p>
                            <p className="text-sm text-muted-foreground">{responsesError}</p>
                            <Button onClick={fetchResponses} variant="outline" className="mt-4">
                              Retry
                            </Button>
                          </div>
                        ) : responses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">No responses yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Responses will appear here once users submit the form
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>#</TableHead>
                                  <TableHead>Submitted At</TableHead>
                                  <TableHead>Time Spent</TableHead>
                                  <TableHead>Flow Path</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {responses.map((response, index) => (
                                  <TableRow key={response.id}>
                                    <TableCell className="font-medium">
                                      {responsesOffset + index + 1}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(response.submitted_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      {response.total_time_spent}s
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {response.flow_path?.length || 0} steps
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => fetchResponseDetails(response.id)}
                                        disabled={loadingResponseId === response.id}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between pt-4">
                              <p className="text-sm text-muted-foreground">
                                Showing {responsesOffset + 1} to {Math.min(responsesOffset + responsesLimit, responsesTotal)} of {responsesTotal}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setResponsesOffset(Math.max(0, responsesOffset - responsesLimit))}
                                  disabled={responsesOffset === 0}
                                >
                                  Previous
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setResponsesOffset(responsesOffset + responsesLimit)}
                                  disabled={responsesOffset + responsesLimit >= responsesTotal}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* View Response Dialog */}
                        <AlertDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                          <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Response Details</AlertDialogTitle>
                              <AlertDialogDescription>
                                Submitted at {viewingResponse ? new Date(viewingResponse.submitted_at).toLocaleString() : ''}
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            {viewingResponse && (
                              <div className="space-y-4">
                                {/* Response Summary */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total Time Spent</p>
                                    <p className="text-sm font-medium">{viewingResponse.total_time_spent}s</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Flow Path</p>
                                    <p className="text-sm font-medium">{viewingResponse.flow_path?.length || 0} steps</p>
                                  </div>
                                </div>

                                {/* Answers */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold">Answers</h4>
                                  <div className="space-y-3">
                                    {viewingAnswers.map((answer, index) => (
                                      <div key={answer.id} className="p-3 border rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                          <p className="text-xs text-muted-foreground">Question {index + 1}</p>
                                          {answer.time_spent && (
                                            <p className="text-xs text-muted-foreground">{answer.time_spent}s</p>
                                          )}
                                        </div>
                                        <p className="text-sm font-medium">{answer.answer_text}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === "analytics" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Analytics</CardTitle>
                        <CardDescription>
                          Node-level metrics and insights
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analyticsLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading analytics...</p>
                          </div>
                        ) : analyticsError ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-destructive mb-2">Error loading analytics</p>
                            <p className="text-sm text-muted-foreground">{analyticsError}</p>
                            <Button onClick={fetchAnalytics} variant="outline" className="mt-4">
                              Retry
                            </Button>
                          </div>
                        ) : analyticsNodes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">No analytics data available</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Analytics will appear once users submit responses
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Summary Cards */}
                            {analyticsSummary && (
                              <div className="grid grid-cols-4 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>Total Responses</CardDescription>
                                    <CardTitle className="text-2xl">
                                      {analyticsSummary.total_responses}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>Total Answers</CardDescription>
                                    <CardTitle className="text-2xl">
                                      {analyticsSummary.total_answers}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>Avg Time/Node</CardDescription>
                                    <CardTitle className="text-2xl">
                                      {Math.round(analyticsSummary.avg_time_per_node)}s
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>Total Nodes</CardDescription>
                                    <CardTitle className="text-2xl">
                                      {analyticsSummary.total_nodes}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                              </div>
                            )}

                            {/* Node Metrics Table */}
                            <div>
                              <h3 className="text-sm font-semibold mb-3">Node Performance</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Visits</TableHead>
                                    <TableHead className="text-right">Answers</TableHead>
                                    <TableHead className="text-right">Skips</TableHead>
                                    <TableHead className="text-right">Drop-offs</TableHead>
                                    <TableHead className="text-right">Avg Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {analyticsNodes.map((node, index) => {
                                    const skipRate = (node.skip_count / node.visit_count) * 100
                                    const dropRate = (node.drop_off_count / node.visit_count) * 100
                                    const isPainPoint = skipRate > 20 || dropRate > 30

                                    return (
                                      <TableRow key={node.flow_connection_id} className={isPainPoint ? "bg-red-50" : ""}>
                                        <TableCell className="font-medium max-w-xs truncate">
                                          {node.question_text || `Node ${index + 1}`}
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-xs px-2 py-1 bg-muted rounded">
                                            {node.question_type || '-'}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">{node.visit_count}</TableCell>
                                        <TableCell className="text-right">{node.answer_count}</TableCell>
                                        <TableCell className="text-right">
                                          {node.skip_count}
                                          {skipRate > 20 && (
                                            <span className="ml-1 text-xs text-red-600">({skipRate.toFixed(0)}%)</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {node.drop_off_count}
                                          {dropRate > 30 && (
                                            <span className="ml-1 text-xs text-red-600">({dropRate.toFixed(0)}%)</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">{Math.round(node.avg_time_spent)}s</TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
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
