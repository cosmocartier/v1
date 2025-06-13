"use client"

import { useAuth } from "@/lib/auth-context"

export function AuthDebug() {
  const { user, profile, isLoading } = useAuth()

  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-sm">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
      <div>User: {user ? user.email : "None"}</div>
      <div>Profile: {profile ? "Exists" : "None"}</div>
      <div>User ID: {user?.id || "None"}</div>
      <div>Email Confirmed: {user?.email_confirmed_at ? "Yes" : "No"}</div>
    </div>
  )
}
