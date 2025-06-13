"use client"

import { useState } from "react"
import { Menu, Search, Bell, Settings, User, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { UserAccountDropdown } from "@/components/user-account-dropdown"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { MELogo } from "@/components/me-logo"
import Link from "next/link"

interface KokonutTopNavProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function KokonutTopNav({ sidebarOpen, setSidebarOpen }: KokonutTopNavProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-neutral-800 bg-[#0E0E0E] px-4 sm:px-6">
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-none flex-shrink-0"
        >
          <Menu className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        {/* Mobile logo - only show when sidebar is closed */}
        <div className="lg:hidden flex-shrink-0">
          {!sidebarOpen && (
            <Link href="/" className="group">
              <MELogo size="sm" variant="mobile" />
            </Link>
          )}
        </div>

        {/* Desktop Search */}
        <div className="relative hidden md:block flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={1.5} />
          <Input
            placeholder="Search operations, tasks, initiatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 h-9 bg-white/5 border-neutral-700 text-white placeholder:text-white/40",
              "focus:border-neo-accent focus:ring-1 focus:ring-neo-accent transition-none",
              "hover:bg-white/10",
            )}
          />
        </div>

        {/* Mobile Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-none flex-shrink-0"
        >
          {showMobileSearch ? (
            <X className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Search className="h-4 w-4" strokeWidth={1.5} />
          )}
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Quick actions - hidden on small mobile */}
        <Button
          size="sm"
          className="hidden sm:flex h-8 bg-white text-black hover:bg-neutral-100 transition-none font-medium text-xs sm:text-sm px-2 sm:px-3"
        >
          <Plus className="h-3 w-3 mr-1 sm:mr-1.5" strokeWidth={2} />
          <span className="hidden sm:inline">New</span>
        </Button>

        {/* Mobile New Button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-none"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-none"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded bg-neo-accent text-xs font-bold text-black tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </Button>

        {/* Settings - hidden on small mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-none"
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        {/* User menu */}
        {user ? (
          <UserAccountDropdown />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 transition-none"
          >
            <User className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="absolute top-full left-0 right-0 bg-[#0E0E0E] border-b border-neutral-800 p-4 md:hidden z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={1.5} />
            <Input
              placeholder="Search operations, tasks, initiatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 h-10 bg-white/5 border-neutral-700 text-white placeholder:text-white/40",
                "focus:border-neo-accent focus:ring-1 focus:ring-neo-accent transition-none",
              )}
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
