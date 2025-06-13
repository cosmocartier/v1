import { StrategicCalendar } from "@/components/calendar/strategic-calendar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendar | Machine Excellence",
  description: "View and manage all deadlines across initiatives, operations, milestones, and tasks",
}

export default function CalendarPage() {
  return (
    <div className="flex flex-col w-full h-full min-h-screen p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Strategic Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of all deadlines across your initiatives, operations, milestones, and tasks.
          </p>
        </div>
      </div>

      <StrategicCalendar />
    </div>
  )
}
