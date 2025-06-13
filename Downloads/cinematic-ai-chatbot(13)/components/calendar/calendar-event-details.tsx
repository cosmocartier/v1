"use client"

import { X, Calendar, Clock, Users, ArrowUpRight, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCalendar } from "@/lib/calendar-context"
import { formatDate, formatTime } from "@/lib/calendar-data-processor"
import Link from "next/link"

export function CalendarEventDetails() {
  const { selectedEvent, setSelectedEvent } = useCalendar()

  if (!selectedEvent) return null

  // Format date and time
  const formattedDate = formatDate(selectedEvent.date, "long")
  const formattedTime = selectedEvent.isAllDay
    ? "All day"
    : `${formatTime(selectedEvent.date)}${selectedEvent.endDate ? ` - ${formatTime(selectedEvent.endDate)}` : ""}`

  // Get status badge variant
  const getStatusBadgeVariant = () => {
    switch (selectedEvent.status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "overdue":
        return "destructive"
      case "at-risk":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get priority badge variant
  const getPriorityBadgeVariant = () => {
    switch (selectedEvent.priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Get link to parent item
  const getParentLink = () => {
    if (!selectedEvent.parentId || !selectedEvent.parentType) return null

    switch (selectedEvent.parentType) {
      case "initiative":
        return `/dashboard/initiatives/${selectedEvent.parentId}`
      case "operation":
        return `/dashboard/operations/${selectedEvent.parentId}`
      default:
        return null
    }
  }

  // Get link to this item
  const getItemLink = () => {
    switch (selectedEvent.type) {
      case "initiative":
        return `/dashboard/initiatives/${selectedEvent.id.replace("initiative-", "")}`
      case "operation":
        return `/dashboard/operations/${selectedEvent.id.replace("operation-", "")}`
      case "milestone":
        return `/dashboard/milestones?id=${selectedEvent.id.replace("milestone-", "")}`
      case "task":
        return `/dashboard/tasks?id=${selectedEvent.id.replace("task-", "")}`
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{selectedEvent.title}</h2>
              <p className="text-muted-foreground capitalize">{selectedEvent.type.replace("-", " ")}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formattedTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <Badge variant={getPriorityBadgeVariant()}>
                {selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1)} Priority
              </Badge>
              <Badge variant={getStatusBadgeVariant()}>
                {selectedEvent.status === "in-progress"
                  ? "In Progress"
                  : selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
              </Badge>
            </div>

            {selectedEvent.progress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{selectedEvent.progress}%</span>
                </div>
                <Progress value={selectedEvent.progress} className="h-2" />
              </div>
            )}

            {selectedEvent.description && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
            )}

            {selectedEvent.parentTitle && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-1">Parent</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.parentType?.charAt(0).toUpperCase() + selectedEvent.parentType?.slice(1)}:{" "}
                    {selectedEvent.parentTitle}
                  </p>
                  {getParentLink() && (
                    <Link href={getParentLink() as string}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="sr-only">View parent</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {selectedEvent.assignees && selectedEvent.assignees.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-1">Assignees</h3>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedEvent.assignees.join(", ")}</span>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-2">
              {getItemLink() && (
                <Link href={getItemLink() as string}>
                  <Button variant="outline">
                    View Details
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
