"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { CinematicLoader } from "@/components/animations/cinematic-loader"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get("code")
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          console.error("Auth callback error:", error, errorDescription)
          router.push("/auth/signin?error=" + encodeURIComponent(errorDescription || error))
          return
        }

        if (code) {
          console.log("Processing auth callback with code")

          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error("Code exchange error:", exchangeError)
            router.push("/auth/signin?error=" + encodeURIComponent(exchangeError.message))
            return
          }

          if (data.session) {
            console.log("Email verification successful, redirecting to dashboard")
            router.push("/dashboard")
            return
          }
        }

        // If no code or session, redirect to signin
        console.log("No valid auth callback data, redirecting to signin")
        router.push("/auth/signin")
      } catch (error) {
        console.error("Auth callback exception:", error)
        router.push("/auth/signin?error=" + encodeURIComponent("Authentication failed"))
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <CinematicLoader />
        <p className="text-muted-foreground">Verifying your account...</p>
      </div>
    </div>
  )
}
