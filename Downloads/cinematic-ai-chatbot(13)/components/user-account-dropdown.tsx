"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, LogOut, ChevronDown, Bell, CreditCard, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

export function UserAccountDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut, getUserDisplayName } = useAuth()
  const router = useRouter()

  if (!user) return null

  const displayName = getUserDisplayName()
  const userEmail = user.email || "No email"

  // Create initials safely
  const getInitials = (name: string): string => {
    try {
      return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    } catch (error) {
      console.error("Error creating initials:", error)
      return "U"
    }
  }

  const initials = getInitials(displayName)

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      onClick: () => {
        router.push("/dashboard/profiles")
        setIsOpen(false)
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        router.push("/dashboard/settings")
        setIsOpen(false)
      },
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: () => {
        router.push("/dashboard/notifications")
        setIsOpen(false)
      },
    },
    {
      icon: CreditCard,
      label: "Billing",
      onClick: () => {
        router.push("/dashboard/billing")
        setIsOpen(false)
      },
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => {
        router.push("/dashboard/help")
        setIsOpen(false)
      },
    },
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto p-2 hover:bg-white/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.user_metadata?.avatar_url || profile?.avatar_url || "/placeholder.svg"}
            alt={displayName}
          />
          <AvatarFallback className="bg-neo-accent text-black text-sm font-medium">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-medium text-white truncate max-w-32">{displayName}</span>
          <span className="text-xs text-white/60 truncate max-w-32">{userEmail}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-white/60 flex-shrink-0" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-2 w-64 bg-card border border-neutral-800 rounded-lg shadow-xl z-50"
            >
              {/* User Info Header */}
              <div className="p-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || profile?.avatar_url || "/placeholder.svg"}
                      alt={displayName}
                    />
                    <AvatarFallback className="bg-neo-accent text-black font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate" title={displayName}>
                      {displayName}
                    </p>
                    <p className="text-xs text-white/60 truncate" title={userEmail}>
                      {userEmail}
                    </p>
                    {profile?.plan && <p className="text-xs text-neo-accent font-medium mt-1">{profile.plan} Plan</p>}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-neutral-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
