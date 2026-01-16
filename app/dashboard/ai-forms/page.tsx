"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, ChevronRight, ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { aiApi, GeneratedForm } from "@/lib/ai-api"
import { FormPreview } from "@/components/form-preview"
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

export default function AIFormsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState("editor")
  const [hasForm, setHasForm] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [generatedForm, setGeneratedForm] = useState<GeneratedForm | null>(null)
  const [chatInput, setChatInput] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderBlock = (block: any, depth = 0, index = 0): React.ReactNode => {
    const blockKey = block.id || `${depth}-${index}`
    const isCollapsed = collapsed.has(blockKey)
    const hasChildren = block.children && block.children.length > 0

    if (block.type === "option") {
      return (
        <div key={blockKey} style={{ marginLeft: `${depth * 20}px` }}>
          <div className="flex items-center gap-2 py-1.5">
            {hasChildren ? (
              <button onClick={() => toggleCollapse(blockKey)} className="p-0.5 hover:bg-muted rounded">
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <input type="radio" disabled className="h-4 w-4" />
            <span className="text-sm">{block.question}</span>
          </div>
          {hasChildren && !isCollapsed && (
            <div>
              {block.children.map((child: any, idx: number) => renderBlock(child, depth + 1, idx))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={blockKey} className={depth === 0 ? "pb-3 mb-3 border-b last:border-b-0" : ""} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center gap-2 py-1.5">
          {hasChildren ? (
            <button onClick={() => toggleCollapse(blockKey)} className="p-0.5 hover:bg-muted rounded">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          {depth === 0 && <span className="text-muted-foreground font-medium">{index + 1}.</span>}
          <span className="text-sm font-medium">{block.question}</span>
        </div>
        {hasChildren && !isCollapsed && (
          <div>
            {block.children.map((child: any, idx: number) => renderBlock(child, depth + 1, idx))}
          </div>
        )}
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    // Add user message immediately
    const newUserMessage = { id: Date.now().toString(), role: "user" as const, content: userMessage }
    setMessages(prev => [...prev, newUserMessage])
    setHasForm(true)

    try {
      const response = await aiApi.createConversation(userMessage)
      setConversationId(response.conversation_id)
      setGeneratedForm(response.form)

      // Update URL with conversation ID
      router.push(`/dashboard/ai-forms?conv=${response.conversation_id}`, { scroll: false })

      // Add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `${response.form.title} - ${response.form.blocks.length} questions generated`
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate form")
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== newUserMessage.id))
      setHasForm(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading || !conversationId) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setIsLoading(true)

    // Add user message immediately
    const newUserMessage = { id: Date.now().toString(), role: "user" as const, content: userMessage }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const response = await aiApi.sendMessage(conversationId, userMessage)
      setGeneratedForm(response.form)

      // Add assistant message
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `Updated: ${response.form.title} - ${response.form.blocks.length} questions`
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update form")
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== newUserMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Load conversation from URL on mount
  useEffect(() => {
    const convId = searchParams.get("conv")
    if (convId) {
      loadConversation(convId)
    } else {
      setInitialLoading(false)
    }
  }, [searchParams])

  const loadConversation = async (convId: string) => {
    try {
      setInitialLoading(true)
      const response = await aiApi.getConversation(convId)

      setConversationId(convId)
      setHasForm(true)

      // Parse messages
      const parsedMessages = response.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.role === "assistant" ? parseAssistantMessage(msg.content) : msg.content
      }))
      setMessages(parsedMessages)

      // Get the last assistant message to extract form
      const lastAssistantMsg = response.messages.filter(m => m.role === "assistant").pop()
      if (lastAssistantMsg) {
        try {
          const form = JSON.parse(lastAssistantMsg.content)
          setGeneratedForm(form)
        } catch {
          // Content might not be JSON
        }
      }
    } catch (error: any) {
      toast.error("Failed to load conversation")
      router.push("/dashboard/ai-forms")
    } finally {
      setInitialLoading(false)
    }
  }

  const parseAssistantMessage = (content: string): string => {
    try {
      const form = JSON.parse(content)
      return `${form.title} - ${form.blocks?.length || 0} questions generated`
    } catch {
      return content
    }
  }

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "editor"
      setActiveTab(hash)
    }
    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <AuthGuard requireAuth>
      <SidebarProvider>
        <AppSidebar activeItem="AI Forms" />
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
                      AI Forms
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
              <NavActions />
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-hidden">
            {initialLoading ? (
              /* Loading State */
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !hasForm ? (
              /* Initial State - Centered Input */
              <div className="flex-1 flex items-center justify-center pb-24">
                <div className="w-full max-w-2xl text-center">
                  <h2 className="text-2xl font-semibold mb-6">What form do you want to create?</h2>
                  <div className="relative">
                    <Textarea
                      placeholder="e.g., Create a customer feedback form with 5 questions..."
                      rows={3}
                      className="pr-12 resize-none"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      size="icon"
                      className="absolute right-2 bottom-2"
                      onClick={handleSubmit}
                      disabled={!inputValue.trim() || isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Split Layout - After Form Generated */
              <div className="flex h-[calc(100vh-56px)]">
                {/* Chat Panel */}
                <div className="w-1/3 flex flex-col">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t">
                    <div className="relative">
                      <Textarea
                        placeholder="Refine your form..."
                        rows={2}
                        className="pr-12 resize-none"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        disabled={isLoading}
                      />
                      <Button
                        size="icon"
                        className="absolute right-2 bottom-2"
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <Separator orientation="vertical" />

                {/* Right Panel with Tabs */}
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b">
                    <nav className="flex gap-4">
                      <a
                        href="#editor"
                        className={`text-sm pb-1 border-b-2 transition-colors ${
                          activeTab === "editor"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Form Preview
                      </a>
                      <a
                        href="#preview"
                        className={`text-sm pb-1 border-b-2 transition-colors ${
                          activeTab === "preview"
                            ? "border-primary text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Response Preview
                      </a>
                    </nav>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {activeTab === "editor" && (
                      <div>
                        {isLoading && !generatedForm ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Generating form...</span>
                          </div>
                        ) : generatedForm ? (
                          <>
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold">{generatedForm.title}</h3>
                              <p className="text-sm text-muted-foreground">{generatedForm.description}</p>
                            </div>
                            <div>
                              {generatedForm.blocks.map((block, index) => renderBlock(block as any, 0, index))}
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground text-sm">No form generated yet</p>
                        )}
                      </div>
                    )}
                    {activeTab === "preview" && (
                      generatedForm ? (
                        <FormPreview
                          blocks={generatedForm.blocks as any}
                          title={generatedForm.title}
                          description={generatedForm.description}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm">No form to preview yet</p>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
