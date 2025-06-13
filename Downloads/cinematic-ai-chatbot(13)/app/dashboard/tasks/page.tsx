"use client"

import { useState, useMemo } from "react"
import { useStrategic } from "@/lib/strategic-context"
import type { Task, TeamMember } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { PlusCircle, ListFilter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TaskListItem from "@/components/tasks/task-list-item"
import { CreateTaskModal } from "@/components/create-task-modal"
import { useAuth } from "@/lib/auth-context"

type TaskSortBy = "dueDate" | "priority" | "status" | "createdAt" | "title"
type TaskViewMode = "list" | "board"

const priorityOrder: Record<Task["priority"], number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

const statusOrder: Record<Task["status"], number> = {
  "To Do": 1,
  "In Progress": 2,
  Blocked: 3,
  Completed: 4,
}

export default function TaskManagementPage() {
  const { tasks, initiatives, operations, getTeamMemberById, updateTask, deleteTask, createTask } = useStrategic()
  const { user } = useAuth()

  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<{
    status: Task["status"][]
    priority: Task["priority"][]
    assigneeId: string[]
  }>({ status: [], priority: [], assigneeId: [] })
  const [sortBy, setSortBy] = useState<TaskSortBy>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<TaskViewMode>("list")

  const teamMembers = useMemo(() => {
    const memberMap = new Map<string, TeamMember>()
    initiatives.forEach((init) => init.teamMembers?.forEach((tm) => tm && memberMap.set(tm.id, tm)))
    operations.forEach((op) => op.teamMembers?.forEach((tm) => tm && memberMap.set(tm.id, tm)))
    tasks.forEach((task) => {
      if (task.assigneeId && !memberMap.has(task.assigneeId) && task.assigneeName) {
        memberMap.set(task.assigneeId, { id: task.assigneeId, name: task.assigneeName, role: "Assignee" })
      }
    })
    return Array.from(memberMap.values())
  }, [initiatives, operations, tasks])

  const strategicItems = useMemo(() => {
    const items: Array<{ id: string; title: string; type: "Initiative" | "Operation" }> = []
    initiatives.forEach((i) => items.push({ id: i.id, title: i.title, type: "Initiative" }))
    operations.forEach((o) => items.push({ id: o.id, title: o.title, type: "Operation" }))
    return items
  }, [initiatives, operations])

  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...tasks]

    if (searchTerm) {
      processedTasks = processedTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }
    if (filters.status.length > 0) {
      processedTasks = processedTasks.filter((task) => filters.status.includes(task.status))
    }
    if (filters.priority.length > 0) {
      processedTasks = processedTasks.filter((task) => filters.priority.includes(task.priority))
    }
    if (filters.assigneeId.length > 0) {
      processedTasks = processedTasks.filter(
        (task) =>
          (task.assigneeId && filters.assigneeId.includes(task.assigneeId)) ||
          (filters.assigneeId.includes("unassigned") && !task.assigneeId),
      )
    }

    processedTasks.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "dueDate":
          comparison =
            (a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY) -
            (b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY)
          break
        case "priority":
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case "status":
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return processedTasks
  }, [tasks, searchTerm, filters, sortBy, sortDirection])

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> | Task) => {
    if ("id" in taskData && taskData.id) {
      await updateTask(taskData.id, taskData as Partial<Task>)
    } else {
      await createTask(taskData as Omit<Task, "id" | "createdAt" | "updatedAt" | "status">)
    }
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[type] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]
      return { ...prev, [type]: newValues }
    })
  }

  const handleSort = (newSortBy: TaskSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(newSortBy)
      setSortDirection("asc")
    }
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-card text-card-foreground rounded-lg shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Task Management</h1>
        <p className="text-muted-foreground">Oversee, manage, and track all your project tasks.</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-4">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <ListFilter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["To Do", "In Progress", "Blocked", "Completed"] as Task["status"][]).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.status.includes(status)}
                onCheckedChange={() => toggleFilter("status", status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["Urgent", "High", "Medium", "Low"] as Task["priority"][]).map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={filters.priority.includes(priority)}
                onCheckedChange={() => toggleFilter("priority", priority)}
              >
                {priority}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Assignee</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teamMembers.map((member) => (
              <DropdownMenuCheckboxItem
                key={member.id}
                checked={filters.assigneeId.includes(member.id)}
                onCheckedChange={() => toggleFilter("assigneeId", member.id)}
              >
                {member.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuCheckboxItem
              key="unassigned"
              checked={filters.assigneeId.includes("unassigned")}
              onCheckedChange={() => toggleFilter("assigneeId", "unassigned")}
            >
              Unassigned
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={sortBy} onValueChange={(value) => handleSort(value as TaskSortBy)}>
          <SelectTrigger className="w-auto sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="createdAt">Creation Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}>
          {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleCreateTask} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === "list" ? (
          <div className="space-y-2">
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onUpdateStatus={async (newStatus) => await updateTask(task.id, { status: newStatus })}
                  onDelete={async () => await deleteTask(task.id)}
                  assignee={task.assigneeId ? getTeamMemberById(task.assigneeId) : undefined}
                  strategicItem={
                    task.strategicItemId ? strategicItems.find((si) => si.id === task.strategicItemId) : undefined
                  }
                />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-lg">No tasks match your criteria.</p>
                <p>Try adjusting your filters or creating a new task.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">Kanban board view coming soon!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
          initialTaskData={editingTask}
          teamMembers={teamMembers}
          strategicItems={strategicItems}
          userId={user?.id || ""}
        />
      )}
    </div>
  )
}
