"use client"

import { CalendarProvider } from "@/lib/calendar-context"
import { CalendarHeader } from "./calendar-header"
import { CalendarFilters } from "./calendar-filters"
import { CalendarMonthView } from "./calendar-month-view"
import { CalendarWeekView } from "./calendar-week-view"
import { CalendarListView } from "./calendar-list-view"
import { CalendarAgendaView } from "./calendar-agenda-view"
import { CalendarEventDetails } from "./calendar-event-details"
import { useCalendar } from "@/lib/calendar-context"

function CalendarContent() {
  const { view } = useCalendar()

  const renderView = () => {
    switch (view) {
      case "month":
        return <CalendarMonthView />
      case "week":
        return <CalendarWeekView />
      case "list":
        return <CalendarListView />
      case "agenda":
        return <CalendarAgendaView />
      default:
        return <CalendarMonthView />
    }
  }

  return (
    <div className="space-y-6">
      <CalendarHeader />
      <CalendarFilters />
      {renderView()}
      <CalendarEventDetails />
    </div>
  )
}

export function StrategicCalendar() {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  )
}
