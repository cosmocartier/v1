"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, User, Mail, Lock, Building, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import type { SignUpData } from "@/lib/types/auth"

interface SignUpFormProps {
  onSuccess?: (data: SignUpData) => void
  redirectPath?: string
}

export function SignUpForm({ onSuccess, redirectPath = "/dashboard" }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpData>({
    email: "",
    password: "",
    full_name: "",
    company: "",
    role: "",
    phone: "",
    plan: "Strategic",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const { signUp } = useAuth()
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccessMessage("")

    try {
      console.log("Submitting sign-up form")

      const result = await signUp(formData)

      if (result.success) {
        console.log("Sign-up successful:", result)

        // Store any verification message for later display
        if (result.error?.message) {
          localStorage.setItem("verification_message", result.error.message)
        }

        setSuccessMessage("Account created successfully!")

        // Use callback if provided, otherwise handle navigation here
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(formData)
          }, 500)
        } else {
          // Delay navigation slightly to show success message
          setTimeout(() => {
            router.push(redirectPath)
          }, 500)
        }
      } else {
        console.error("Sign-up failed:", result.error)

        if (result.error?.field) {
          setErrors({ [result.error.field]: result.error.message })
        } else {
          setErrors({ general: result.error?.message || "Sign up failed. Please try again." })
        }
      }
    } catch (error) {
      console.error("Sign-up form exception:", error)
      setErrors({ general: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SignUpData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Form fields configuration with unique keys
  const formFields = [
    {
      key: "full_name_field",
      id: "full_name",
      label: "Full Name *",
      type: "text",
      placeholder: "Enter your full name",
      value: formData.full_name,
      icon: User,
      required: true,
    },
    {
      key: "email_field",
      id: "email",
      label: "Email Address *",
      type: "email",
      placeholder: "Enter your email",
      value: formData.email,
      icon: Mail,
      required: true,
    },
    {
      key: "company_field",
      id: "company",
      label: "Company",
      type: "text",
      placeholder: "Your company name",
      value: formData.company,
      icon: Building,
      required: false,
    },
    {
      key: "role_field",
      id: "role",
      label: "Role",
      type: "text",
      placeholder: "Your job title",
      value: formData.role,
      icon: User,
      required: false,
    },
    {
      key: "phone_field",
      id: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "Your phone number",
      value: formData.phone,
      icon: Phone,
      required: false,
    },
  ]

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            key="success_message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Error */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            key="general_error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render form fields with unique keys */}
        {formFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <div className="relative">
              <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                id={field.id}
                type={field.type}
                value={field.value}
                onChange={(e) => handleInputChange(field.id as keyof SignUpData, e.target.value)}
                placeholder={field.placeholder}
                className={`pl-10 ${errors[field.id] ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
            </div>
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        ))}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Create a secure password"
            className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      {/* Plan Selection */}
      <div className="space-y-2">
        <Label htmlFor="plan">Plan</Label>
        <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="strategic_plan" value="Strategic">
              Strategic
            </SelectItem>
            <SelectItem key="professional_plan" value="Professional">
              Professional
            </SelectItem>
            <SelectItem key="enterprise_plan" value="Enterprise">
              Enterprise
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.form>
  )
}
