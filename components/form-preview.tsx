"use client"

import { useState } from "react"
import { ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface FormPreviewProps {
  blocks: any[]
  title: string
  description?: string
}

export function FormPreview({ blocks, title, description }: FormPreviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentPath, setCurrentPath] = useState<any[]>([blocks[0]])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [textInput, setTextInput] = useState("")

  const currentQuestion = currentPath[currentPath.length - 1]

  const resetForm = () => {
    setCurrentQuestionIndex(0)
    setCurrentPath([blocks[0]])
    setAnswers({})
    setIsCompleted(false)
    setTextInput("")
  }

  const moveToNextTopLevelQuestion = () => {
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < blocks.length) {
      setCurrentQuestionIndex(nextIndex)
      setCurrentPath([blocks[nextIndex]])
      setTextInput("")
    } else {
      setIsCompleted(true)
    }
  }

  const handleOptionSelect = (child: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: child.question,
    })

    if (child.children && child.children.length > 0) {
      // Has children - navigate to first child question
      const nextQuestion = child.children.find((c: any) => c.type === "question")
      if (nextQuestion) {
        setCurrentPath([...currentPath, nextQuestion])
        setTextInput("")
      } else {
        moveToNextTopLevelQuestion()
      }
    } else {
      moveToNextTopLevelQuestion()
    }
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) return

    setAnswers({
      ...answers,
      [currentQuestion.id]: textInput,
    })
    setTextInput("")
    moveToNextTopLevelQuestion()
  }

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    } else if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      setCurrentPath([blocks[prevIndex]])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleTextSubmit()
    }
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <Card className="p-8">
          <p className="text-muted-foreground text-sm">No questions to preview</p>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <Card className="p-8 w-full max-w-md text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Preview Complete</h2>
            <p className="text-sm text-muted-foreground">
              You've gone through all the questions
            </p>
          </div>
          <Button onClick={resetForm} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <Card className="p-8">
          <p className="text-muted-foreground text-sm">No question available</p>
        </Card>
      </div>
    )
  }

  // Get options and input children
  const optionChildren = currentQuestion.children?.filter((c: any) => c.type === "option") || []
  const inputChild = currentQuestion.children?.find((c: any) => c.type === "input")
  const hasOnlyInput = currentQuestion.children?.length === 1 && inputChild
  const hasNoChildren = !currentQuestion.children || currentQuestion.children.length === 0

  return (
    <div className="flex items-center justify-center h-full bg-muted/30">
      <Card className="w-full max-w-lg p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Question */}
        <div className="mb-4">
          <h3 className="text-base font-medium">{currentQuestion.question}</h3>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {optionChildren.map((child: any) => (
            <Card
              key={child.id || child.question}
              className="p-3 cursor-pointer hover:bg-accent transition-colors border"
              onClick={() => handleOptionSelect(child)}
            >
              <p className="text-sm">{child.question}</p>
            </Card>
          ))}

          {/* Text Input */}
          {(inputChild || hasOnlyInput || hasNoChildren) && (
            <div className="space-y-3 mt-4">
              <Input
                placeholder={inputChild?.question || "Type your answer..."}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Press Enter to continue
                </p>
                <Button size="sm" onClick={handleTextSubmit} disabled={!textInput.trim()}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          {currentPath.length > 1 || currentQuestionIndex > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} / {blocks.length}
            </p>
            <Button variant="ghost" size="sm" onClick={resetForm} className="gap-1">
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
