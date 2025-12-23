"use client"

import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import api from "@/lib/axios"
import { getErrorMessage } from "@/lib/error-handler"

// Validation schema
const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

type CreateFormData = z.infer<typeof createFormSchema>

interface CreateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asMenuItem?: boolean
}

export function CreateFormDialog({ open, onOpenChange, asMenuItem = false }: CreateFormDialogProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
  })

  const onSubmit = async (data: CreateFormData) => {
    try {
      const response = await api.post("/forms", {
        title: data.title,
        description: data.description || "",
      })

      const formId = response.data.id

      toast.success("Form created successfully")
      reset()
      onOpenChange(false)

      // Redirect to form detail page
      router.push(`/dashboard/forms/${formId}`)
    } catch (error: any) {
      // Check for server/network errors
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else if (error.response?.status === 400) {
        toast.error("Invalid form data. Please check your input.")
      } else {
        toast.error("Failed to create form. Please try again.")
      }
    }
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          className={asMenuItem
            ? "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-hidden ring-ring transition-colors bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
            : "inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          }
        >
          <Plus className="h-4 w-4" />
          <span>Create Form</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Form</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details for your new form.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="e.g., Student Feedback Form"
                  {...register("title")}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                <textarea
                  id="description"
                  placeholder="Describe what this form is for..."
                  {...register("description")}
                  disabled={isSubmitting}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                />
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
