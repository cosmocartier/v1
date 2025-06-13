"use client"

import Link from "next/link"
import {
  Settings,
  LifeBuoy,
  BotMessageSquare,
  LayoutGrid,
  Layers,
  Target,
  ListChecks,
  Flag,
  Network,
  Calendar,
  Brain,
  Bookmark,
  Bell,
  BarChart3,
  Users,
  FileText,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useNotifications } from "@/lib/notification-context"
import { useStrategic } from "@/lib/strategic-context"
import { MELogo } from "@/components/me-logo"

interface KokonutSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function KokonutSidebar({ sidebarOpen, setSidebarOpen }: KokonutSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { unreadCount } = useNotifications()
  const { initiatives, operations, tasks } = useStrategic()

  // Calculate active counts for badges
  const activeInitiatives = initiatives.filter((i) => i.status !== "Completed").length
  const activeOperations = operations.filter((o) => o.status === "In Progress").length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length

  const mainNavItems = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutGrid,
      description: "Strategic dashboard and metrics",
    },
    {
      href: "/dashboard/initiatives",
      label: "Initiatives",
      icon: Layers,
      badge: activeInitiatives > 0 ? activeInitiatives : null,
      description: "Strategic initiatives",
    },
    {
      href: "/dashboard/operations",
      label: "Operations",
      icon: Target,
      badge: activeOperations > 0 ? activeOperations : null,
      description: "Tactical operations",
    },
    {
      href: "/dashboard/tasks",
      label: "Tasks",
      icon: ListChecks,
      badge: pendingTasks > 0 ? pendingTasks : null,
      description: "Task management",
    },
    {
      href: "/dashboard/milestones",
      label: "Milestones",
      icon: Flag,
      description: "Key milestones",
    },
    {
      href: "/dashboard/profiles",
      label: "Profiles",
      icon: Users,
      description: "Character analysis",
    },
  ]

  const analyticsNavItems = [
    {
      href: "/dashboard/graph",
      label: "Graph View",
      icon: Network,
      description: "Visual mapping",
    },
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: Calendar,
      description: "Timeline view",
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Performance insights",
    },
  ]

  const toolsNavItems = [
    {
      href: "/chat",
      label: "AI Assistant",
      icon: BotMessageSquare,
      description: "AI guidance",
    },
    {
      href: "/dashboard/memory",
      label: "Knowledge",
      icon: Brain,
      description: "Knowledge base",
    },
    {
      href: "/dashboard/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      description: "Saved items",
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
      description: "Alerts & updates",
    },
  ]

  const systemNavItems = [
    {
      href: "/dashboard/templates",
      label: "Templates",
      icon: FileText,
      description: "Templates",
    },
    {
      href: "/dashboard/automation",
      label: "Automation",
      icon: Zap,
      description: "Workflows",
    },
    {
      href: "/dashboard/team",
      label: "Team",
      icon: Users,
      description: "Team management",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      description: "Configuration",
    },
  ]

  const secondaryNavItems = [
    {
      href: "/dashboard/support",
      label: "Support",
      icon: LifeBuoy,
      description: "Help & docs",
    },
  ]

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setSidebarOpen])

  // Handle route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, setSidebarOpen, isMobile])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
    } else {
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
    }
  }, [sidebarOpen, isMobile])

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const toggleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed)
    }
  }

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard")

    return (
      <Link href={item.href} onClick={handleLinkClick}>
        <div
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-none neo-interactive",
            "text-white/70 hover:text-white hover:bg-white/5",
            isMobile || !isCollapsed ? "justify-start" : "justify-center",
            isActive && "text-white bg-white/10 border-l-2 border-neo-accent",
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />

          {(isMobile || !isCollapsed) && (
            <>
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <div className="ml-auto">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-neo-accent/20 text-xs font-bold text-neo-accent tabular-nums">
                    {item.badge > 99 ? "99+" : item.badge}
                  </div>
                </div>
              )}
            </>
          )}

          {!isMobile && isCollapsed && item.badge && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded bg-neo-accent text-xs font-bold text-black tabular-nums">
              {item.badge > 9 ? "9+" : item.badge}
            </div>
          )}
        </div>
      </Link>
    )
  }

  const renderNavSection = (items: any[], title: string) => (
    <div className="space-y-1">
      {(isMobile || !isCollapsed) && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">{title}</h3>
        </div>
      )}
      {items.map((item) => (
        <NavItem key={item.label} item={item} />
      ))}
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-30 bg-black/80" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full transform flex-col border-r border-neutral-800 bg-[#0B0B0B] transition-transform duration-200 ease-out",
          // Mobile behavior
          isMobile
            ? sidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64"
            : // Desktop behavior
              cn("static translate-x-0", isCollapsed ? "w-16" : "w-64"),
        )}
      >
        {/* Header - Logo only */}
        <div className={cn("flex items-center justify-center border-b border-neutral-800 h-16 px-4")}>
          <Link href="/" className="group" onClick={handleLinkClick}>
            <MELogo size={isMobile || !isCollapsed ? "lg" : "md"} variant="sidebar" priority={true} />
          </Link>

          {/* Collapse/Expand Toggle - Hidden on mobile */}
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-white/70 hover:text-white hover:bg-white/10 transition-none",
                isCollapsed ? "absolute -right-3 top-5 z-50 border border-neutral-800 bg-[#0B0B0B]" : "ml-auto",
              )}
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 py-4 overflow-y-auto space-y-6">
            {renderNavSection(mainNavItems, "Strategic")}
            {renderNavSection(analyticsNavItems, "Analytics")}
            {renderNavSection(toolsNavItems, "Tools")}
            {renderNavSection(systemNavItems, "System")}
          </nav>

          {/* Footer Section */}
          <div className="border-t border-neutral-800 py-4">
            {renderNavSection(secondaryNavItems, "Support")}

            {/* Status indicator - Only show when expanded */}
            {(isMobile || !isCollapsed) && (
              <div className="px-3 py-2 mt-4">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="font-medium tabular-nums">v2.1.0</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-neo-success rounded-full"></div>
                    <span className="font-medium">Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
