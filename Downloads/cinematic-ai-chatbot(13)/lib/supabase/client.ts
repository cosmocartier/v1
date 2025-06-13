import { createClient } from "@supabase/supabase-js"

// NOTE: This file is intentionally the *only* place in the codebase where
// `createClient` from `@supabase/supabase-js` should be invoked. The
// application relies on this singleton to avoid multiple Supabase client
// instances which can lead to subtle bugs in development.

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

const createSupabaseClient = () => {
  if (supabaseInstance) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "createSupabaseClient called multiple times; returning existing singleton instance"
      )
    }
    return supabaseInstance
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    global: {
      headers: {
        "X-Client-Info": "nextjs-auth-app",
      },
    },
  })

  return supabaseInstance
}

// Export the singleton instance
export const supabase = createSupabaseClient()

// Add connection test
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)
    return { success: !error, error }
  } catch (error) {
    return { success: false, error }
  }
}

// Helper to get the same instance (for debugging)
export const getSupabaseInstance = () => supabaseInstance
