"use client"

import type React from "react"
import { useStrategic } from "@/lib/strategic-context"
import type { Task, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarDays, ChevronDown, User, CheckCircle, Circle, Clock, XCircle } from "lucide-react"
import { format, isPast, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface TaskCardProps {
  task: Task
}

const statusConfig: Record<TaskStatus, { icon: React.ElementType; color: string; bgClass: string }> = {
  "To Do": {
    icon: Circle,
    color: "text-muted-foreground",
    bgClass: "bg-muted hover:bg-muted/80",
  },
  "In Progress": {
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900",
  },
  Blocked: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900",
  },
  Completed: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900",
  },
}

const priorityColors: Record<Task["priority"], string> = {
  Low: "text-muted-foreground",
  Medium: "text-yellow-600 dark:text-yellow-500",
  High: "text-orange-600 dark:text-orange-500",
  Urgent: "text-red-600 dark:text-red-500",
}

export function TaskCard({ task }: TaskCardProps) {
  const { updateTask, getTeamMemberById } = useStrategic()
  const { toast } = useToast()

  const assignee = task.assigneeId ? getTeamMemberById(task.assigneeId) : null
  const currentStatus = statusConfig[task.status] || statusConfig["To Do"]

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask(task.id, { status: newStatus })
      toast({
        title: "Task Updated",
        description: `Status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the task status.",
      })
    }
  }

  const dueDate = task.dueDate ? parseISO(task.dueDate) : null
  const isOverdue = dueDate && isPast(dueDate) && task.status !== "Completed"

  return (
    <Card className="w-full max-w-sm my-3 border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
        {task.description && (
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">{task.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 py-1 h-auto rounded-md text-xs",
                  currentStatus.bgClass,
                  currentStatus.color,
                )}
              >
                <currentStatus.icon className="h-3 w-3" />
                <span>{task.status}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(statusConfig) as TaskStatus[]).map((status) => (
                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className={cn("text-xs font-medium", priorityColors[task.priority])}>{task.priority}</div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {dueDate ? (
            <div className={cn("flex items-center gap-1", isOverdue && "text-red-600 font-medium")}>
              <CalendarDays className="h-3 w-3" />
              <span>{format(dueDate, "MMM d")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>No due date</span>
            </div>
          )}

          {assignee ? (
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={assignee.avatar || "/placeholder.svg?width=16&height=16&query=avatar"}
                  alt={assignee.name}
                />
                <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-foreground/80">{assignee.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Unassigned</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
