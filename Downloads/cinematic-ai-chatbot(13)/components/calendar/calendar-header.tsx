"use client"

import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCalendar } from "@/lib/calendar-context"
import { cn } from "@/lib/utils"

const viewOptions = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "list", label: "List" },
  { value: "agenda", label: "Agenda" },
]

export function CalendarHeader() {
  const { currentDate, view, setView, goToToday, goToNextPeriod, goToPreviousPeriod } = useCalendar()

  // Format the current date based on the view
  const formatCurrentPeriod = () => {
    const options: Intl.DateTimeFormatOptions = {}

    switch (view) {
      case "month":
        options.month = "long"
        options.year = "numeric"
        break
      case "week":
        // Get start and end of week
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        // Format dates
        const startMonth = startOfWeek.toLocaleDateString(undefined, { month: "short" })
        const endMonth = endOfWeek.toLocaleDateString(undefined, { month: "short" })
        const startDay = startOfWeek.getDate()
        const endDay = endOfWeek.getDate()
        const year = endOfWeek.getFullYear()

        // If same month
        if (startMonth === endMonth) {
          return `${startMonth} ${startDay}-${endDay}, ${year}`
        }

        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
      case "list":
      case "agenda":
        options.month = "long"
        options.year = "numeric"
        break
    }

    return currentDate.toLocaleDateString(undefined, options)
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{formatCurrentPeriod()}</h1>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center mr-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPeriod} className="h-8 px-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>

          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 mx-1">
            Today
          </Button>

          <Button variant="outline" size="sm" onClick={goToNextPeriod} className="h-8 px-2">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        <div className="flex rounded-md shadow-sm flex-1 sm:flex-none">
          {viewOptions.map((option, index) => (
            <Button
              key={option.value}
              variant={view === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setView(option.value as any)}
              className={cn(
                "h-8",
                index === 0 && "rounded-r-none",
                index === viewOptions.length - 1 && "rounded-l-none",
                index !== 0 && index !== viewOptions.length - 1 && "rounded-none border-l-0 border-r-0",
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
