"use client"

import { useAuth } from "@/lib/auth-context"

interface UserDisplayNameProps {
  fallback?: string
  className?: string
}

export function UserDisplayName({ fallback = "User", className }: UserDisplayNameProps) {
  const { getUserDisplayName } = useAuth()

  return <span className={className}>{getUserDisplayName() || fallback}</span>
}
