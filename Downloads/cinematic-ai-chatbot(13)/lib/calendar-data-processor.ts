import type { Initiative, Operation, Milestone, Task } from "./types"

// Define calendar event types
export type EventType = "initiative" | "operation" | "milestone" | "task"
export type EventPriority = "critical" | "high" | "medium" | "low"
export type EventStatus = "completed" | "in-progress" | "not-started" | "overdue" | "at-risk"

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  endDate?: Date
  type: EventType
  priority: EventPriority
  status: EventStatus
  progress: number
  description?: string
  parentId?: string
  parentTitle?: string
  parentType?: EventType
  assignees?: string[]
  color: string
  isAllDay?: boolean
  originalItem: Initiative | Operation | Milestone | Task
}

// Color mapping for event types
export const EVENT_COLORS = {
  initiative: "#8b5cf6", // Purple
  operation: "#3b82f6", // Blue
  milestone: "#10b981", // Green
  task: "#64748b", // Slate
}

// Status indicator colors
export const STATUS_COLORS = {
  completed: "#22c55e", // Green
  "in-progress": "#f59e0b", // Amber
  "not-started": "#6b7280", // Gray
  overdue: "#ef4444", // Red
  "at-risk": "#f97316", // Orange
}

// Helper function to determine event priority
export function determineEventPriority(item: any): EventPriority {
  const priority = item.priority?.toLowerCase()
  if (priority === "critical") return "critical"
  if (priority === "high") return "high"
  if (priority === "medium") return "medium"
  if (priority === "low") return "low"

  // Default logic based on type if no priority is set
  if (item.type === "initiative") return "high"
  if (item.type === "operation") return "medium"
  if (item.type === "milestone") return "medium"
  return "low"
}

// Helper function to determine event status
export function determineEventStatus(item: any): EventStatus {
  if (item.status) {
    const status = item.status.toLowerCase().replace(/\s+/g, "-")
    if (status === "completed") return "completed"
    if (status === "in-progress") return "in-progress"
    if (status === "not-started") return "not-started"
  }

  if (item.completed || item.progress === 100) return "completed"
  if (item.progress > 0) return "in-progress"

  const deadline = item.dueDate || item.deadline || item.date
  if (deadline && new Date(deadline) < new Date()) return "overdue"

  return "not-started"
}

// Process strategic data into calendar events
export function processStrategicDataToEvents(
  initiatives: Initiative[],
  operations: Operation[],
  tasks: Task[],
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  // Process initiatives
  initiatives.forEach((initiative) => {
    if (initiative.dueDate) {
      events.push({
        id: `initiative-${initiative.id}`,
        title: initiative.title,
        date: new Date(initiative.dueDate),
        type: "initiative",
        priority: determineEventPriority(initiative),
        status: determineEventStatus(initiative),
        progress: initiative.progress || 0,
        description: initiative.description,
        color: EVENT_COLORS.initiative,
        isAllDay: true,
        originalItem: initiative,
      })
    }
  })

  // Process operations
  operations.forEach((operation) => {
    if (operation.dueDate) {
      const parentInitiative = initiatives.find((i) => operation.initiativeIds?.includes(i.id))

      events.push({
        id: `operation-${operation.id}`,
        title: operation.title,
        date: new Date(operation.dueDate),
        type: "operation",
        priority: determineEventPriority(operation),
        status: determineEventStatus(operation),
        progress: operation.progress || 0,
        description: operation.description,
        parentId: parentInitiative?.id,
        parentTitle: parentInitiative?.title,
        parentType: "initiative",
        color: EVENT_COLORS.operation,
        isAllDay: true,
        originalItem: operation,
      })
    }
  })

  // Process milestones from initiatives
  initiatives.forEach((initiative) => {
    initiative.milestones?.forEach((milestone) => {
      if (milestone.dueDate) {
        events.push({
          id: `milestone-${milestone.id}`,
          title: milestone.title,
          date: new Date(milestone.dueDate),
          type: "milestone",
          priority: determineEventPriority(milestone),
          status: determineEventStatus(milestone),
          progress: milestone.progress || 0,
          description: milestone.description,
          parentId: initiative.id,
          parentTitle: initiative.title,
          parentType: "initiative",
          assignees: milestone.assigneeId ? [milestone.assigneeId] : undefined,
          color: EVENT_COLORS.milestone,
          isAllDay: true,
          originalItem: milestone,
        })
      }
    })
  })

  // Process tasks
  tasks.forEach((task) => {
    if (task.dueDate) {
      const parentOperation = operations.find(
        (o) => o.id === task.strategicItemId && task.strategicItemType === "operation",
      )
      const parentInitiative = initiatives.find(
        (i) => i.id === task.strategicItemId && task.strategicItemType === "initiative",
      )

      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: new Date(task.dueDate),
        type: "task",
        priority: determineEventPriority(task),
        status: determineEventStatus(task),
        progress: task.status === "Completed" ? 100 : 0,
        description: task.description,
        parentId: task.strategicItemId,
        parentTitle: parentOperation?.title || parentInitiative?.title,
        parentType: task.strategicItemType as EventType,
        assignees: task.assigneeId ? [task.assigneeId] : undefined,
        color: EVENT_COLORS.task,
        originalItem: task,
      })
    }
  })

  return events
}

// Filter events based on criteria
export function filterEvents(
  events: CalendarEvent[],
  filters: {
    types?: EventType[]
    priorities?: EventPriority[]
    statuses?: EventStatus[]
    assignee?: string
    search?: string
  },
): CalendarEvent[] {
  return events.filter((event) => {
    // Filter by type
    if (filters.types && filters.types.length > 0 && !filters.types.includes(event.type)) {
      return false
    }

    // Filter by priority
    if (filters.priorities && filters.priorities.length > 0 && !filters.priorities.includes(event.priority)) {
      return false
    }

    // Filter by status
    if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(event.status)) {
      return false
    }

    // Filter by assignee
    if (filters.assignee && (!event.assignees || !event.assignees.includes(filters.assignee))) {
      return false
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== "") {
      const searchTerm = filters.search.toLowerCase()
      const matchesTitle = event.title.toLowerCase().includes(searchTerm)
      const matchesDescription = event.description?.toLowerCase().includes(searchTerm) || false
      const matchesParent = event.parentTitle?.toLowerCase().includes(searchTerm) || false

      if (!matchesTitle && !matchesDescription && !matchesParent) {
        return false
      }
    }

    return true
  })
}

// Group events by date for agenda view
export function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const grouped: Record<string, CalendarEvent[]> = {}

  events.forEach((event) => {
    const dateKey = event.date.toISOString().split("T")[0]

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }

    grouped[dateKey].push(event)
  })

  // Sort events within each day
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      // All-day events come first
      if (a.isAllDay && !b.isAllDay) return -1
      if (!a.isAllDay && b.isAllDay) return 1

      // Then sort by time
      return a.date.getTime() - b.date.getTime()
    })
  })

  return grouped
}

// Get events for a specific date range
export function getEventsInRange(events: CalendarEvent[], startDate: Date, endDate: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate >= startDate && eventDate <= endDate
  })
}

// Get events for a specific month
export function getEventsForMonth(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  return getEventsInRange(events, startDate, endDate)
}

// Get events for a specific week
export function getEventsForWeek(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const startDate = new Date(date)
  startDate.setDate(date.getDate() - date.getDay())

  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  return getEventsInRange(events, startDate, endDate)
}

// Format date for display
export function formatDate(date: Date, format: "short" | "medium" | "long" = "medium"): string {
  if (format === "short") {
    return date.toLocaleDateString()
  }

  if (format === "long") {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Default medium format
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

// Format time for display
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Detect conflicting events
export function detectConflicts(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const conflicts: Record<string, CalendarEvent[]> = {}

  // Group events by date
  const eventsByDate = groupEventsByDate(events)

  // Check for conflicts within each date
  Object.keys(eventsByDate).forEach((date) => {
    const dateEvents = eventsByDate[date]

    if (dateEvents.length > 3) {
      // Consider it a conflict if there are more than 3 events on the same day
      dateEvents.forEach((event) => {
        conflicts[event.id] = dateEvents.filter((e) => e.id !== event.id)
      })
    }
  })

  return conflicts
}

// Analyze workload by counting events per day
export function analyzeWorkload(
  events: CalendarEvent[],
): Record<string, { count: number; intensity: "low" | "medium" | "high" }> {
  const workload: Record<string, { count: number; intensity: "low" | "medium" | "high" }> = {}

  events.forEach((event) => {
    const dateKey = event.date.toISOString().split("T")[0]

    if (!workload[dateKey]) {
      workload[dateKey] = { count: 0, intensity: "low" }
    }

    workload[dateKey].count += 1
  })

  // Determine intensity based on count
  Object.keys(workload).forEach((date) => {
    const count = workload[date].count
    if (count <= 2) {
      workload[date].intensity = "low"
    } else if (count <= 4) {
      workload[date].intensity = "medium"
    } else {
      workload[date].intensity = "high"
    }
  })

  return workload
}
