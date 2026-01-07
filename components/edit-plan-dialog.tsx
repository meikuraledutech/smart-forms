"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from "@/lib/axios"
import { getErrorMessage } from "@/lib/error-handler"

// Validation schema
const editPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  plan_type: z.enum(["free", "monthly", "yearly"], {
    required_error: "Plan type is required",
  }),
  price_inr: z.string().min(0, "Price must be 0 or greater"),
})

type EditPlanData = z.infer<typeof editPlanSchema>

interface Plan {
  id: string
  name: string
  plan_type: string
  price_inr: number
  features: {
    can_export?: boolean
    data_retention_days?: number
    full_analytics?: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EditPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Plan | null
  onPlanUpdated?: (updatedPlan: Plan) => void
}

export function EditPlanDialog({ open, onOpenChange, plan, onPlanUpdated }: EditPlanDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EditPlanData>({
    resolver: zodResolver(editPlanSchema),
  })

  const planType = watch("plan_type")

  useEffect(() => {
    if (plan) {
      setValue("name", plan.name)
      setValue("plan_type", plan.plan_type as any)
      setValue("price_inr", (plan.price_inr / 100).toString())
    }
  }, [plan, setValue])

  const onSubmit = async (data: EditPlanData) => {
    if (!plan) return

    try {
      // Convert price from INR to paise
      const priceInPaise = Math.round(parseFloat(data.price_inr) * 100)

      const response = await api.patch(`/admin/plans/${plan.id}`, {
        name: data.name,
        plan_type: data.plan_type,
        price_inr: priceInPaise,
      })

      toast.success("Plan updated successfully")
      reset()
      onOpenChange(false)

      // Return updated plan data
      if (onPlanUpdated && response.data) {
        onPlanUpdated(response.data)
      }
    } catch (error: any) {
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else if (error.response?.status === 400) {
        toast.error("Invalid plan data. Please check your input.")
      } else {
        toast.error("Failed to update plan. Please try again.")
      }
    }
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Update the details for this pricing plan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Plan Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Pro Monthly"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="plan_type">Plan Type</FieldLabel>
                <Select
                  value={planType}
                  onValueChange={(value) => setValue("plan_type", value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.plan_type && (
                  <FieldError>{errors.plan_type.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="price_inr">Price (₹)</FieldLabel>
                <Input
                  id="price_inr"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 399"
                  {...register("price_inr")}
                  disabled={isSubmitting}
                />
                {errors.price_inr && (
                  <FieldError>{errors.price_inr.message}</FieldError>
                )}
                <p className="text-muted-foreground text-xs mt-1">
                  Enter price in rupees (e.g., 399 for ₹399)
                </p>
              </Field>
            </FieldGroup>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Plan"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
