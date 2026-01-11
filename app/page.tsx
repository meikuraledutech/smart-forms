"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Zap, BarChart3, Lock, Sparkles, ArrowRight, GitBranch, Network, Target, TrendingUp, Heart, CheckCircle2, X } from "lucide-react"
import { SmartFormsIcon } from "@/components/smart-forms-icon"
import { useEffect } from "react"

export default function LandingPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const features = [
    {
      icon: GitBranch,
      title: "Intelligent Branching Logic",
      description: "Create forms that adapt in real-time. Each answer determines the next question, creating a personalized experience for every user.",
    },
    {
      icon: Network,
      title: "Visual Flow Designer",
      description: "Design complex decision trees with our intuitive visual builder. See the entire flow at a glance and create sophisticated forms without code.",
    },
    {
      icon: Target,
      title: "Collect Only What Matters",
      description: "Stop overwhelming users with irrelevant questions. Smart branching means you gather less data but gain deeper, more meaningful insights.",
    },
    {
      icon: TrendingUp,
      title: "Decision Path Analytics",
      description: "Track which branches users take, identify drop-off points, and understand the complete journey through your form tree.",
    },
    {
      icon: Sparkles,
      title: "Advanced Conditional Logic",
      description: "Set complex rules and conditions. Show, hide, or skip questions based on multiple criteria. Create truly intelligent forms.",
    },
    {
      icon: Heart,
      title: "Better User Experience",
      description: "Users only see questions relevant to them. Shorter forms, higher completion rates, happier respondents.",
    },
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Design Your Tree",
      description: "Build your form structure with nested questions and conditional branches",
    },
    {
      step: "2",
      title: "Set Logic Rules",
      description: "Define what happens based on each answer - branch, skip, or show different paths",
    },
    {
      step: "3",
      title: "Users Get Personalized",
      description: "Each respondent follows their unique journey through your form",
    },
    {
      step: "4",
      title: "Analyze Decision Paths",
      description: "Understand not just what people answered, but how they got there",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SmartFormsIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Smart Forms</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/signup")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Stop Asking Irrelevant
            <span className="block text-primary">Questions</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build intelligent, tree-structured forms with conditional branching. Ask only what matters, collect less data, gain deeper insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/signup")} className="text-lg px-8">
              Build Your First Smart Form
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/login")} className="text-lg px-8">
              Sign In
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Start with free templates
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Intelligent Forms, Deeper Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tree-structured forms that adapt, branch, and collect exactly what you need
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create intelligent forms in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {howItWorks.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Not Your Traditional Form Builder
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how tree-structured forms compare to linear questionnaires
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional Forms */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Traditional Forms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Linear question flow - everyone sees everything</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Lots of "Not Applicable" answers</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-muted-foreground">High abandonment rates from form fatigue</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Surface-level insights from generic data</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Difficult to analyze decision patterns</p>
              </div>
            </CardContent>
          </Card>

          {/* Smart Forms */}
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Smart Forms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Dynamic branching - personalized paths</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Only relevant questions shown</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Higher completion rates</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Deep behavioral insights</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">Visual decision path analytics</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Smarter Forms?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join innovators who are collecting better data with tree-structured forms
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/signup")}
              className="text-lg px-8"
            >
              Start with Free Templates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <SmartFormsIcon className="h-5 w-5 text-primary" />
              <span className="font-semibold">Smart Forms</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Smart Forms. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/privacy")}>
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/status")}>
                Status
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
