"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  User,
  TrendingUp,
  Archive,
  ExternalLink,
  X,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/lib/notification-context"
import type { Notification, NotificationType } from "@/lib/notification-types"

interface NotificationItemProps {
  notification: Notification
}

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  deadline_created: Clock,
  deadline_modified: Clock,
  deadline_completed: CheckCircle,
  deadline_approaching: AlertTriangle,
  deadline_overdue: AlertTriangle,
  milestone_achieved: Target,
  task_assigned: User,
  initiative_status_change: TrendingUp,
  operation_status_change: TrendingUp,
}

const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200 animate-pulse",
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, archiveNotification, dismissNotification } = useNotifications()
  const [isHovered, setIsHovered] = useState(false)

  const Icon = notificationIcons[notification.type] || Bell
  const isUnread = notification.status === "unread"

  const handleClick = () => {
    if (isUnread) {
      markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead(notification.id)
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    archiveNotification(notification.id)
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    dismissNotification(notification.id)
  }

  return (
    <div
      className={cn(
        "group relative p-4 border-l-4 transition-all duration-200 cursor-pointer hover:bg-muted/50",
        isUnread ? "border-l-primary bg-primary/5" : "border-l-transparent",
        notification.priority === "critical" && "border-l-red-500 bg-red-50/50",
        notification.priority === "high" && "border-l-orange-500",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 p-2 rounded-full", priorityColors[notification.priority])}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4
                className={cn(
                  "font-medium text-sm leading-tight",
                  isUnread ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {notification.title}
              </h4>

              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {notification.type.replace(/_/g, " ")}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                </span>

                {notification.relatedItemTitle && (
                  <span className="text-xs text-muted-foreground truncate">• {notification.relatedItemTitle}</span>
                )}
              </div>
            </div>

            <div className={cn("flex items-center gap-1 transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>
              {notification.actionUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(notification.actionUrl, "_blank")
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isUnread && (
                    <DropdownMenuItem onClick={handleMarkAsRead}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDismiss} className="text-destructive">
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {isUnread && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />}
      </div>
    </div>
  )
}
