"use client"

import { useState } from "react"
import { type CalendarEvent, STATUS_COLORS } from "@/lib/calendar-data-processor"
import { useCalendar } from "@/lib/calendar-context"
import { cn } from "@/lib/utils"

interface CalendarEventProps {
  event: CalendarEvent
  isCompact?: boolean
  showTime?: boolean
}

export function CalendarEventItem({ event, isCompact = false, showTime = false }: CalendarEventProps) {
  const { setSelectedEvent } = useCalendar()
  const [isHovered, setIsHovered] = useState(false)

  // Format time if needed
  const formattedTime =
    showTime && !event.isAllDay
      ? event.date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : null

  // Determine status indicator
  const statusColor = STATUS_COLORS[event.status] || STATUS_COLORS["not-started"]

  // Determine opacity based on completion status
  const opacity = event.status === "completed" ? "opacity-60" : "opacity-100"

  // Determine border style for overdue or at-risk items
  const borderStyle =
    event.status === "overdue"
      ? "border-l-4 border-red-500"
      : event.status === "at-risk"
        ? "border-l-4 border-orange-500"
        : ""

  // Handle click
  const handleClick = () => {
    setSelectedEvent(event)
  }

  return (
    <div
      className={cn(
        "flex items-center px-2 py-1 rounded-md cursor-pointer text-sm transition-all hover:shadow-sm",
        opacity,
        borderStyle,
        isCompact ? "truncate" : "min-h-[24px]",
        isHovered ? "ring-2 ring-offset-1 ring-offset-background" : "",
      )}
      style={{ backgroundColor: `${event.color}20`, borderColor: event.color }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 truncate">
        {formattedTime && <span className="mr-1 font-medium text-xs">{formattedTime}</span>}
        <span className={cn(isCompact ? "truncate text-xs" : "text-sm", "font-medium")} style={{ color: event.color }}>
          {event.title}
        </span>
      </div>

      {!isCompact && (
        <div className="h-2 w-2 rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: statusColor }} />
      )}
    </div>
  )
}
