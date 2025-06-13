"use client"

import { useState } from "react"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type {
  NotificationFilter,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from "@/lib/notification-types"

interface NotificationFiltersProps {
  filters: NotificationFilter
  onFiltersChange: (filters: NotificationFilter) => void
}

const notificationTypes: { value: NotificationType; label: string }[] = [
  { value: "deadline_created", label: "Deadline Created" },
  { value: "deadline_modified", label: "Deadline Modified" },
  { value: "deadline_completed", label: "Deadline Completed" },
  { value: "deadline_approaching", label: "Deadline Approaching" },
  { value: "deadline_overdue", label: "Deadline Overdue" },
  { value: "milestone_achieved", label: "Milestone Achieved" },
  { value: "task_assigned", label: "Task Assigned" },
  { value: "initiative_status_change", label: "Initiative Status Change" },
  { value: "operation_status_change", label: "Operation Status Change" },
]

const priorities: { value: NotificationPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

const statuses: { value: NotificationStatus; label: string }[] = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
]

export function NotificationFilters({ filters, onFiltersChange }: NotificationFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.dateRange?.start,
    to: filters.dateRange?.end,
  })

  const updateFilter = (key: keyof NotificationFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const toggleArrayFilter = (key: "types" | "priorities" | "statuses", value: string) => {
    const currentArray = filters[key] || []
    const newArray = currentArray.includes(value as any)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value as any]

    updateFilter(key, newArray.length > 0 ? newArray : undefined)
  }

  const clearFilters = () => {
    onFiltersChange({})
    setDateRange({})
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof NotificationFilter]
    return value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-xs">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search notifications..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value || undefined)}
          className="h-8"
        />
      </div>

      {/* Types */}
      <div className="space-y-2">
        <Label className="text-xs">Types</Label>
        <div className="flex flex-wrap gap-1">
          {notificationTypes.map((type) => (
            <Badge
              key={type.value}
              variant={filters.types?.includes(type.value) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayFilter("types", type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div className="space-y-2">
        <Label className="text-xs">Priorities</Label>
        <div className="flex flex-wrap gap-1">
          {priorities.map((priority) => (
            <Badge
              key={priority.value}
              variant={filters.priorities?.includes(priority.value) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayFilter("priorities", priority.value)}
            >
              {priority.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Statuses */}
      <div className="space-y-2">
        <Label className="text-xs">Status</Label>
        <div className="flex flex-wrap gap-1">
          {statuses.map((status) => (
            <Badge
              key={status.value}
              variant={filters.statuses?.includes(status.value) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleArrayFilter("statuses", status.value)}
            >
              {status.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Related Item Type */}
      <div className="space-y-2">
        <Label className="text-xs">Related Item</Label>
        <Select
          value={filters.relatedItemType || ""}
          onValueChange={(value) => updateFilter("relatedItemType", value || undefined)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="All items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All items</SelectItem>
            <SelectItem value="initiative">Initiatives</SelectItem>
            <SelectItem value="operation">Operations</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label className="text-xs">Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-8 w-full justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                  </>
                ) : (
                  dateRange.from.toLocaleDateString()
                )
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                setDateRange(range || {})
                if (range?.from && range?.to) {
                  updateFilter("dateRange", { start: range.from, end: range.to })
                } else {
                  updateFilter("dateRange", undefined)
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
