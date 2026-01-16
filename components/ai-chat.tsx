"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AIMessage, GeneratedForm } from "@/lib/ai-api"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  form?: GeneratedForm
}

interface AIChatProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
  disabled?: boolean
}

const suggestionPrompts = [
  { label: "Make shorter", prompt: "Make it shorter, keep only 4 main questions" },
  { label: "Add depth", prompt: "Make it deeper with more follow-up questions" },
  { label: "Add Other options", prompt: "Add 'Other' option with text input to all questions" },
  { label: "More comprehensive", prompt: "Make it more comprehensive with additional aspects" },
]

export function AIChat({ messages, onSendMessage, isLoading, disabled }: AIChatProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || disabled) return

    const message = input.trim()
    setInput("")
    await onSendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = async (prompt: string) => {
    if (isLoading || disabled) return
    await onSendMessage(prompt)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2">AI Form Generator</h3>
            <p className="text-sm max-w-md">
              Describe the form you want to create and I'll generate a comprehensive
              conditional form structure for you.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.role === "assistant" && message.form ? (
                <div className="text-sm">
                  <p className="font-medium mb-1">{message.form.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {message.form.blocks.length} questions generated
                  </p>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating form...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length > 0 && !disabled && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestionPrompts.map((suggestion) => (
              <Button
                key={suggestion.label}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
                disabled={isLoading}
                className="text-xs"
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0
                ? "Describe the form you want to create..."
                : "Refine your form..."
            }
            disabled={isLoading || disabled}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || disabled}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
