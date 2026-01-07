"use client"

import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  plan_type: z.enum(["free", "monthly", "yearly"]),
  price_inr: z.string().min(1, "Price is required"),
})

type CreatePlanData = z.infer<typeof createPlanSchema>

interface AddPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlanCreated?: () => void
}

export function AddPlanDialog({ open, onOpenChange, onPlanCreated }: AddPlanDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreatePlanData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      plan_type: "monthly",
    },
  })

  const planType = watch("plan_type")

  const onSubmit = async (data: CreatePlanData) => {
    try {
      // Convert price from INR to paise
      const priceInPaise = Math.round(parseFloat(data.price_inr) * 100)

      await api.post("/admin/plans", {
        name: data.name,
        plan_type: data.plan_type,
        price_inr: priceInPaise,
      })

      toast.success("Plan created successfully")
      reset()
      onOpenChange(false)

      // Trigger refresh of plans list
      if (onPlanCreated) {
        onPlanCreated()
      }
    } catch (error: any) {
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else if (error.response?.status === 400) {
        toast.error("Invalid plan data. Please check your input.")
      } else {
        toast.error("Failed to create plan. Please try again.")
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
        <Button>
          <Plus className="h-4 w-4" />
          <span>Add New Plan</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details for your new pricing plan.
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
              {isSubmitting ? "Creating..." : "Create Plan"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
