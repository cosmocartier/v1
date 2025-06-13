import type { PasswordStrength } from "@/lib/types/auth"

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("Password must be at least 8 characters long")
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one uppercase letter")
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one lowercase letter")
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one number")
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1
  } else {
    feedback.push("Include at least one special character")
  }

  // Common patterns check
  const commonPatterns = [/123456/, /password/i, /qwerty/i, /abc123/i, /admin/i]

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2)
    feedback.push("Avoid common password patterns")
  }

  return {
    score,
    feedback,
    isValid: score >= 4 && feedback.length === 0,
  }
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "Very Weak"
    case 2:
      return "Weak"
    case 3:
      return "Fair"
    case 4:
      return "Good"
    case 5:
      return "Strong"
    default:
      return "Very Weak"
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "text-red-500"
    case 2:
      return "text-orange-500"
    case 3:
      return "text-yellow-500"
    case 4:
      return "text-blue-500"
    case 5:
      return "text-green-500"
    default:
      return "text-red-500"
  }
}
