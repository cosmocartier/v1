"use client"

import { AuthDiagnostic } from "@/components/auth/auth-diagnostic"

export default function AuthDebugPage() {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Debug page only available in development mode.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Authentication Debug</h1>
          <p className="text-muted-foreground">Troubleshoot authentication issues and verify system configuration</p>
        </div>

        <AuthDiagnostic />

        <div className="text-center text-sm text-muted-foreground">
          <p>This page is only available in development mode.</p>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  )
}
