"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogCard } from "@/components/dialog-card"

// Dummy data for testing
const dummyQuestions = [
  {
    id: "1",
    type: "question" as const,
    question: "What department do you work in?",
    children: [
      {
        id: "2",
        type: "option" as const,
        question: "Engineering",
        children: [
          {
            id: "5",
            type: "question" as const,
            question: "What is your employee ID?",
            children: [],
          },
        ],
      },
      {
        id: "3",
        type: "option" as const,
        question: "Marketing",
        children: [
          {
            id: "6",
            type: "question" as const,
            question: "What is your team size?",
            children: [],
          },
        ],
      },
      {
        id: "4",
        type: "option" as const,
        question: "Sales",
        children: [],
      },
    ],
  },
]

interface ProgressiveFormProps {
  initialBlocks?: any[]
  formTitle?: string
  formDescription?: string
}

export function ProgressiveForm({
  initialBlocks = dummyQuestions,
  formTitle = "Employee Survey",
  formDescription = "Help us understand your experience"
}: ProgressiveFormProps) {
  const [currentPath, setCurrentPath] = useState<any[]>([dummyQuestions[0]])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentQuestion = currentPath[currentPath.length - 1]

  const handleOptionSelect = (option: any) => {
    // Save answer
    setAnswers({
      ...answers,
      [currentQuestion.id]: option.question,
    })

    // Move to next question if option has children
    if (option.children && option.children.length > 0) {
      setCurrentPath([...currentPath, option.children[0]])
    }
  }

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    }
  }

  const handleTextSubmit = (value: string) => {
    // Save text answer
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })

    // Move to next question if exists
    if (currentQuestion.children && currentQuestion.children.length > 0) {
      setCurrentPath([...currentPath, currentQuestion.children[0]])
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl h-150 bg-background shadow-lg overflow-hidden grid grid-cols-2">
        {/* Left column - Form */}
        <div className="flex flex-col p-12">
          {/* Form title - top left */}
          <div className="space-y-1 mb-12">
            <h1 className="text-2xl font-semibold">{formTitle}</h1>
            {formDescription && (
              <p className="text-sm text-muted-foreground">{formDescription}</p>
            )}
          </div>

          {/* Question and options - centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md space-y-6">
              {/* Question text */}
              <div>
                <h2 className="text-lg font-medium">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Answer options */}
              <div className="space-y-2">
                {currentQuestion.type === "question" && currentQuestion.children?.length > 0 ? (
                  // Show options if this is a question with children
                  currentQuestion.children.map((option: any) => (
                    <DialogCard
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <p className="text-sm">{option.question}</p>
                    </DialogCard>
                  ))
                ) : (
                  // Show text input if no children (text input question)
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your answer..."
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          handleTextSubmit(e.currentTarget.value)
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Press Enter to continue
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Progress & Back */}
        <div className="bg-muted/30 relative">
          {/* Back button - top left */}
          {currentPath.length > 1 && (
            <div className="absolute top-6 left-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          )}

          {/* Progress text - centered */}
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Question {currentPath.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
