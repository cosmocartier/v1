"use client"

import type React from "react"

import type { Task, TeamMember } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Edit3,
  Trash2,
  MoreVertical,
  Calendar,
  LinkIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

interface TaskListItemProps {
  task: Task
  onEdit: () => void
  onUpdateStatus: (newStatus: Task["status"]) => Promise<void>
  onDelete: () => Promise<void>
  assignee?: TeamMember
  strategicItem?: { id: string; title: string; type: "Initiative" | "Operation" }
}

const priorityColors: Record<Task["priority"], string> = {
  Urgent: "bg-red-500 border-red-500 text-white",
  High: "bg-orange-500 border-orange-500 text-white",
  Medium: "bg-yellow-500 border-yellow-500 text-yellow-900",
  Low: "bg-green-500 border-green-500 text-white",
}

const statusIcons: Record<Task["status"], React.ElementType> = {
  "To Do": XCircle,
  "In Progress": Loader2,
  Blocked: AlertTriangle,
  Completed: CheckCircle,
}

const statusColors: Record<Task["status"], string> = {
  "To Do": "text-muted-foreground",
  "In Progress": "text-blue-500",
  Blocked: "text-orange-500",
  Completed: "text-green-500",
}

export default function TaskListItem({
  task,
  onEdit,
  onUpdateStatus,
  onDelete,
  assignee,
  strategicItem,
}: TaskListItemProps) {
  const StatusIcon = statusIcons[task.status]
  const statusColor = statusColors[task.status]

  return (
    <div className="bg-background p-4 rounded-md border hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={cn("text-xs", priorityColors[task.priority])}>{task.priority}</Badge>
            <h3 className="text-lg font-semibold truncate cursor-pointer hover:underline" onClick={onEdit}>
              {task.title}
            </h3>
          </div>
          {task.description && <p className="text-sm text-muted-foreground truncate mb-2">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <StatusIcon className={cn("h-3.5 w-3.5", statusColor, task.status === "In Progress" && "animate-spin")} />
              <span className={statusColor}>{task.status}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
              </div>
            )}
            {assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                  <AvatarFallback>{assignee.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <span>{assignee.name}</span>
              </div>
            )}
            {strategicItem && (
              <div className="flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="truncate max-w-[150px]">
                  {strategicItem.title} ({strategicItem.type})
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Edit3 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateStatus("To Do")} disabled={task.status === "To Do"}>
                Set to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("In Progress")} disabled={task.status === "In Progress"}>
                Set to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("Blocked")} disabled={task.status === "Blocked"}>
                Set to Blocked
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus("Completed")} disabled={task.status === "Completed"}>
                Set to Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
