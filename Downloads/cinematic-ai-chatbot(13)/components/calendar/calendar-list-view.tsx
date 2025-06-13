"use client"

import { useMemo } from "react"
import { useCalendar } from "@/lib/calendar-context"
import { CalendarEventItem } from "./calendar-event"
import { formatDate } from "@/lib/calendar-data-processor"
import { cn } from "@/lib/utils"

export function CalendarListView() {
  const { filteredEvents } = useCalendar()

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredEvents> = {}

    // Sort events by date
    const sortedEvents = [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime())

    sortedEvents.forEach((event) => {
      const dateKey = event.date.toISOString().split("T")[0]

      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }

      grouped[dateKey].push(event)
    })

    return grouped
  }, [filteredEvents])

  // Check if a date is today
  const isToday = (dateStr: string) => {
    const today = new Date()
    return today.toISOString().split("T")[0] === dateStr
  }

  // Check if a date is in the past
  const isPast = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateStr)
    return date < today
  }

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort()

  return (
    <div className="space-y-6">
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your filters.</p>
        </div>
      ) : (
        sortedDates.map((dateStr) => {
          const date = new Date(dateStr)
          const events = eventsByDate[dateStr]

          return (
            <div key={dateStr} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3
                  className={cn(
                    "text-lg font-semibold",
                    isToday(dateStr) && "text-primary",
                    isPast(dateStr) && !isToday(dateStr) && "text-muted-foreground",
                  )}
                >
                  {formatDate(date, "long")}
                </h3>
                {isToday(dateStr) && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Today</span>
                )}
                <span className="text-sm text-muted-foreground">
                  {events.length} {events.length === 1 ? "event" : "events"}
                </span>
              </div>

              <div className="bg-card rounded-lg border shadow-sm divide-y">
                {events.map((event) => (
                  <div key={event.id} className="p-3">
                    <CalendarEventItem event={event} showTime={true} />
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
