"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import { useStrategic } from "./strategic-context"
import {
  NOTIFICATION_TEMPLATES,
  type Notification,
  type NotificationPreferences,
  type NotificationFilter,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus,
} from "./notification-types"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences | null
  isLoading: boolean

  // Actions
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  archiveNotification: (notificationId: string) => void
  dismissNotification: (notificationId: string) => void
  filterNotifications: (filter: NotificationFilter) => Notification[]
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void

  // Real-time
  subscribeToNotifications: () => void
  unsubscribeFromNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Default preferences
const DEFAULT_PREFERENCES: Omit<NotificationPreferences, "userId"> = {
  enableInApp: true,
  enableEmail: true,
  enableSlack: false,
  enablePush: true,

  typePreferences: {
    deadline_created: { enabled: true, channels: ["in_app"], priority: "medium" },
    deadline_modified: { enabled: true, channels: ["in_app", "email"], priority: "medium" },
    deadline_completed: { enabled: true, channels: ["in_app"], priority: "low" },
    deadline_approaching: { enabled: true, channels: ["in_app", "push"], priority: "high" },
    deadline_overdue: { enabled: true, channels: ["in_app", "email", "push"], priority: "critical" },
    milestone_achieved: { enabled: true, channels: ["in_app"], priority: "medium" },
    task_assigned: { enabled: true, channels: ["in_app", "email"], priority: "medium" },
    initiative_status_change: { enabled: true, channels: ["in_app"], priority: "medium" },
    operation_status_change: { enabled: true, channels: ["in_app"], priority: "medium" },
  },

  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  enableBatching: false,
  batchInterval: 60,

  enableSounds: true,
  enableVisualCues: true,
  soundTheme: "default",
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { initiatives, operations, tasks } = useStrategic()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [previousData, setPreviousData] = useState<any>(null)

  // Calculate unread count
  const unreadCount = notifications.filter((n) => n.status === "unread").length

  // Load initial data
  useEffect(() => {
    if (user) {
      loadNotifications()
      loadPreferences()
    }
  }, [user])

  // Monitor strategic data changes for notifications
  useEffect(() => {
    if (!user || !preferences) return

    const currentData = { initiatives, operations, tasks }

    if (previousData) {
      detectAndCreateNotifications(previousData, currentData)
    }

    setPreviousData(currentData)
  }, [initiatives, operations, tasks, user, preferences])

  // Load notifications from storage
  const loadNotifications = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // In a real app, this would be an API call
      const stored = localStorage.getItem(`notifications_${user.id}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        const notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          archivedAt: n.archivedAt ? new Date(n.archivedAt) : undefined,
          dismissedAt: n.dismissedAt ? new Date(n.dismissedAt) : undefined,
        }))
        setNotifications(notifications)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Load preferences from storage
  const loadPreferences = useCallback(async () => {
    if (!user) return

    try {
      const stored = localStorage.getItem(`notification_preferences_${user.id}`)
      if (stored) {
        setPreferences(JSON.parse(stored))
      } else {
        const defaultPrefs = { ...DEFAULT_PREFERENCES, userId: user.id }
        setPreferences(defaultPrefs)
        localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(defaultPrefs))
      }
    } catch (error) {
      console.error("Failed to load preferences:", error)
      const defaultPrefs = { ...DEFAULT_PREFERENCES, userId: user.id }
      setPreferences(defaultPrefs)
    }
  }, [user])

  // Save notifications to storage
  const saveNotifications = useCallback(
    (notifications: Notification[]) => {
      if (!user) return
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications))
    },
    [user],
  )

  // Detect changes and create notifications
  const detectAndCreateNotifications = useCallback(
    (previous: any, current: any) => {
      if (!user || !preferences) return

      const newNotifications: Notification[] = []

      // Check for new deadlines
      const allCurrentItems = [...current.initiatives, ...current.operations, ...current.tasks]
      const allPreviousItems = [...previous.initiatives, ...previous.operations, ...previous.tasks]

      // Detect new items with deadlines
      allCurrentItems.forEach((item) => {
        const previousItem = allPreviousItems.find((p) => p.id === item.id)

        if (!previousItem && item.dueDate) {
          // New item with deadline
          newNotifications.push(
            createNotification("deadline_created", {
              itemTitle: item.title,
              itemType: item.type || "task",
              dueDate: new Date(item.dueDate).toLocaleDateString(),
              relatedItemId: item.id,
              relatedItemType: item.type || "task",
            }),
          )
        } else if (previousItem && previousItem.dueDate !== item.dueDate) {
          // Deadline modified
          newNotifications.push(
            createNotification("deadline_modified", {
              itemTitle: item.title,
              itemType: item.type || "task",
              newDueDate: new Date(item.dueDate).toLocaleDateString(),
              relatedItemId: item.id,
              relatedItemType: item.type || "task",
            }),
          )
        } else if (previousItem && previousItem.status !== item.status && item.status === "Completed") {
          // Item completed
          newNotifications.push(
            createNotification("deadline_completed", {
              itemTitle: item.title,
              itemType: item.type || "task",
              relatedItemId: item.id,
              relatedItemType: item.type || "task",
            }),
          )
        }
      })

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const updated = [...newNotifications, ...prev]
          saveNotifications(updated)
          return updated
        })

        // Trigger notifications
        newNotifications.forEach((notification) => {
          triggerNotification(notification)
        })
      }
    },
    [user, preferences],
  )

  // Create a notification
  const createNotification = useCallback(
    (type: NotificationType, data: any): Notification => {
      const template = NOTIFICATION_TEMPLATES[type]
      const typePrefs = preferences?.typePreferences[type]

      return {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        priority: typePrefs?.priority || template.defaultPriority,
        status: "unread",
        title: template.title(data),
        message: template.message(data),
        timestamp: new Date(),
        userId: user!.id,
        relatedItemId: data.relatedItemId,
        relatedItemType: data.relatedItemType,
        relatedItemTitle: data.itemTitle,
        actionUrl: data.relatedItemId
          ? `/dashboard/calendar?event=${data.relatedItemType}-${data.relatedItemId}`
          : undefined,
        actionLabel: "View in Calendar",
        channels: typePrefs?.channels || template.defaultChannels,
        metadata: data,
      }
    },
    [user, preferences],
  )

  // Trigger notification (sound, push, etc.)
  const triggerNotification = useCallback(
    (notification: Notification) => {
      if (!preferences) return

      // Visual notification
      if (preferences.enableVisualCues && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/favicon.ico",
            tag: notification.id,
          })
        }
      }

      // Sound notification
      if (preferences.enableSounds) {
        playNotificationSound(notification.priority, preferences.soundTheme)
      }

      // External channels would be handled here
      // (email, Slack, etc.)
    },
    [preferences],
  )

  // Play notification sound
  const playNotificationSound = useCallback((priority: NotificationPriority, theme: string) => {
    try {
      const audio = new Audio()

      switch (priority) {
        case "critical":
          audio.src = "/sounds/critical.mp3"
          break
        case "high":
          audio.src = "/sounds/high.mp3"
          break
        default:
          audio.src = "/sounds/default.mp3"
          break
      }

      audio.volume = 0.5
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    } catch (error) {
      // Ignore audio errors
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read" as NotificationStatus, readAt: new Date() } : n,
        )
        saveNotifications(updated)
        return updated
      })
    },
    [saveNotifications],
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.status === "unread" ? { ...n, status: "read" as NotificationStatus, readAt: new Date() } : n,
      )
      saveNotifications(updated)
      return updated
    })
  }, [saveNotifications])

  // Archive notification
  const archiveNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notificationId ? { ...n, status: "archived" as NotificationStatus, archivedAt: new Date() } : n,
        )
        saveNotifications(updated)
        return updated
      })
    },
    [saveNotifications],
  )

  // Dismiss notification
  const dismissNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notificationId)
        saveNotifications(updated)
        return updated
      })
    },
    [saveNotifications],
  )

  // Filter notifications
  const filterNotifications = useCallback(
    (filter: NotificationFilter): Notification[] => {
      return notifications.filter((notification) => {
        // Filter by types
        if (filter.types && filter.types.length > 0 && !filter.types.includes(notification.type)) {
          return false
        }

        // Filter by priorities
        if (filter.priorities && filter.priorities.length > 0 && !filter.priorities.includes(notification.priority)) {
          return false
        }

        // Filter by statuses
        if (filter.statuses && filter.statuses.length > 0 && !filter.statuses.includes(notification.status)) {
          return false
        }

        // Filter by date range
        if (filter.dateRange) {
          const notificationDate = notification.timestamp
          if (notificationDate < filter.dateRange.start || notificationDate > filter.dateRange.end) {
            return false
          }
        }

        // Filter by related item type
        if (filter.relatedItemType && notification.relatedItemType !== filter.relatedItemType) {
          return false
        }

        // Filter by search
        if (filter.search && filter.search.trim() !== "") {
          const searchTerm = filter.search.toLowerCase()
          const matchesTitle = notification.title.toLowerCase().includes(searchTerm)
          const matchesMessage = notification.message.toLowerCase().includes(searchTerm)
          const matchesRelatedItem = notification.relatedItemTitle?.toLowerCase().includes(searchTerm) || false

          if (!matchesTitle && !matchesMessage && !matchesRelatedItem) {
            return false
          }
        }

        return true
      })
    },
    [notifications],
  )

  // Update preferences
  const updatePreferences = useCallback(
    (newPreferences: Partial<NotificationPreferences>) => {
      if (!user) return

      setPreferences((prev) => {
        if (!prev) return null

        const updated = { ...prev, ...newPreferences }
        localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(updated))
        return updated
      })
    },
    [user],
  )

  // Subscribe to real-time notifications
  const subscribeToNotifications = useCallback(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    // In a real app, this would set up WebSocket or SSE connection
    console.log("Subscribed to real-time notifications")
  }, [])

  // Unsubscribe from real-time notifications
  const unsubscribeFromNotifications = useCallback(() => {
    // In a real app, this would close WebSocket or SSE connection
    console.log("Unsubscribed from real-time notifications")
  }, [])

  // Check for approaching deadlines periodically
  useEffect(() => {
    if (!user || !preferences) return

    const checkDeadlines = () => {
      const now = new Date()
      const allItems = [...initiatives, ...operations, ...tasks]

      allItems.forEach((item) => {
        if (!item.dueDate) return

        const dueDate = new Date(item.dueDate)
        const timeDiff = dueDate.getTime() - now.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

        // Check if we should notify about approaching deadline
        const existingNotification = notifications.find(
          (n) =>
            n.type === "deadline_approaching" &&
            n.relatedItemId === item.id &&
            n.timestamp > new Date(now.getTime() - 24 * 60 * 60 * 1000), // Within last 24 hours
        )

        if (!existingNotification) {
          if (daysDiff === 1) {
            // Due tomorrow
            const notification = createNotification("deadline_approaching", {
              itemTitle: item.title,
              itemType: item.type || "task",
              timeRemaining: "1 day",
              relatedItemId: item.id,
              relatedItemType: item.type || "task",
            })

            setNotifications((prev) => {
              const updated = [notification, ...prev]
              saveNotifications(updated)
              return updated
            })

            triggerNotification(notification)
          } else if (daysDiff <= 0) {
            // Overdue
            const overdueDays = Math.abs(daysDiff)
            const notification = createNotification("deadline_overdue", {
              itemTitle: item.title,
              itemType: item.type || "task",
              overdueDuration: `${overdueDays} day${overdueDays !== 1 ? "s" : ""}`,
              relatedItemId: item.id,
              relatedItemType: item.type || "task",
            })

            setNotifications((prev) => {
              const updated = [notification, ...prev]
              saveNotifications(updated)
              return updated
            })

            triggerNotification(notification)
          }
        }
      })
    }

    // Check immediately and then every hour
    checkDeadlines()
    const interval = setInterval(checkDeadlines, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [
    user,
    preferences,
    initiatives,
    operations,
    tasks,
    notifications,
    createNotification,
    triggerNotification,
    saveNotifications,
  ])

  const value = {
    notifications,
    unreadCount,
    preferences,
    isLoading,

    markAsRead,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    filterNotifications,
    updatePreferences,

    subscribeToNotifications,
    unsubscribeFromNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }

  return context
}
