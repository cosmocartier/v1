import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { SessionProvider } from "@/lib/session-context"
import { StrategicProvider } from "@/lib/strategic-context"
import { NotificationProvider } from "@/lib/notification-context"
import { MemoryProvider } from "@/lib/memory-context"
import { BookmarksProvider } from "@/lib/bookmarks-context"
import { SettingsProvider } from "@/lib/settings-context"
import { ProfileProvider } from "@/lib/profile-context"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Machine Excellence - Strategic Operations Platform",
  description: "Advanced strategic operations management and AI-powered tactical assistance",
  icons: {
    icon: [
      { url: "/images/me-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/me-logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/images/me-logo.png", sizes: "180x180", type: "image/png" }],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Machine Excellence",
  },
  formatDetection: {
    telephone: false,
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        {/* Partitioned cookie handling */}
        <meta httpEquiv="Permissions-Policy" content="storage-access=*, unpartitioned-cookie-access=*" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <SessionProvider>
                <StrategicProvider>
                  <NotificationProvider>
                    <MemoryProvider>
                      <BookmarksProvider>
                        <SettingsProvider>
                          <ProfileProvider>
                            <div className="relative flex min-h-screen flex-col">
                              <main className="flex-1">{children}</main>
                            </div>
                            <Toaster />
                          </ProfileProvider>
                        </SettingsProvider>
                      </BookmarksProvider>
                    </MemoryProvider>
                  </NotificationProvider>
                </StrategicProvider>
              </SessionProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
