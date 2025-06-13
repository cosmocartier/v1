"use client"

import { useState, useMemo } from "react"
import { Bell, Filter, Settings, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useNotifications } from "@/lib/notification-context"
import { NotificationItem } from "./notification-item"
import { NotificationFilters } from "./notification-filters"
import { NotificationPreferences } from "./notification-preferences"
import type { NotificationFilter } from "@/lib/notification-types"

export function NotificationCenter() {
  const { notifications, unreadCount, markAllAsRead, filterNotifications, isLoading } = useNotifications()

  const [activeTab, setActiveTab] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [filters, setFilters] = useState<NotificationFilter>({})

  // Filter notifications based on active tab and filters
  const filteredNotifications = useMemo(() => {
    const baseFilter: NotificationFilter = { ...filters }

    switch (activeTab) {
      case "unread":
        baseFilter.statuses = ["unread"]
        break
      case "critical":
        baseFilter.priorities = ["critical", "high"]
        break
      case "archived":
        baseFilter.statuses = ["archived"]
        break
      default:
        // Don't filter archived notifications in "all" tab
        if (!baseFilter.statuses) {
          baseFilter.statuses = ["unread", "read"]
        }
        break
    }

    return filterNotifications(baseFilter)
  }, [notifications, activeTab, filters, filterNotifications])

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof filteredNotifications> = {}

    filteredNotifications.forEach((notification) => {
      const date = notification.timestamp.toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(notification)
    })

    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [filteredNotifications])

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && <Badge variant="secondary">{unreadCount}</Badge>}
              </SheetTitle>
              <SheetDescription>Stay updated on your strategic initiatives</SheetDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreferences(!showPreferences)}
                className={showPreferences ? "bg-muted" : ""}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {unreadCount > 0 && (
                <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all as read">
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {showFilters && (
          <div className="px-6 pb-4">
            <NotificationFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {showPreferences && (
          <div className="px-6 pb-4">
            <NotificationPreferences />
          </div>
        )}

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 py-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="archived">Archive</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : groupedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    {activeTab === "unread"
                      ? "You're all caught up!"
                      : activeTab === "critical"
                        ? "No critical notifications"
                        : activeTab === "archived"
                          ? "No archived notifications"
                          : "You'll see notifications here when they arrive"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedNotifications.map(([dateString, notifications]) => (
                    <div key={dateString}>
                      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-2 border-b">
                        <h4 className="font-medium text-sm text-muted-foreground">{formatDateGroup(dateString)}</h4>
                      </div>

                      <div className="space-y-1">
                        {notifications.map((notification) => (
                          <NotificationItem key={notification.id} notification={notification} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
