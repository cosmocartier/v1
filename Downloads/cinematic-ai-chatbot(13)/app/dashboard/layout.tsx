"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { KokonutSidebar } from "@/components/kokonutui/sidebar"
import { KokonutTopNav } from "@/components/kokonutui/top-nav"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.querySelector("[data-sidebar]")
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, sidebarOpen])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [sidebarOpen, isMobile])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Collapsible Sidebar */}
      <KokonutSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <KokonutTopNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page content with mobile-optimized padding */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div
            className={cn(
              "mx-auto max-w-7xl min-h-full",
              // Mobile-first responsive padding
              "p-4 sm:p-6 lg:p-8",
              // Ensure content doesn't get too wide on large screens
              "w-full",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
