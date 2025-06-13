"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MELogo } from "@/components/me-logo"
import { useAuth } from "@/lib/auth-context"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect path from URL if available
  const redirectPath = searchParams.get("redirectTo") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setErrors({ general: "Please enter both email and password" })
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await signIn(email, password)

      if (result.success) {
        setSuccessMessage("Sign in successful!")

        // Delay navigation slightly to show success message
        setTimeout(() => {
          router.push(redirectPath)
        }, 500)
      } else {
        setErrors({ general: result.error?.message || "Sign in failed" })
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-border/50 shadow-2xl">
        <CardContent className="p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <MELogo size="lg" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">Sign in to your ME Platform account</p>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3"
              >
                <AlertCircle className="size-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-500">{successMessage}</p>
              </motion.div>
            )}

            {/* Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{errors.general}</p>
              </motion.div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-me-500 to-me-600 hover:from-me-600 hover:to-me-700"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center space-y-4">
              <Button variant="link" className="text-sm text-muted-foreground">
                Forgot your password?
              </Button>

              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => router.push("/auth/signup")}
                  className="p-0 h-auto font-medium text-primary hover:underline"
                >
                  Sign up
                </Button>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
