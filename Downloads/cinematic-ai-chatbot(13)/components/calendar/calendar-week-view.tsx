"use client"

import { useMemo } from "react"
import { useCalendar } from "@/lib/calendar-context"
import { CalendarEventItem } from "./calendar-event"
import { cn } from "@/lib/utils"

export function CalendarWeekView() {
  const { currentDate, selectedDate, setSelectedDate, filteredEvents } = useCalendar()

  // Generate week days
  const weekDays = useMemo(() => {
    const days = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      days.push({
        date,
        isToday: date.getTime() === today.getTime(),
        isSelected: date.getTime() === selectedDate.getTime(),
      })
    }

    return days
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

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="grid grid-cols-7 gap-px border-b bg-muted/30">
        {weekDays.map((day) => (
          <div
            key={day.date.toISOString()}
            className={cn(
              "py-3 text-center cursor-pointer transition-colors hover:bg-accent/50",
              day.isToday && "bg-accent",
              day.isSelected && "bg-primary/10",
            )}
            onClick={() => handleDateClick(day.date)}
          >
            <div className="text-sm font-medium">{day.date.toLocaleDateString(undefined, { weekday: "short" })}</div>
            <div className={cn("text-2xl font-semibold mt-1", day.isToday && "text-primary")}>{day.date.getDate()}</div>
            <div className="text-xs text-muted-foreground">
              {day.date.toLocaleDateString(undefined, { month: "short" })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted/30">
        {weekDays.map((day) => {
          const events = getEventsForDate(day.date)
          const allDayEvents = events.filter((e) => e.isAllDay)
          const timedEvents = events.filter((e) => !e.isAllDay)

          return (
            <div
              key={day.date.toISOString()}
              className={cn("min-h-[400px] p-2 transition-colors bg-card", day.isSelected && "bg-accent/30")}
            >
              {/* All-day events */}
              {allDayEvents.length > 0 && (
                <div className="mb-3 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1">All Day</div>
                  {allDayEvents.map((event) => (
                    <CalendarEventItem key={event.id} event={event} isCompact={true} />
                  ))}
                </div>
              )}

              {/* Timed events */}
              <div className="space-y-2">
                {timedEvents.map((event) => (
                  <CalendarEventItem key={event.id} event={event} showTime={true} />
                ))}
              </div>

              {events.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No events</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
