"use client"

import { useMemo } from "react"
import { useCalendar } from "@/lib/calendar-context"
import { CalendarEventItem } from "./calendar-event"
import { cn } from "@/lib/utils"

export function CalendarAgendaView() {
  const { currentDate, filteredEvents } = useCalendar()

  // Get start and end dates for the agenda view (30 days)
  const startDate = useMemo(() => {
    const date = new Date(currentDate)
    date.setHours(0, 0, 0, 0)
    return date
  }, [currentDate])

  const endDate = useMemo(() => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + 30)
    return date
  }, [startDate])

  // Filter events within the date range
  const eventsInRange = useMemo(() => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate >= startDate && eventDate <= endDate
    })
  }, [filteredEvents, startDate, endDate])

  // Generate days for the agenda
  const agendaDays = useMemo(() => {
    const days = []
    const currentDay = new Date(startDate)

    while (currentDay <= endDate) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }, [startDate, endDate])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredEvents> = {}

    eventsInRange.forEach((event) => {
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
  }, [eventsInRange])

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is in the past
  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="space-y-1">
      {agendaDays.map((date) => {
        const dateKey = date.toISOString().split("T")[0]
        const events = eventsByDate[dateKey] || []
        const hasEvents = events.length > 0

        return (
          <div
            key={dateKey}
            className={cn(
              "flex border-l-4 transition-colors",
              hasEvents ? "border-primary" : "border-transparent",
              isToday(date) && "bg-accent/50",
            )}
          >
            <div className="w-24 flex-shrink-0 p-3 text-right">
              <div
                className={cn(
                  "text-sm font-medium",
                  isToday(date) && "text-primary",
                  isPast(date) && !isToday(date) && "text-muted-foreground",
                )}
              >
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isToday(date) && "text-primary",
                  isPast(date) && !isToday(date) && "text-muted-foreground",
                )}
              >
                {date.getDate()}
              </div>
              <div
                className={cn(
                  "text-xs",
                  isToday(date) && "text-primary",
                  isPast(date) && !isToday(date) && "text-muted-foreground",
                )}
              >
                {date.toLocaleDateString(undefined, { month: "short" })}
              </div>
            </div>

            <div className="flex-1 p-3">
              {hasEvents ? (
                <div className="space-y-2">
                  {events.map((event) => (
                    <CalendarEventItem key={event.id} event={event} showTime={true} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm py-2">No events</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
