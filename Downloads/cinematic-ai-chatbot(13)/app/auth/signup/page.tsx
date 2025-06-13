"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MELogo } from "@/components/me-logo"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { OnboardingStep1 } from "@/components/auth/onboarding-step-1"
import { OnboardingStep2 } from "@/components/auth/onboarding-step-2"
import type { SignUpData } from "@/lib/types/auth"
import { VerificationBanner } from "@/components/auth/verification-banner"
import { AuthDebug } from "@/components/auth/auth-debug"

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [signupData, setSignupData] = useState<SignUpData>({
    email: "",
    password: "",
    full_name: "",
    company: "",
    role: "",
    phone: "",
    plan: "Strategic",
  })
  const [onboardingData, setOnboardingData] = useState({
    industry: "",
    team_type: "",
    team_size: "",
    use_case: "",
  })
  const [teamInvites, setTeamInvites] = useState<string[]>([])

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect path from URL if available
  const redirectPath = searchParams.get("redirectTo") || "/dashboard"

  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleSignupSuccess = (data: SignUpData) => {
    console.log("Signup success handler called with data:", data)

    // Store any verification message for display during onboarding
    const verificationMessage = localStorage.getItem("verification_message")
    if (verificationMessage) {
      console.log("Verification message found:", verificationMessage)
    }

    // Update signup data state immediately
    setSignupData(data)

    // Move to next step immediately - no delay needed
    console.log("Advancing to step 2")
    setCurrentStep(2)
  }

  const handleOnboardingStep1Complete = (data: any) => {
    setOnboardingData(data)
    setCurrentStep(3)
  }

  const handleOnboardingStep2Complete = (invites: string[]) => {
    setTeamInvites(invites)
    // Complete onboarding and redirect to dashboard
    router.push(redirectPath)
  }

  const handleSkipTeamInvites = () => {
    router.push(redirectPath)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Create Your Account"
      case 2:
        return "Tell us about yourself"
      case 3:
        return "Invite your team"
      default:
        return "Getting Started"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Start orchestrating better outcomes today"
      case 2:
        return "This will help us personalize your experience in ME Platform"
      case 3:
        return "Get more done with your team"
      default:
        return ""
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MELogo size="sm" />
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Verification Banner */}
        {currentStep > 1 && <VerificationBanner />}

        <Card className="border-2 border-border/50 shadow-2xl">
          <CardContent className="p-8">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
              {/* Header */}
              <motion.div variants={item} className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{getStepTitle()}</h1>
                <p className="text-muted-foreground text-lg">{getStepDescription()}</p>
              </motion.div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {currentStep === 1 && <SignUpForm onSuccess={handleSignupSuccess} />}
                  {currentStep === 2 && (
                    <OnboardingStep1 onComplete={handleOnboardingStep1Complete} userData={signupData} />
                  )}
                  {currentStep === 3 && (
                    <OnboardingStep2
                      onComplete={handleOnboardingStep2Complete}
                      onSkip={handleSkipTeamInvites}
                      userData={signupData}
                      onboardingData={onboardingData}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>

        {/* Footer */}
        {currentStep === 1 && (
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/auth/signin")}
                className="p-0 h-auto font-medium text-primary hover:underline"
              >
                Sign in
              </Button>
            </p>
          </div>
        )}
      </div>

      <AuthDebug />
    </div>
  )
}
