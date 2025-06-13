import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create server client for middleware (different from browser client)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  try {
    // Handle email verification callback first
    if (request.nextUrl.pathname === "/auth/callback") {
      const code = request.nextUrl.searchParams.get("code")
      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (!exchangeError) {
            // Successful email verification - redirect to dashboard
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        } catch (callbackError) {
          console.error("Callback exchange error:", callbackError)
        }
      }
      // If verification failed, redirect to signin
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Get user session - handle missing session gracefully
    let user = null
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      // Only log actual errors, not missing sessions
      if (authError && authError.message !== "Auth session missing!") {
        console.error("Middleware auth error:", authError)
      }

      user = authUser
    } catch (error) {
      // Silently handle auth errors - user is simply not authenticated
      user = null
    }

    // Protect dashboard and chat routes
    if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/chat")) {
      if (!user) {
        // Add return URL for redirect after login
        const returnUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
        return NextResponse.redirect(new URL(`/?returnUrl=${returnUrl}`, request.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (
      (request.nextUrl.pathname === "/auth" ||
        request.nextUrl.pathname === "/auth/signin" ||
        request.nextUrl.pathname === "/auth/signup") &&
      user
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Allow access to public routes (home page, etc.)
    return response
  } catch (error) {
    // Log unexpected errors but don't crash
    console.error("Middleware exception:", error)

    // For protected routes, redirect to home if there's an error
    if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/chat")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // For other routes, continue normally
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)",
  ],
}
