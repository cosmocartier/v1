"use client"

import { useMemo } from "react"
import { useCalendar } from "@/lib/calendar-context"
import { CalendarEventItem } from "./calendar-event"
import { cn } from "@/lib/utils"

export function CalendarMonthView() {
  const { currentDate, selectedDate, setSelectedDate, filteredEvents } = useCalendar()

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1)
    const dayOfWeek = firstDayOfMonth.getDay()

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Get days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    // Create calendar grid
    const grid = []

    // Add days from previous month
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      grid.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      })
    }

    // Add days from current month
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      date.setHours(0, 0, 0, 0)

      grid.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: date.getTime() === selectedDate.getTime(),
      })
    }

    // Add days from next month
    const remainingDays = 42 - grid.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      grid.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      })
    }

    return grid
  }, [currentDate, selectedDate])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredEvents> = {}

    filteredEvents.forEach((event) => {
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
  }, [filteredEvents])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0]
    return eventsByDate[dateKey] || []
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  // Calculate workload intensity for a date
  const getWorkloadIntensity = (date: Date) => {
    const events = getEventsForDate(date)

    if (events.length === 0) return "none"
    if (events.length <= 2) return "low"
    if (events.length <= 4) return "medium"
    return "high"
  }

  // Get workload indicator class
  const getWorkloadIndicatorClass = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-transparent"
    }
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="grid grid-cols-7 gap-px border-b">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground bg-muted/30">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted/30">
        {calendarGrid.map((day, index) => {
          const events = getEventsForDate(day.date)
          const workloadIntensity = getWorkloadIntensity(day.date)
          const maxVisibleEvents = 3
          const hasMoreEvents = events.length > maxVisibleEvents

          return (
            <div
              key={index}
              className={cn(
                "min-h-[100px] p-2 transition-colors cursor-pointer bg-card hover:bg-accent/50",
                day.isCurrentMonth ? "bg-card" : "bg-muted/50",
                day.isSelected && "bg-accent",
                "relative",
              )}
              onClick={() => handleDateClick(day.date)}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    !day.isCurrentMonth && "text-muted-foreground",
                    day.isToday &&
                      "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs",
                  )}
                >
                  {day.date.getDate()}
                </span>

                {events.length > 0 && (
                  <div className={cn("h-2 w-2 rounded-full", getWorkloadIndicatorClass(workloadIntensity))} />
                )}
              </div>

              <div className="space-y-1">
                {events.slice(0, maxVisibleEvents).map((event) => (
                  <CalendarEventItem key={event.id} event={event} isCompact={true} />
                ))}

                {hasMoreEvents && (
                  <div className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded">
                    +{events.length - maxVisibleEvents} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
