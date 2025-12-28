"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogCard } from "@/components/dialog-card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import confetti from "canvas-confetti"
import { API_BASE_URL } from "@/lib/api"

// Dummy data for testing
const dummyQuestions = [
  {
    id: "1766876223657",
    type: "question" as const,
    question: "Question 1",
    children: [
      {
        id: "1766876255437",
        type: "option" as const,
        question: "Question 1, Option 1",
        children: [
          {
            id: "1766876303370",
            type: "option" as const,
            question: "Question 1, Option 1, Sub 1",
            children: [
              {
                id: "1766876353953",
                type: "option" as const,
                question: "Question 1, Option 1, Sub 1, Re-Sub 1",
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "1766876272389",
        type: "option" as const,
        question: "Question 1, Option 2",
        children: [
          {
            id: "1766876316987",
            type: "option" as const,
            question: "Question 1, Option 2, Sub 1",
            children: [],
          },
        ],
      },
      {
        id: "1766876277337",
        type: "option" as const,
        question: "Question 1, Option 3",
        children: [
          {
            id: "1766876329653",
            type: "option" as const,
            question: "Question 1, Option 3, Sub 1",
            children: [],
          },
        ],
      },
      {
        id: "1766876282353",
        type: "option" as const,
        question: "Question 1, Option 4",
        children: [
          {
            id: "1766876341169",
            type: "option" as const,
            question: "Question 1, Option 4, Sub 1",
            children: [],
          },
        ],
      },
      {
        id: "1766876290737",
        type: "input" as const,
        question: "Other",
        children: [],
      },
    ],
  },
  {
    id: "1766876231554",
    type: "question" as const,
    question: "Question 2",
    children: [
      {
        id: "1766876382569",
        type: "input" as const,
        question: "Sample Question 2",
        children: [],
      },
    ],
  },
  {
    id: "1766876235874",
    type: "question" as const,
    question: "Question 3",
    children: [
      {
        id: "1766876395619",
        type: "option" as const,
        question: "Q3, O1",
        children: [
          {
            id: "1766876479818",
            type: "input" as const,
            question: "Update Some",
            children: [],
          },
        ],
      },
      {
        id: "1766876397604",
        type: "option" as const,
        question: "Q3, O2",
        children: [],
      },
      {
        id: "1766876400204",
        type: "option" as const,
        question: "Q3, O3",
        children: [],
      },
    ],
  },
  {
    id: "1766876239870",
    type: "question" as const,
    question: "Question 4",
    children: [
      {
        id: "1766876494451",
        type: "option" as const,
        question: "Q4, O1",
        children: [],
      },
      {
        id: "1766876503301",
        type: "option" as const,
        question: "Q4, O2",
        children: [],
      },
      {
        id: "1766876510884",
        type: "input" as const,
        question: "Text Input",
        children: [],
      },
    ],
  },
  {
    id: "1766876243757",
    type: "question" as const,
    question: "Question 5",
    children: [
      {
        id: "1766876537719",
        type: "input" as const,
        question: "Simple Question",
        children: [],
      },
    ],
  },
  {
    id: "1766876248836",
    type: "question" as const,
    question: "Question 6",
    children: [
      {
        id: "1766876546367",
        type: "input" as const,
        question: "Simple Question",
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

interface ResponseData {
  flow_connection_id: string
  answer_text: string
  time_spent: number
}

export function ProgressiveForm({
  initialBlocks = dummyQuestions,
  formTitle = "Employee Survey",
  formDescription = "Help us understand your experience"
}: ProgressiveFormProps) {
  const blocks = initialBlocks.length > 0 ? initialBlocks : dummyQuestions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentPath, setCurrentPath] = useState<any[]>([blocks[0]])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  // Response tracking
  const [responses, setResponses] = useState<ResponseData[]>([])
  const responsesRef = useRef<ResponseData[]>([])
  const [flowPath, setFlowPath] = useState<string[]>([])
  const flowPathRef = useRef<string[]>([])
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [formStartTime] = useState<number>(Date.now())

  const currentQuestion = currentPath[currentPath.length - 1]

  // Track question view
  useEffect(() => {
    if (currentQuestion?.id && !flowPathRef.current.includes(currentQuestion.id)) {
      flowPathRef.current = [...flowPathRef.current, currentQuestion.id]
      setFlowPath(flowPathRef.current)
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestion?.id])

  const saveResponse = (blockId: string, answerText: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const newResponse: ResponseData = {
      flow_connection_id: blockId,
      answer_text: answerText,
      time_spent: timeSpent
    }
    console.log('Saving response:', newResponse)
    responsesRef.current = [...responsesRef.current, newResponse]
    setResponses(responsesRef.current)
    console.log('Updated responses array:', responsesRef.current)
  }

  const submitFormResponse = async (slug: string) => {
    const totalTimeSpent = Math.floor((Date.now() - formStartTime) / 1000)

    console.log('Current responses ref before submit:', responsesRef.current)
    console.log('Current flowPath ref before submit:', flowPathRef.current)

    if (responsesRef.current.length === 0) {
      console.error('⚠️ Responses array is empty! Cannot submit.')
      return
    }

    const payload = {
      responses: responsesRef.current,
      metadata: {
        total_time_spent: totalTimeSpent,
        flow_path: flowPathRef.current
      }
    }

    console.log('Submitting response:', { slug, payload })

    try {
      const response = await fetch(`${API_BASE_URL}/f/${slug}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to submit response: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Response submitted:', data.response_id)
      return data
    } catch (error) {
      console.error('Error submitting response:', error)
      throw error
    }
  }

  const moveToNextTopLevelQuestion = () => {
    const nextIndex = currentQuestionIndex + 1
    if (nextIndex < blocks.length) {
      setIsDialogOpen(false)
      setTimeout(() => {
        setCurrentQuestionIndex(nextIndex)
        setCurrentPath([blocks[nextIndex]])
        setTimeout(() => {
          setIsDialogOpen(true)
        }, 50)
      }, 300)
    } else {
      // Form completed - submit response
      setIsDialogOpen(false)
      setTimeout(async () => {
        // Get slug from URL if available
        const slug = window.location.pathname.split('/').pop()
        if (slug) {
          await submitFormResponse(slug)
        }
        setIsCompleted(true)
      }, 300)
    }
  }

  const handleOptionSelect = (child: any) => {
    // Save question response
    saveResponse(currentQuestion.id, currentQuestion.question)

    // Save selected option response
    saveResponse(child.id, child.question)

    // Track option in flow path
    if (!flowPathRef.current.includes(child.id)) {
      flowPathRef.current = [...flowPathRef.current, child.id]
      setFlowPath(flowPathRef.current)
    }

    // Save answer
    setAnswers({
      ...answers,
      [currentQuestion.id]: child.question,
    })

    // Close dialog first
    setIsDialogOpen(false)

    if (child.type === "input") {
      // Input type - don't navigate, just move to next top-level question
      setTimeout(() => {
        moveToNextTopLevelQuestion()
      }, 300)
    } else if (child.children && child.children.length > 0) {
      // Has children - navigate to first child
      setTimeout(() => {
        setCurrentPath([...currentPath, child.children[0]])
        setQuestionStartTime(Date.now())
        setTimeout(() => {
          setIsDialogOpen(true)
        }, 50)
      }, 300)
    } else {
      // No more children, move to next top-level question
      setTimeout(() => {
        moveToNextTopLevelQuestion()
      }, 300)
    }
  }

  const handleBack = () => {
    if (currentPath.length > 1) {
      setIsDialogOpen(false)
      setTimeout(() => {
        setCurrentPath(currentPath.slice(0, -1))
        setTimeout(() => {
          setIsDialogOpen(true)
        }, 50)
      }, 300)
    } else if (currentQuestionIndex > 0) {
      // Go back to previous top-level question
      setIsDialogOpen(false)
      setTimeout(() => {
        const prevIndex = currentQuestionIndex - 1
        setCurrentQuestionIndex(prevIndex)
        setCurrentPath([blocks[prevIndex]])
        setTimeout(() => {
          setIsDialogOpen(true)
        }, 50)
      }, 300)
    }
  }

  const handleTextSubmit = (value: string) => {
    // Save question response
    saveResponse(currentQuestion.id, currentQuestion.question)

    // Save text input response
    // For text inputs with a single input child, save the input child's response
    if (currentQuestion.children?.length === 1 && currentQuestion.children[0].type === "input") {
      const inputChild = currentQuestion.children[0]
      saveResponse(inputChild.id, value)

      // Track input in flow path
      if (!flowPathRef.current.includes(inputChild.id)) {
        flowPathRef.current = [...flowPathRef.current, inputChild.id]
        setFlowPath(flowPathRef.current)
      }
    } else {
      // Direct text input question
      saveResponse(currentQuestion.id, value)
    }

    // Save text answer
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })

    // Close dialog first
    setIsDialogOpen(false)

    // Move to next top-level question (text input always ends the current question)
    setTimeout(() => {
      moveToNextTopLevelQuestion()
    }, 300)
  }

  useEffect(() => {
    if (isCompleted) {
      // Trigger fireworks animation
      const duration = 5 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isCompleted])

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-background shadow-lg p-12 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Thank You!</h2>
            <p className="text-sm text-muted-foreground">
              Your response has been submitted successfully.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
      {/* Question Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="space-y-2 mb-2">
              <h2 className="text-xl font-semibold">{formTitle}</h2>
              {formDescription && (
                <p className="text-sm text-muted-foreground">{formDescription}</p>
              )}
            </div>
            <AlertDialogTitle className="text-lg font-medium">
              {currentQuestion.question}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {/* Answer options */}
          <div className="space-y-2 py-4">
            {currentQuestion.children?.length > 0 ? (
              <>
                {/* Show option buttons */}
                {currentQuestion.children
                  .filter((child: any) => child.type === "option")
                  .map((child: any) => (
                    <DialogCard
                      key={child.id}
                      onClick={() => handleOptionSelect(child)}
                    >
                      <p className="text-sm">{child.question}</p>
                    </DialogCard>
                  ))}

                {/* Show text input if there's an input child */}
                {currentQuestion.children.some((child: any) => child.type === "input") && (
                  <div className="space-y-3 mt-4">
                    <Input
                      placeholder={
                        currentQuestion.children.find((child: any) => child.type === "input")?.question ||
                        "Type your answer..."
                      }
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
              </>
            ) : currentQuestion.type === "input" ? (
              // Current question itself is an input type
              <div className="space-y-3">
                <Input
                  placeholder={currentQuestion.question || "Type your answer..."}
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
            ) : null}
          </div>

          {/* Footer with progress and back button */}
          <div className="flex items-center justify-between pt-4 border-t">
            {currentPath.length > 1 || currentQuestionIndex > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {blocks.length}</p>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
