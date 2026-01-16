"use client"

import { useState, useEffect } from "react"
import { Send, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

const dummyMessages = [
  { id: "1", role: "user" as const, content: "Create a customer feedback form with 5 questions" },
  { id: "2", role: "assistant" as const, content: "Customer Feedback Form - 5 questions generated" },
  { id: "3", role: "user" as const, content: "Add a question about product quality" },
  { id: "4", role: "assistant" as const, content: "Updated form with product quality question" },
]

const dummyForm = {
  title: "Customer Feedback Form",
  description: "Help us improve our services",
  blocks: [
    {
      id: "1",
      type: "question",
      question: "How satisfied are you with our service?",
      children: [
        { id: "1-1", type: "option", question: "Very Satisfied", children: [] },
        { id: "1-2", type: "option", question: "Satisfied", children: [] },
        { id: "1-3", type: "option", question: "Neutral", children: [] },
        {
          id: "1-4",
          type: "option",
          question: "Dissatisfied",
          children: [
            { id: "1-4-1", type: "question", question: "What was the issue?", children: [] }
          ]
        },
      ]
    },
    {
      id: "2",
      type: "question",
      question: "How would you rate the product quality?",
      children: [
        { id: "2-1", type: "option", question: "Excellent", children: [] },
        { id: "2-2", type: "option", question: "Good", children: [] },
        { id: "2-3", type: "option", question: "Average", children: [] },
        { id: "2-4", type: "option", question: "Poor", children: [] },
      ]
    },
    {
      id: "3",
      type: "question",
      question: "Would you recommend us to others?",
      children: [
        { id: "3-1", type: "option", question: "Yes", children: [] },
        { id: "3-2", type: "option", question: "No", children: [] },
        { id: "3-3", type: "option", question: "Maybe", children: [] },
      ]
    },
    {
      id: "4",
      type: "question",
      question: "Any additional comments?",
      children: []
    },
  ]
}

export default function AIFormsPage() {
  const [activeTab, setActiveTab] = useState("editor")
  const [hasForm, setHasForm] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<typeof dummyMessages>([])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

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

  const renderBlock = (block: typeof dummyForm.blocks[0], depth = 0, index = 0): React.ReactNode => {
    const isCollapsed = collapsed.has(block.id)
    const hasChildren = block.children && block.children.length > 0

    if (block.type === "option") {
      return (
        <div key={block.id} style={{ marginLeft: `${depth * 20}px` }}>
          <div className="flex items-center gap-2 py-1.5">
            {hasChildren ? (
              <button onClick={() => toggleCollapse(block.id)} className="p-0.5 hover:bg-muted rounded">
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
      <div key={block.id} className={depth === 0 ? "pb-3 mb-3 border-b last:border-b-0" : ""} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center gap-2 py-1.5">
          {hasChildren ? (
            <button onClick={() => toggleCollapse(block.id)} className="p-0.5 hover:bg-muted rounded">
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

  const handleSubmit = () => {
    if (!inputValue.trim()) return
    setMessages(dummyMessages)
    setHasForm(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
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
            {!hasForm ? (
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
                      disabled={!inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
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
                  </div>
                  <div className="p-4 border-t">
                    <div className="relative">
                      <Textarea
                        placeholder="Refine your form..."
                        rows={2}
                        className="pr-12 resize-none"
                      />
                      <Button
                        size="icon"
                        className="absolute right-2 bottom-2"
                      >
                        <Send className="h-4 w-4" />
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
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold">{dummyForm.title}</h3>
                          <p className="text-sm text-muted-foreground">{dummyForm.description}</p>
                        </div>
                        <div>
                          {dummyForm.blocks.map((block, index) => renderBlock(block, 0, index))}
                        </div>
                      </div>
                    )}
                    {activeTab === "preview" && (
                      <p className="text-muted-foreground text-sm">Form preview will appear here</p>
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
