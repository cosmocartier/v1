import { supabase } from "./client"

export class AuthDebugger {
  static async checkConnection() {
    console.log("🔍 Checking Supabase connection...")

    try {
      const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

      if (error) {
        console.error("❌ Database connection failed:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Database connection successful")
      return { success: true }
    } catch (error) {
      console.error("❌ Connection test failed:", error)
      return { success: false, error: "Network error" }
    }
  }

  static async checkEnvironmentVariables() {
    console.log("🔍 Checking environment variables...")

    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missing = requiredVars.filter((varName) => !process.env[varName])

    if (missing.length > 0) {
      console.error("❌ Missing environment variables:", missing)
      return { success: false, missing }
    }

    console.log("✅ All environment variables present")
    return { success: true }
  }

  static async checkAuthSettings() {
    console.log("🔍 Checking auth settings...")

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("❌ Auth session check failed:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Auth settings working, current session:", session ? "Active" : "None")
      return { success: true, hasSession: !!session }
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      return { success: false, error: "Auth system error" }
    }
  }

  static async testSignUp(testEmail = "test@example.com") {
    console.log("🔍 Testing sign-up flow...")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "TestPassword123!",
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      if (error) {
        console.error("❌ Sign-up test failed:", error)
        return { success: false, error: error.message }
      }

      console.log("✅ Sign-up test successful:", data)
      return { success: true, data }
    } catch (error) {
      console.error("❌ Sign-up test error:", error)
      return { success: false, error: "Sign-up system error" }
    }
  }

  static async runFullDiagnostic() {
    console.log("🚀 Running full authentication diagnostic...")

    const results = {
      environment: await this.checkEnvironmentVariables(),
      connection: await this.checkConnection(),
      auth: await this.checkAuthSettings(),
    }

    console.log("📊 Diagnostic Results:", results)
    return results
  }
}
