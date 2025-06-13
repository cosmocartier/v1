"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { AuthDebugger } from "@/lib/supabase/debug"
import type { UserProfile, SignUpData, AuthError } from "@/lib/types/auth"
import { StorageManager } from "@/lib/utils/storage-manager" // Import StorageManager

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: AuthError; user?: User }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError; user?: User }>
  signOut: () => Promise<{ success: boolean; error?: AuthError }>
  resendVerification: (email: string) => Promise<{ success: boolean; error?: AuthError }>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: AuthError }>
  runDiagnostic: () => Promise<any>
  getUserDisplayName: () => string
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const isDevelopment = typeof window !== "undefined" && window.location.hostname === "localhost"
const storageManager = StorageManager.getInstance()
const USER_PROFILE_STORAGE_KEY = "user_profile_cache"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAndCacheUserProfile = useCallback(async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
    try {
      console.log("Fetching profile for user:", userId, "retry:", retryCount)
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Profile fetch error:", error)
        setProfile(null)
        await storageManager.removeItem(USER_PROFILE_STORAGE_KEY)
        return null
      }

      if (!data) {
        console.log("No profile found for user:", userId)
        if (retryCount === 0) {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser()
          if (currentUser && currentUser.id === userId) {
            const createdProfile = await createUserProfileInDb(userId, currentUser) // Renamed to avoid confusion
            if (createdProfile) {
              setProfile(createdProfile)
              await storageManager.setItem(USER_PROFILE_STORAGE_KEY, createdProfile, { ttl: 24 * 60 * 60 * 1000 }) // Cache for 1 day
              return createdProfile
            }
          }
          if (retryCount < 1) {
            setTimeout(() => fetchAndCacheUserProfile(userId, retryCount + 1), 2000)
            return null
          }
        }
        setProfile(null)
        await storageManager.removeItem(USER_PROFILE_STORAGE_KEY)
        return null
      }

      setProfile(data)
      await storageManager.setItem(USER_PROFILE_STORAGE_KEY, data, { ttl: 24 * 60 * 60 * 1000 }) // Cache for 1 day
      return data
    } catch (error) {
      console.error("Profile fetch/cache exception:", error)
      setProfile(null)
      await storageManager.removeItem(USER_PROFILE_STORAGE_KEY)
      return null
    }
  }, [])

  const createUserProfileInDb = async (userId: string, userData: any): Promise<UserProfile | null> => {
    // ... (implementation of createUserProfile from your existing AuthContext, ensure it returns UserProfile | null)
    // This function should only interact with Supabase DB, not set state or call storageManager directly.
    // The caller (fetchAndCacheUserProfile) will handle caching.
    try {
      console.log("Creating user profile in DB for:", userId)
      const profileData = {
        id: userId,
        email: userData.email,
        full_name: userData.user_metadata?.full_name || userData.full_name || "",
        company: userData.user_metadata?.company || "",
        role: userData.user_metadata?.role || "",
        phone: userData.user_metadata?.phone || "",
        plan: userData.user_metadata?.plan || "Strategic",
        email_verified: userData.email_confirmed_at ? true : false,
        onboarding_completed: false,
      } as UserProfile
      const { data: existingProfile } = await supabase.from("user_profiles").select("id").eq("id", userId).maybeSingle()
      if (existingProfile) return existingProfile as UserProfile // Or fetch full profile

      const { data, error } = await supabase.from("user_profiles").insert([profileData]).select().single()
      if (error) {
        console.error("DB Profile creation error:", error)
        return null
      }
      return data as UserProfile
    } catch (error) {
      console.error("DB Profile creation exception:", error)
      return null
    }
  }

  useEffect(() => {
    if (isDevelopment) {
      AuthDebugger.runFullDiagnostic().catch(console.error)
    }

    const initializeAuth = async () => {
      // Attempt to load profile from cache first for faster UI
      const cachedProfile = await storageManager.getItem<UserProfile>(USER_PROFILE_STORAGE_KEY)
      if (cachedProfile) {
        setProfile(cachedProfile)
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error && error.message !== "Auth session missing!") console.error("Session retrieval error:", error.message)

      setUser(session?.user ?? null)
      if (session?.user) {
        // Fetch from DB to ensure freshness, this will update cache
        await fetchAndCacheUserProfile(session.user.id)
      } else if (cachedProfile) {
        // User not in session, but had cached profile (e.g. after logout but before cache clear)
        // This might indicate an inconsistent state, clear cached profile.
        await storageManager.removeItem(USER_PROFILE_STORAGE_KEY)
        setProfile(null)
      }
      setIsLoading(false)
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchAndCacheUserProfile(session.user.id)
      } else {
        setProfile(null)
        await storageManager.removeItem(USER_PROFILE_STORAGE_KEY) // Clear cache on logout
      }
      setIsLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [fetchAndCacheUserProfile])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchAndCacheUserProfile(user.id)
    }
  }, [user, fetchAndCacheUserProfile])

  const updateProfile = async (updateData: Partial<UserProfile>): Promise<{ success: boolean; error?: AuthError }> => {
    if (!user) return { success: false, error: { message: "User not authenticated" } }
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", user.id)
      if (error) {
        console.error("Profile update error:", error)
        return { success: false, error: { message: "Failed to update profile in DB." } }
      }

      // Refresh profile from DB and update cache
      await fetchAndCacheUserProfile(user.id)
      return { success: true }
    } catch (error) {
      console.error("Profile update exception:", error)
      return { success: false, error: { message: "Failed to update profile." } }
    }
  }

  const signOut = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign-out error:", error)
        return { success: false, error: { message: error.message } }
      }
      setUser(null)
      setProfile(null)
      await storageManager.removeItem(USER_PROFILE_STORAGE_KEY) // Clear cache
      await storageManager.clearAllAppStorage("local") // Clear other app-specific local data
      await storageManager.clearAllAppStorage("session") // Clear app-specific session data
      return { success: true }
    } catch (error) {
      console.error("Sign-out exception:", error)
      return { success: false, error: { message: "Failed to sign out." } }
    }
  }

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: AuthError; user?: User }> => {
    try {
      setIsLoading(true)
      console.log("Starting sign-up process for:", data.email)

      // Validate required fields
      if (!data.email || !data.password || !data.full_name) {
        console.error("Missing required fields for signup")
        return {
          success: false,
          error: {
            message: "Email, password, and full name are required",
            field: !data.email ? "email" : !data.password ? "password" : "full_name",
          },
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            company: data.company?.trim() || "",
            role: data.role?.trim() || "",
            phone: data.phone?.trim() || "",
            plan: data.plan || "Strategic",
          },
        },
      })

      if (authError) {
        console.error("Sign-up error:", authError)
        return {
          success: false,
          error: {
            message: getReadableErrorMessage(authError.message),
            field: getErrorField(authError.message),
          },
        }
      }

      if (authData.user) {
        console.log("Sign-up successful")

        // Try to create profile immediately if we have a session
        if (authData.session) {
          console.log("User is immediately authenticated, creating profile")
          await createUserProfileInDb(authData.user.id, authData.user)
        } else {
          // Email verification required
          console.log("Email verification required")
        }

        // Return success with user data, but don't redirect
        return {
          success: true,
          user: authData.user,
          error: !authData.session
            ? {
                message:
                  "Please check your email to verify your account. You can continue with onboarding in the meantime.",
              }
            : undefined,
        }
      }

      return {
        success: false,
        error: {
          message: "Sign-up failed. Please try again.",
        },
      }
    } catch (error) {
      console.error("Sign-up exception:", error)
      return {
        success: false,
        error: {
          message: "An unexpected error occurred. Please try again.",
        },
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: AuthError; user?: User }> => {
    try {
      setIsLoading(true)
      console.log("Starting sign-in process for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error("Sign-in error:", error)
        return {
          success: false,
          error: {
            message: getReadableErrorMessage(error.message),
            field: getErrorField(error.message),
          },
        }
      }

      console.log("Sign-in successful")

      // Return success with user data, but don't redirect
      return {
        success: true,
        user: data.user,
      }
    } catch (error) {
      console.error("Sign-in exception:", error)
      return {
        success: false,
        error: {
          message: "An unexpected error occurred. Please try again.",
        },
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      console.log("Resending verification email to:", email)

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      })

      if (error) {
        console.error("Resend verification error:", error)
        return {
          success: false,
          error: { message: getReadableErrorMessage(error.message) },
        }
      }

      console.log("Verification email resent successfully")
      return { success: true }
    } catch (error) {
      console.error("Resend verification exception:", error)
      return {
        success: false,
        error: { message: "Failed to resend verification email." },
      }
    }
  }

  const runDiagnostic = async () => {
    return await AuthDebugger.runFullDiagnostic()
  }

  const getUserDisplayName = (): string => {
    try {
      if (profile?.full_name?.trim()) {
        return profile.full_name.trim()
      }
      if (user?.user_metadata?.full_name?.trim()) {
        return user.user_metadata.full_name.trim()
      }
      if (user?.email) {
        const emailPrefix = user.email.split("@")[0]
        return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
      }
      return "User"
    } catch (error) {
      console.error("Error getting display name:", error)
      return "User"
    }
  }

  const getReadableErrorMessage = (message: string): string => {
    const errorMap: Record<string, string> = {
      "Invalid login credentials": "Invalid email or password. Please check your credentials and try again.",
      "Email not confirmed": "Please check your email and click the confirmation link before signing in.",
      "User already registered": "An account with this email already exists. Please sign in instead.",
      "Password should be at least 6 characters": "Password must be at least 6 characters long.",
      "Unable to validate email address: invalid format": "Please enter a valid email address.",
      "signup is disabled": "New account registration is currently disabled. Please contact support.",
      "Email rate limit exceeded": "Too many emails sent. Please wait before requesting another verification email.",
    }

    return errorMap[message] || message
  }

  const getErrorField = (message: string): string | undefined => {
    if (message.toLowerCase().includes("email")) return "email"
    if (message.toLowerCase().includes("password")) return "password"
    return undefined
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        resendVerification,
        updateProfile,
        runDiagnostic,
        getUserDisplayName,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
