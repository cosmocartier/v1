"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle2, Clock, AlertCircle, Pause, MoreHorizontal, Edit, Trash2, User, Calendar } from "lucide-react"
import { useStrategic, type Milestone } from "@/lib/strategic-context"
import { useToast } from "@/hooks/use-toast"
import { MilestoneForm } from "./milestone-form"

interface MilestoneCardProps {
  milestone: Milestone
  initiativeId: string
  onUpdate?: () => void
}

export function MilestoneCard({ milestone, initiativeId, onUpdate }: MilestoneCardProps) {
  const { updateMilestone, deleteMilestone, getTeamMemberById } = useStrategic()
  const { toast } = useToast()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const assignee = milestone.assigneeId ? getTeamMemberById(milestone.assigneeId) : null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "delayed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "not-started":
        return <Pause className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "delayed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "not-started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handleStatusChange = async (newStatus: Milestone["status"]) => {
    try {
      setIsUpdating(true)
      await updateMilestone(initiativeId, milestone.id, {
        status: newStatus,
        progress: newStatus === "completed" ? 100 : milestone.progress,
      })

      toast({
        title: "Milestone Updated",
        description: `Status changed to ${newStatus.replace("-", " ")}`,
      })

      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressUpdate = async (newProgress: number) => {
    try {
      setIsUpdating(true)
      const newStatus = newProgress === 100 ? "completed" : newProgress > 0 ? "in-progress" : "not-started"

      await updateMilestone(initiativeId, milestone.id, {
        progress: newProgress,
        status: newStatus,
      })

      toast({
        title: "Progress Updated",
        description: `Progress set to ${newProgress}%`,
      })

      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone progress",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMilestone(initiativeId, milestone.id)
      toast({
        title: "Milestone Deleted",
        description: `"${milestone.title}" has been deleted.`,
      })
      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      })
    }
  }

  const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== "completed"

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(milestone.status)}
                <h4 className="font-medium">{milestone.title}</h4>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
              {milestone.description && <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={`text-xs ${getStatusColor(milestone.status)}`}>
                {milestone.status.replace("-", " ")}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("not-started")} disabled={isUpdating}>
                    <Pause className="mr-2 h-4 w-4" />
                    Mark as Not Started
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("in-progress")} disabled={isUpdating}>
                    <Clock className="mr-2 h-4 w-4" />
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={isUpdating}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("delayed")} disabled={isUpdating}>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Mark as Delayed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
                {assignee && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {assignee.name}
                  </div>
                )}
              </div>
              <span className="font-medium">{milestone.progress}%</span>
            </div>

            <div className="space-y-2">
              <Progress value={milestone.progress} className="h-2" />
              <div className="flex gap-1">
                {[0, 25, 50, 75, 100].map((value) => (
                  <Button
                    key={value}
                    variant={milestone.progress === value ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => handleProgressUpdate(value)}
                    disabled={isUpdating}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MilestoneForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        initiativeId={initiativeId}
        editMilestone={milestone}
        onSuccess={() => {
          onUpdate?.()
          setShowEditForm(false)
        }}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
