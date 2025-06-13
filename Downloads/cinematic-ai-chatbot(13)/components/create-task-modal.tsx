"use client"

import { DialogClose } from "@/components/ui/dialog"
import type { Task, TaskPriority, TaskStatus, TeamMember } from "@/lib/types"
import { useState, useEffect, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const UNASSIGNED_PLACEHOLDER_VALUE = "__UNASSIGNED__"
const NO_STRATEGIC_ITEM_PLACEHOLDER_VALUE = "__NO_STRATEGIC_ITEM__"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> | Task) => Promise<void>
  initialTaskData?: Task | Partial<Task> | null
  teamMembers: TeamMember[]
  strategicItems?: Array<{ id: string; title: string; type: "Initiative" | "Operation" }>
  userId: string
  defaultStrategicItemId?: string
  defaultStrategicItemType?: "initiative" | "operation"
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSave,
  initialTaskData,
  teamMembers,
  strategicItems = [], // Default to an empty array
  userId,
  defaultStrategicItemId,
  defaultStrategicItemType,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("Medium")
  const [status, setStatus] = useState<TaskStatus>("To Do")
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [strategicItemId, setStrategicItemId] = useState<string | undefined>(defaultStrategicItemId)
  const [strategicItemType, setStrategicItemType] = useState<"initiative" | "operation" | undefined>(
    defaultStrategicItemType,
  )

  useEffect(() => {
    if (initialTaskData) {
      setTitle(initialTaskData.title || "")
      setDescription(initialTaskData.description || "")
      setPriority(initialTaskData.priority || "Medium")
      setStatus(initialTaskData.status || "To Do")
      setAssigneeId(initialTaskData.assigneeId || undefined)
      setStrategicItemId(initialTaskData.strategicItemId || defaultStrategicItemId)
      setStrategicItemType(initialTaskData.strategicItemType || defaultStrategicItemType)
    } else {
      setTitle("")
      setDescription("")
      setPriority("Medium")
      setStatus("To Do")
      setAssigneeId(undefined)
      setStrategicItemId(defaultStrategicItemId)
      setStrategicItemType(defaultStrategicItemType)
    }
  }, [initialTaskData, isOpen, defaultStrategicItemId, defaultStrategicItemType])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    const taskPayload: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
      title,
      description,
      priority,
      status,
      assigneeId: assigneeId === UNASSIGNED_PLACEHOLDER_VALUE ? undefined : assigneeId,
      creatorId:
        initialTaskData && "creatorId" in initialTaskData && initialTaskData.creatorId
          ? initialTaskData.creatorId
          : userId,
      strategicItemId: strategicItemId === NO_STRATEGIC_ITEM_PLACEHOLDER_VALUE ? undefined : strategicItemId,
      strategicItemType: strategicItemId === NO_STRATEGIC_ITEM_PLACEHOLDER_VALUE ? undefined : strategicItemType,
    }

    if (initialTaskData && "id" in initialTaskData && initialTaskData.id) {
      await onSave({ ...taskPayload, id: initialTaskData.id })
    } else {
      await onSave(taskPayload)
    }

    setIsLoading(false)
    onClose()
  }

  const taskStatusOptions: TaskStatus[] = ["To Do", "In Progress", "Blocked", "Completed"]
  const taskPriorityOptions: TaskPriority[] = ["Low", "Medium", "High", "Urgent"]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialTaskData && "id" in initialTaskData ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {taskPriorityOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={assigneeId || UNASSIGNED_PLACEHOLDER_VALUE}
                onValueChange={(val) => setAssigneeId(val === UNASSIGNED_PLACEHOLDER_VALUE ? undefined : val)}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_PLACEHOLDER_VALUE}>Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {strategicItems.length > 0 && ( // Conditionally render this section
              <div>
                <Label htmlFor="strategicItem">Link to Initiative/Operation (Optional)</Label>
                <Select
                  value={strategicItemId || NO_STRATEGIC_ITEM_PLACEHOLDER_VALUE}
                  onValueChange={(value) => {
                    if (value === NO_STRATEGIC_ITEM_PLACEHOLDER_VALUE) {
                      setStrategicItemId(undefined)
                      setStrategicItemType(undefined)
                    } else {
                      const selected = strategicItems.find((item) => item.id === value)
                      setStrategicItemId(value)
                      setStrategicItemType(selected?.type.toLowerCase() as "initiative" | "operation" | undefined)
                    }
                  }}
                >
                  <SelectTrigger id="strategicItem">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_STRATEGIC_ITEM_PLACEHOLDER_VALUE}>None</SelectItem>
                    {strategicItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title} ({item.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
