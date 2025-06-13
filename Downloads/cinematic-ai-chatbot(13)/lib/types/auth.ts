export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  plan: "Strategic" | "Professional" | "Enterprise"
  company?: string
  role?: string
  phone?: string
  timezone: string
  preferences: Record<string, any>
  onboarding_completed: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  company?: string
  role?: string
  phone?: string
  plan?: "Strategic" | "Professional" | "Enterprise"
}

export interface AuthError {
  message: string
  field?: string
}

export interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}
