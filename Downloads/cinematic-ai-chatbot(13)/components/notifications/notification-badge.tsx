"use client"
import { useNotifications } from "@/lib/notification-context"
import { NotificationCenter } from "./notification-center"

export function NotificationBadge() {
  const { unreadCount } = useNotifications()

  return <NotificationCenter />
}
