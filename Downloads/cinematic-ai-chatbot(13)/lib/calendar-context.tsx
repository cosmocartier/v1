"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useStrategic } from "./strategic-context"
import {
  type CalendarEvent,
  type EventType,
  type EventPriority,
  type EventStatus,
  processStrategicDataToEvents,
  filterEvents,
} from "./calendar-data-processor"

type CalendarView = "month" | "week" | "list" | "agenda"

interface CalendarFilters {
  types: EventType[]
  priorities: EventPriority[]
  statuses: EventStatus[]
  assignee?: string
  search?: string
}

interface CalendarContextType {
  events: CalendarEvent[]
  filteredEvents: CalendarEvent[]
  filters: CalendarFilters
  currentDate: Date
  selectedDate: Date
  view: CalendarView
  selectedEvent: CalendarEvent | null

  // Actions
  setFilters: (filters: Partial<CalendarFilters>) => void
  setCurrentDate: (date: Date) => void
  setSelectedDate: (date: Date) => void
  setView: (view: CalendarView) => void
  setSelectedEvent: (event: CalendarEvent | null) => void
  goToToday: () => void
  goToNextPeriod: () => void
  goToPreviousPeriod: () => void
}

const defaultFilters: CalendarFilters = {
  types: ["initiative", "operation", "milestone", "task"],
  priorities: ["critical", "high", "medium", "low"],
  statuses: ["completed", "in-progress", "not-started", "overdue", "at-risk"],
  search: "",
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { initiatives, operations, tasks } = useStrategic()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [filters, setFiltersState] = useState<CalendarFilters>(defaultFilters)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Load events from strategic context
  useEffect(() => {
    const calendarEvents = processStrategicDataToEvents(initiatives, operations, tasks)
    setEvents(calendarEvents)
  }, [initiatives, operations, tasks])

  // Apply filters when events or filters change
  useEffect(() => {
    const filtered = filterEvents(events, filters)
    setFilteredEvents(filtered)
  }, [events, filters])

  // Update filters
  const setFilters = (newFilters: Partial<CalendarFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Go to next period based on current view
  const goToNextPeriod = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)

      switch (view) {
        case "month":
          newDate.setMonth(prevDate.getMonth() + 1)
          break
        case "week":
          newDate.setDate(prevDate.getDate() + 7)
          break
        case "list":
        case "agenda":
          newDate.setDate(prevDate.getDate() + 30)
          break
      }

      return newDate
    })
  }

  // Go to previous period based on current view
  const goToPreviousPeriod = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)

      switch (view) {
        case "month":
          newDate.setMonth(prevDate.getMonth() - 1)
          break
        case "week":
          newDate.setDate(prevDate.getDate() - 7)
          break
        case "list":
        case "agenda":
          newDate.setDate(prevDate.getDate() - 30)
          break
      }

      return newDate
    })
  }

  const value = {
    events,
    filteredEvents,
    filters,
    currentDate,
    selectedDate,
    view,
    selectedEvent,

    setFilters,
    setCurrentDate,
    setSelectedDate,
    setView,
    setSelectedEvent,
    goToToday,
    goToNextPeriod,
    goToPreviousPeriod,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendar() {
  const context = useContext(CalendarContext)

  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider")
  }

  return context
}
