"use client"

import { useState } from "react"
import { useStrategic } from "@/lib/strategic-context"
import type { ChatAction } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ChatActionHandlerProps {
  action: ChatAction
  actionLabel: string
  onSuccess: (message?: string, result?: any) => void
  onError: (error: string) => void
}

export function ChatActionHandler({ action, actionLabel, onSuccess, onError }: ChatActionHandlerProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const { createTask, updateTask } = useStrategic()

  const handleExecute = async () => {
    setIsExecuting(true)
    try {
      // Extract actionType from the action object
      // With the new AI SDK implementation, the actionType might be in a different format
      // First, determine the action type from the actionLabel if action.actionType is undefined
      const actionType = action.actionType || determineActionTypeFromLabel(actionLabel)

      if (!actionType) {
        throw new Error(`Could not determine action type from label: ${actionLabel}`)
      }

      let result: any
      switch (actionType) {
        case "CREATE_TASK":
          result = await createTask(action.payload)
          onSuccess(`Task "${result.title}" created.`, result)
          break
        case "UPDATE_TASK_STATUS":
          result = await updateTask(action.payload.taskId, { status: action.payload.status })
          onSuccess(`Task status updated to "${result.status}".`, result)
          break
        case "ASSIGN_TASK":
          result = await updateTask(action.payload.taskId, { assigneeId: action.payload.assigneeId })
          onSuccess(`Task assigned.`, result)
          break
        case "SET_TASK_DUE_DATE":
          result = await updateTask(action.payload.taskId, { dueDate: action.payload.dueDate })
          onSuccess(`Task due date updated.`, result)
          break
        case "SET_TASK_PRIORITY":
          result = await updateTask(action.payload.taskId, { priority: action.payload.priority })
          onSuccess(`Task priority updated.`, result)
          break
        default:
          throw new Error(`Unknown action type: ${actionType}`)
      }
    } catch (err) {
      console.error("Action execution failed:", err)
      onError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setIsExecuting(false)
    }
  }

  // Helper function to determine action type from label
  function determineActionTypeFromLabel(label: string): string | undefined {
    const labelLower = label.toLowerCase()
    if (labelLower.includes("create task")) return "CREATE_TASK"
    if (labelLower.includes("update") && labelLower.includes("status")) return "UPDATE_TASK_STATUS"
    if (labelLower.includes("assign")) return "ASSIGN_TASK"
    if (labelLower.includes("due date")) return "SET_TASK_DUE_DATE"
    if (labelLower.includes("priority")) return "SET_TASK_PRIORITY"
    return undefined
  }

  return (
    <Button onClick={handleExecute} disabled={isExecuting} size="sm" variant="outline">
      {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {actionLabel}
    </Button>
  )
}
