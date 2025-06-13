"use client"

import type React from "react"

import { useState } from "react"
import { Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useCalendar } from "@/lib/calendar-context"
import { EVENT_COLORS, type EventType, type EventPriority, type EventStatus } from "@/lib/calendar-data-processor"

const typeOptions: { value: EventType; label: string; color: string }[] = [
  { value: "initiative", label: "Initiatives", color: EVENT_COLORS.initiative },
  { value: "operation", label: "Operations", color: EVENT_COLORS.operation },
  { value: "milestone", label: "Milestones", color: EVENT_COLORS.milestone },
  { value: "task", label: "Tasks", color: EVENT_COLORS.task },
]

const priorityOptions: { value: EventPriority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
  { value: "not-started", label: "Not Started" },
  { value: "overdue", label: "Overdue" },
  { value: "at-risk", label: "At Risk" },
]

export function CalendarFilters() {
  const { filters, setFilters } = useCalendar()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.search || "")

  // Count active filters
  const activeFilterCount =
    typeOptions.length -
    filters.types.length +
    (priorityOptions.length - filters.priorities.length) +
    (statusOptions.length - filters.statuses.length) +
    (filters.search && filters.search.trim() !== "" ? 1 : 0) +
    (filters.assignee ? 1 : 0)

  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search: searchTerm })
  }

  // Toggle type filter
  const toggleTypeFilter = (type: EventType) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]
    setFilters({ types: newTypes })
  }

  // Toggle priority filter
  const togglePriorityFilter = (priority: EventPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority]
    setFilters({ priorities: newPriorities })
  }

  // Toggle status filter
  const toggleStatusFilter = (status: EventStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    setFilters({ statuses: newStatuses })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      types: ["initiative", "operation", "milestone", "task"],
      priorities: ["critical", "high", "medium", "low"],
      statuses: ["completed", "in-progress", "not-started", "overdue", "at-risk"],
      search: "",
      assignee: undefined,
    })
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
        <Button type="submit" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={resetFilters}>
                  Reset all
                </Button>
              </div>

              <Separator />

              <div>
                <h5 className="font-medium mb-2 text-sm">Event Type</h5>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={filters.types.includes(option.value)}
                        onCheckedChange={() => toggleTypeFilter(option.value)}
                      />
                      <label htmlFor={`type-${option.value}`} className="text-sm flex items-center cursor-pointer">
                        <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: option.color }} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h5 className="font-medium mb-2 text-sm">Priority</h5>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priorities.includes(option.value)}
                        onCheckedChange={() => togglePriorityFilter(option.value)}
                      />
                      <label htmlFor={`priority-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h5 className="font-medium mb-2 text-sm">Status</h5>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.statuses.includes(option.value)}
                        onCheckedChange={() => toggleStatusFilter(option.value)}
                      />
                      <label htmlFor={`status-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
