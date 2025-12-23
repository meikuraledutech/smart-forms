"use client"

import { useState } from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { getErrorMessage } from "@/lib/error-handler"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// --------------------
// Zod schema
// --------------------
const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = loginSchema.safeParse({
      email,
      password,
    })

    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    try {
      setLoading(true)
      await login(email, password)

      toast.success("Login successful")
      router.replace("/dashboard")
    } catch (error: any) {
      // Check for server/network errors first
      const serverError = getErrorMessage(error)
      if (serverError) {
        toast.error(serverError)
      } else if (error.response?.status === 401) {
        // Specific handling for invalid credentials
        toast.error("Invalid email or password")
      } else {
        // Fallback for other client errors
        toast.error("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <a href="/signup">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/img/auth.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
