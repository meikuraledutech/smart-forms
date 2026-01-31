"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  ChevronRight,
  ChevronDown,
  Loader2,
  Save,
  Settings,
  Copy,
  Eye,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { aiApi, GeneratedForm } from "@/lib/ai-api";
import { FormPreview } from "@/components/form-preview";
import { FormEditor } from "@/components/form-editor";
import { Block } from "@/types/form";
import { AppSidebar } from "@/components/app-sidebar";
import AuthGuard from "@/components/auth-guard";
import { NavActions } from "@/components/nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/error-handler";

export default function FormsV2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState("ai-editor");

  // AI Chat state
  const [hasForm, setHasForm] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [generatedForm, setGeneratedForm] = useState<GeneratedForm | null>(
    null
  );
  const [chatInput, setChatInput] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Form state (after form is created)
  const [formId, setFormId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Settings state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [acceptingResponses, setAcceptingResponses] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [flowSaving, setFlowSaving] = useState(false);

  // Response state
  const [responses, setResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsesError, setResponsesError] = useState<string | null>(null);
  const [responsesTotal, setResponsesTotal] = useState(0);
  const [responsesLimit] = useState(10);
  const [responsesOffset, setResponsesOffset] = useState(0);
  const [viewingResponse, setViewingResponse] = useState<any>(null);
  const [viewingAnswers, setViewingAnswers] = useState<any[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingResponseId, setLoadingResponseId] = useState<string | null>(
    null
  );

  // Analytics state
  const [analyticsNodes, setAnalyticsNodes] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // AI block rendering
  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderBlock = (block: any, depth = 0, index = 0): React.ReactNode => {
    const blockKey = block.id || `${depth}-${index}`;
    const isCollapsed = collapsed.has(blockKey);
    const hasChildren = block.children && block.children.length > 0;

    if (block.type === "option") {
      return (
        <div key={blockKey} style={{ marginLeft: `${depth * 20}px` }}>
          <div className="flex items-center gap-2 py-1.5">
            {hasChildren ? (
              <button
                onClick={() => toggleCollapse(blockKey)}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <input type="radio" disabled className="h-4 w-4" />
            <span className="text-sm">{block.question}</span>
          </div>
          {hasChildren && !isCollapsed && (
            <div>
              {block.children.map((child: any, idx: number) =>
                renderBlock(child, depth + 1, idx)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={blockKey}
        className={depth === 0 ? "pb-3 mb-3 border-b last:border-b-0" : ""}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex items-center gap-2 py-1.5">
          {hasChildren ? (
            <button
              onClick={() => toggleCollapse(blockKey)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          {depth === 0 && (
            <span className="text-muted-foreground font-medium">
              {index + 1}.
            </span>
          )}
          <span className="text-sm font-medium">{block.question}</span>
        </div>
        {hasChildren && !isCollapsed && (
          <div>
            {block.children.map((child: any, idx: number) =>
              renderBlock(child, depth + 1, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  // AI Chat handlers
  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    const newUserMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setHasForm(true);

    try {
      const response = await aiApi.createConversation(userMessage);
      setConversationId(response.conversation_id);
      setGeneratedForm(response.form);

      router.push(`/dashboard/forms-v2?conv=${response.conversation_id}`, {
        scroll: false,
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `${response.form.title} - ${response.form.blocks.length} questions generated`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate form");
      setMessages((prev) => prev.filter((m) => m.id !== newUserMessage.id));
      setHasForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading || !conversationId) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setIsLoading(true);

    const newUserMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await aiApi.sendMessage(conversationId, userMessage);
      setGeneratedForm(response.form);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `Updated: ${response.form.title} - ${response.form.blocks.length} questions`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update form");
      setMessages((prev) => prev.filter((m) => m.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Load conversation from URL
  useEffect(() => {
    const convId = searchParams.get("conv");
    const fId = searchParams.get("form");

    if (fId) {
      setFormId(fId);
      loadFormData(fId);
    } else if (convId) {
      loadConversation(convId);
    } else {
      setInitialLoading(false);
    }
  }, [searchParams]);

  const loadConversation = async (convId: string) => {
    try {
      setInitialLoading(true);
      const response = await aiApi.getConversation(convId);

      setConversationId(convId);
      setHasForm(true);

      const parsedMessages = response.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content:
          msg.role === "assistant"
            ? parseAssistantMessage(msg.content)
            : msg.content,
      }));
      setMessages(parsedMessages);

      const lastAssistantMsg = response.messages
        .filter((m) => m.role === "assistant")
        .pop();
      if (lastAssistantMsg) {
        try {
          const form = JSON.parse(lastAssistantMsg.content);
          setGeneratedForm(form);
        } catch {
          // Content might not be JSON
        }
      }

      // Check if form was already created
      if (response.conversation.form_id) {
        setFormId(response.conversation.form_id);
        await loadFormData(response.conversation.form_id);
      }
    } catch (error: any) {
      toast.error("Failed to load conversation");
      router.push("/dashboard/forms-v2");
    } finally {
      setInitialLoading(false);
    }
  };

  const loadFormData = async (fId: string) => {
    try {
      const response = await api.get(`/forms/${fId}`);
      setForm(response.data);
      setEditTitle(response.data.title);
      setEditDescription(response.data.description || "");
      setEditStatus(response.data.status);
      setAcceptingResponses(response.data.accepting_responses ?? true);
      setHasForm(true);
    } catch (error: any) {
      toast.error("Failed to load form data");
    } finally {
      setInitialLoading(false);
    }
  };

  const parseAssistantMessage = (content: string): string => {
    try {
      const form = JSON.parse(content);
      return `${form.title} - ${form.blocks?.length || 0} questions generated`;
    } catch {
      return content;
    }
  };

  // Hash-based tab routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "ai-editor";
      setActiveTab(hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Response handlers
  const fetchResponses = async () => {
    if (!formId) return;
    try {
      setResponsesLoading(true);
      setResponsesError(null);
      const response = await api.get(`/forms/${formId}/responses`, {
        params: { limit: responsesLimit, offset: responsesOffset },
      });
      setResponses(response.data.items || []);
      setResponsesTotal(response.data.total || 0);
    } catch (err: any) {
      setResponsesError(getErrorMessage(err) || "Failed to load responses");
    } finally {
      setResponsesLoading(false);
    }
  };

  useEffect(() => {
    if (formId && activeTab === "response") {
      fetchResponses();
    }
  }, [activeTab, formId, responsesOffset]);

  const fetchResponseDetails = async (responseId: string) => {
    try {
      setLoadingResponseId(responseId);
      const response = await api.get(`/responses/${responseId}`);
      setViewingResponse(response.data.response);
      setViewingAnswers(response.data.answers || []);
      setViewDialogOpen(true);
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Failed to load response details");
    } finally {
      setLoadingResponseId(null);
    }
  };

  // Analytics handlers
  const fetchAnalytics = async () => {
    if (!formId) return;
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const response = await api.get(`/forms/${formId}/analytics/nodes`);
      setAnalyticsNodes(response.data.nodes || []);
      setAnalyticsSummary(response.data.summary || null);
    } catch (err: any) {
      setAnalyticsError(getErrorMessage(err) || "Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (formId && activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab, formId]);

  // Settings handlers
  const handleSaveFlow = async () => {
    if (!formId || !generatedForm) return;
    try {
      setFlowSaving(true);
      // Convert generated form blocks to the format expected by the API
      await api.patch(`/forms/${formId}/flow`, {
        blocks: generatedForm.blocks,
      });
      toast.success("Flow saved successfully");
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Failed to save flow");
    } finally {
      setFlowSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!formId) return;
    try {
      setSaving(true);
      await api.patch(`/forms/${formId}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      setForm({
        ...form,
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      toast.success("Settings updated successfully");
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!formId) return;
    try {
      setDeleting(true);
      await api.patch(`/forms/${formId}/delete`);
      toast.success("Form deleted successfully");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Failed to delete form");
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async () => {
    if (!conversationId && !formId) return;

    try {
      setPublishing(true);

      let currentFormId = formId;

      // If form doesn't exist yet, create it first
      if (!currentFormId && conversationId) {
        const createResponse = await aiApi.createForm(conversationId);
        currentFormId = createResponse.form_id;
        setFormId(currentFormId);
        await loadFormData(currentFormId);
      }

      if (!currentFormId) {
        toast.error("No form to publish");
        return;
      }

      // Now publish the form
      const response = await api.patch(`/forms/${currentFormId}/publish`, {});
      setForm((prev: any) => ({
        ...prev,
        status: "published",
        auto_slug: response.data.links.auto_slug,
        custom_slug: response.data.links.custom_slug,
        accepting_responses: true,
      }));
      setAcceptingResponses(true);
      toast.success("Form published successfully");
    } catch (err: any) {
      toast.error(getErrorMessage(err) || "Failed to publish form");
    } finally {
      setPublishing(false);
    }
  };

  const copyFormUrl = () => {
    const slug = form?.custom_slug || form?.auto_slug;
    const formUrl = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(formUrl);
    toast.success("Form URL copied to clipboard");
  };

  const handleToggleAcceptingResponses = async (accepting: boolean) => {
    if (!formId) return;
    try {
      setAcceptingResponses(accepting);
      await api.patch(`/forms/${formId}/accepting-responses`, { accepting });
      setForm({ ...form, accepting_responses: accepting });
      toast.success(
        accepting ? "Now accepting responses" : "Stopped accepting responses"
      );
    } catch (err: any) {
      setAcceptingResponses(!accepting);
      toast.error(getErrorMessage(err) || "Failed to update");
    }
  };

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
                      {form?.title || generatedForm?.title || "Forms V2"}
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
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !hasForm ? (
              /* Initial State - Centered Input */
              <div className="flex-1 flex items-center justify-center pb-24">
                <div className="w-full max-w-2xl text-center">
                  <h2 className="text-2xl font-semibold mb-6">
                    What form do you want to create?
                  </h2>
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
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Main Layout */
              <div className="flex flex-col h-[calc(100vh-56px)] max-w-6xl mx-auto w-full">
                {/* Tabs Header */}
                <div className="p-3 border-b flex items-center justify-between">
                  <nav className="flex items-center gap-4">
                    <a
                      href="#ai-editor"
                      className={`text-sm pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === "ai-editor"
                          ? "border-primary text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Editor
                    </a>
                    <a
                      href="#editor"
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        activeTab === "editor"
                          ? "border-primary text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Editor
                    </a>
                    <a
                      href="#preview"
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        activeTab === "preview"
                          ? "border-primary text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Preview
                    </a>
                    <a
                      href="#response"
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        activeTab === "response"
                          ? "border-primary text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Response
                    </a>
                    <a
                      href="#analytics"
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        activeTab === "analytics"
                          ? "border-primary text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Analytics
                    </a>
                    <a
                      href="#settings"
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        activeTab === "settings"
                          ? "border-primary text-foreground font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Settings
                    </a>
                  </nav>
                  {generatedForm && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveFlow}
                        disabled={flowSaving || !formId}
                      >
                        {flowSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Flow
                      </Button>
                      <Button
                        size="sm"
                        onClick={handlePublish}
                        disabled={
                          publishing ||
                          !!(formId && form?.status === "published")
                        }
                      >
                        {publishing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Settings className="h-4 w-4" />
                        )}
                        {formId && form?.status === "published"
                          ? "Published"
                          : "Publish"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {/* AI Editor Tab - Chat + Form side by side */}
                  {activeTab === "ai-editor" && (
                    <div className="flex h-full">
                      {/* Chat Panel */}
                      <div className="w-80 flex flex-col border-r shrink-0">
                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
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
                        <div className="p-3 border-t">
                          <div className="relative">
                            <Textarea
                              placeholder="Describe or refine your form..."
                              rows={2}
                              className="pr-10 resize-none text-sm"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={handleChatKeyDown}
                              disabled={isLoading}
                            />
                            <Button
                              size="icon"
                              className="absolute right-2 bottom-2 h-7 w-7"
                              onClick={handleSendMessage}
                              disabled={!chatInput.trim() || isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Form Preview */}
                      <div className="flex-1 p-4 overflow-y-auto">
                        {isLoading && !generatedForm ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">
                              Generating form...
                            </span>
                          </div>
                        ) : generatedForm ? (
                          <div>
                            {generatedForm.blocks.map((block, index) =>
                              renderBlock(block as any, 0, index)
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            Describe your form in the chat to get started
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Editor Tab - Manual Form Editor */}
                  {activeTab === "editor" && (
                    <FormEditor
                      initialBlocks={blocks}
                      onBlocksChange={setBlocks}
                    />
                  )}

                  {/* Preview Tab */}
                  {activeTab === "preview" &&
                    (generatedForm ? (
                      <FormPreview
                        blocks={generatedForm.blocks as any}
                        title={generatedForm.title}
                        description={generatedForm.description}
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No form to preview yet
                      </p>
                    ))}

                  {/* Response Tab */}
                  {activeTab === "response" && !formId && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">
                        Publish your form first to see responses
                      </p>
                    </div>
                  )}
                  {activeTab === "response" && formId && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Responses</CardTitle>
                        <CardDescription>
                          View and manage form responses ({responsesTotal}{" "}
                          total)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {responsesLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">
                              Loading responses...
                            </p>
                          </div>
                        ) : responsesError ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-destructive mb-2">
                              Error loading responses
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {responsesError}
                            </p>
                            <Button
                              onClick={fetchResponses}
                              variant="outline"
                              className="mt-4"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : responses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">
                              No responses yet
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Responses will appear here once users submit the
                              form
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
                                  <TableHead className="text-right">
                                    Action
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {responses.map((response, index) => (
                                  <TableRow key={response.id}>
                                    <TableCell className="font-medium">
                                      {responsesOffset + index + 1}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(
                                        response.submitted_at
                                      ).toLocaleString()}
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
                                        onClick={() =>
                                          fetchResponseDetails(response.id)
                                        }
                                        disabled={
                                          loadingResponseId === response.id
                                        }
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className="flex items-center justify-between pt-4">
                              <p className="text-sm text-muted-foreground">
                                Showing {responsesOffset + 1} to{" "}
                                {Math.min(
                                  responsesOffset + responsesLimit,
                                  responsesTotal
                                )}{" "}
                                of {responsesTotal}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setResponsesOffset(
                                      Math.max(
                                        0,
                                        responsesOffset - responsesLimit
                                      )
                                    )
                                  }
                                  disabled={responsesOffset === 0}
                                >
                                  Previous
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setResponsesOffset(
                                      responsesOffset + responsesLimit
                                    )
                                  }
                                  disabled={
                                    responsesOffset + responsesLimit >=
                                    responsesTotal
                                  }
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* View Response Dialog */}
                        <AlertDialog
                          open={viewDialogOpen}
                          onOpenChange={setViewDialogOpen}
                        >
                          <AlertDialogContent className="max-w-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Response Details
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Submitted at{" "}
                                {viewingResponse
                                  ? new Date(
                                      viewingResponse.submitted_at
                                    ).toLocaleString()
                                  : ""}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            {viewingResponse && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Total Time Spent
                                    </p>
                                    <p className="text-sm font-medium">
                                      {viewingResponse.total_time_spent}s
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Flow Path
                                    </p>
                                    <p className="text-sm font-medium">
                                      {viewingResponse.flow_path?.length || 0}{" "}
                                      steps
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold">
                                    Answers
                                  </h4>
                                  <div className="space-y-3">
                                    {viewingAnswers.map((answer, index) => (
                                      <div
                                        key={answer.id}
                                        className="p-3 border rounded-lg"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <p className="text-xs text-muted-foreground">
                                            Question {index + 1}
                                          </p>
                                          {answer.time_spent && (
                                            <p className="text-xs text-muted-foreground">
                                              {answer.time_spent}s
                                            </p>
                                          )}
                                        </div>
                                        <p className="text-sm font-medium">
                                          {answer.answer_text}
                                        </p>
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

                  {/* Analytics Tab */}
                  {activeTab === "analytics" && !formId && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">
                        Publish your form first to see analytics
                      </p>
                    </div>
                  )}
                  {activeTab === "analytics" && formId && (
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
                            <p className="text-muted-foreground">
                              Loading analytics...
                            </p>
                          </div>
                        ) : analyticsError ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-destructive mb-2">
                              Error loading analytics
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {analyticsError}
                            </p>
                            <Button
                              onClick={fetchAnalytics}
                              variant="outline"
                              className="mt-4"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : analyticsNodes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">
                              No analytics data available
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Analytics will appear once users submit responses
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {analyticsSummary && (
                              <div className="grid grid-cols-4 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>
                                      Total Responses
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                      {analyticsSummary.total_responses}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>
                                      Total Answers
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                      {analyticsSummary.total_answers}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>
                                      Avg Time/Node
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                      {Math.round(
                                        analyticsSummary.avg_time_per_node
                                      )}
                                      s
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardDescription>
                                      Total Nodes
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                      {analyticsSummary.total_nodes}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                              </div>
                            )}
                            <div>
                              <h3 className="text-sm font-semibold mb-3">
                                Node Performance
                              </h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">
                                      Visits
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Answers
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Skips
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Drop-offs
                                    </TableHead>
                                    <TableHead className="text-right">
                                      Avg Time
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {analyticsNodes.map((node, index) => {
                                    const skipRate =
                                      (node.skip_count / node.visit_count) *
                                      100;
                                    const dropRate =
                                      (node.drop_off_count / node.visit_count) *
                                      100;
                                    const isPainPoint =
                                      skipRate > 20 || dropRate > 30;
                                    return (
                                      <TableRow
                                        key={node.flow_connection_id}
                                        className={
                                          isPainPoint ? "bg-red-50" : ""
                                        }
                                      >
                                        <TableCell className="font-medium max-w-xs truncate">
                                          {node.question_text ||
                                            `Node ${index + 1}`}
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-xs px-2 py-1 bg-muted rounded">
                                            {node.question_type || "-"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {node.visit_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {node.answer_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {node.skip_count}
                                          {skipRate > 20 && (
                                            <span className="ml-1 text-xs text-red-600">
                                              ({skipRate.toFixed(0)}%)
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {node.drop_off_count}
                                          {dropRate > 30 && (
                                            <span className="ml-1 text-xs text-red-600">
                                              ({dropRate.toFixed(0)}%)
                                            </span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {Math.round(node.avg_time_spent)}s
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && !formId && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">
                        Publish your form first to access settings
                      </p>
                    </div>
                  )}
                  {activeTab === "settings" && formId && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Form Settings</CardTitle>
                        <CardDescription>
                          Manage form settings and configuration
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Form title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              placeholder="Form description"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="publish-switch">
                                Publish Form
                              </Label>
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
                          {form?.status === "published" && (
                            <div className="space-y-2">
                              <Label>Form URL</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  readOnly
                                  value={`${
                                    typeof window !== "undefined"
                                      ? window.location.origin
                                      : ""
                                  }/f/${
                                    form?.custom_slug || form?.auto_slug || ""
                                  }`}
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
                              <div className="flex items-center justify-between mt-4">
                                <div className="space-y-0.5">
                                  <Label htmlFor="accepting-responses">
                                    Accepting Responses
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Allow users to submit this form
                                  </p>
                                </div>
                                <Switch
                                  id="accepting-responses"
                                  checked={acceptingResponses}
                                  onCheckedChange={
                                    handleToggleAcceptingResponses
                                  }
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end pt-4">
                            <Button
                              onClick={handleSaveSettings}
                              disabled={saving || !editTitle.trim()}
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
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
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be reversed. This will
                                      permanently delete your form and remove
                                      all associated data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
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
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
