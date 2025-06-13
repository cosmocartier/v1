export type NotificationType =
  | "deadline_created"
  | "deadline_modified"
  | "deadline_completed"
  | "deadline_approaching"
  | "deadline_overdue"
  | "milestone_achieved"
  | "task_assigned"
  | "initiative_status_change"
  | "operation_status_change"

export type NotificationPriority = "low" | "medium" | "high" | "critical"

export type NotificationStatus = "unread" | "read" | "archived"

export type NotificationChannel = "in_app" | "email" | "push" | "slack"

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message: string
  timestamp: Date
  userId: string
  relatedItemId?: string
  relatedItemType?: string
  relatedItemTitle?: string
  actionUrl?: string
  actionLabel?: string
  channels: NotificationChannel[]
  metadata?: Record<string, any>
  readAt?: Date
  archivedAt?: Date
  dismissedAt?: Date
}

export interface NotificationTemplate {
  title: (data: any) => string
  message: (data: any) => string
  defaultPriority: NotificationPriority
  defaultChannels: NotificationChannel[]
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  deadline_created: {
    title: (data) => `New Deadline: ${data.itemTitle}`,
    message: (data) => `A new deadline has been set for ${data.itemType} "${data.itemTitle}" due on ${data.dueDate}.`,
    defaultPriority: "medium",
    defaultChannels: ["in_app"],
  },
  deadline_modified: {
    title: (data) => `Deadline Updated: ${data.itemTitle}`,
    message: (data) => `The deadline for ${data.itemType} "${data.itemTitle}" has been changed to ${data.newDueDate}.`,
    defaultPriority: "medium",
    defaultChannels: ["in_app", "email"],
  },
  deadline_completed: {
    title: (data) => `Completed: ${data.itemTitle}`,
    message: (data) => `Great job! You've completed ${data.itemType} "${data.itemTitle}".`,
    defaultPriority: "low",
    defaultChannels: ["in_app"],
  },
  deadline_approaching: {
    title: (data) => `Deadline Approaching: ${data.itemTitle}`,
    message: (data) => `${data.itemType} "${data.itemTitle}" is due in ${data.timeRemaining}.`,
    defaultPriority: "high",
    defaultChannels: ["in_app", "push"],
  },
  deadline_overdue: {
    title: (data) => `Overdue: ${data.itemTitle}`,
    message: (data) => `${data.itemType} "${data.itemTitle}" is overdue by ${data.overdueDuration}.`,
    defaultPriority: "critical",
    defaultChannels: ["in_app", "email", "push"],
  },
  milestone_achieved: {
    title: (data) => `Milestone Achieved: ${data.milestoneTitle}`,
    message: (data) => `Congratulations! You've achieved the milestone "${data.milestoneTitle}".`,
    defaultPriority: "medium",
    defaultChannels: ["in_app"],
  },
  task_assigned: {
    title: (data) => `New Task Assigned: ${data.taskTitle}`,
    message: (data) => `You've been assigned a new task: "${data.taskTitle}".`,
    defaultPriority: "medium",
    defaultChannels: ["in_app", "email"],
  },
  initiative_status_change: {
    title: (data) => `Initiative Status Changed: ${data.initiativeTitle}`,
    message: (data) => `Initiative "${data.initiativeTitle}" status changed to ${data.newStatus}.`,
    defaultPriority: "medium",
    defaultChannels: ["in_app"],
  },
  operation_status_change: {
    title: (data) => `Operation Status Changed: ${data.operationTitle}`,
    message: (data) => `Operation "${data.operationTitle}" status changed to ${data.newStatus}.`,
    defaultPriority: "medium",
    defaultChannels: ["in_app"],
  },
}

export interface NotificationTypePreference {
  enabled: boolean
  channels: NotificationChannel[]
  priority: NotificationPriority
}

export interface NotificationPreferences {
  userId: string
  enableInApp: boolean
  enableEmail: boolean
  enableSlack: boolean
  enablePush: boolean

  typePreferences: Record<NotificationType, NotificationTypePreference>

  quietHours: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string // HH:MM format
    timezone: string
  }

  enableBatching: boolean
  batchInterval: number // minutes

  enableSounds: boolean
  enableVisualCues: boolean
  soundTheme: "default" | "minimal" | "classic"
}

export interface NotificationFilter {
  types?: NotificationType[]
  priorities?: NotificationPriority[]
  statuses?: NotificationStatus[]
  dateRange?: {
    start: Date
    end: Date
  }
  relatedItemType?: string
  search?: string
}
