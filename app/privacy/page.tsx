"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">Smart Forms</span>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground italic">
              Privacy policy content will be added here. This is a placeholder page.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">4. Cookies and Tracking</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">7. Changes to This Policy</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
                <p className="text-muted-foreground">Content placeholder...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Smart Forms</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Smart Forms. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
