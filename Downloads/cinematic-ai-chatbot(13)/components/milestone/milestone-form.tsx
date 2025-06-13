"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useStrategic, type Milestone } from "@/lib/strategic-context"
import { useToast } from "@/hooks/use-toast"

interface MilestoneFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initiativeId?: string // Make optional
  editMilestone?: Milestone
  onSuccess?: () => void
}

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["not-started", "in-progress", "completed", "delayed"]),
  progress: z.number().min(0).max(100),
  assigneeId: z.string().optional(),
  initiativeId: z.string().optional(),
})

type MilestoneFormData = z.infer<typeof milestoneSchema>

export function MilestoneForm({ open, onOpenChange, initiativeId, editMilestone, onSuccess }: MilestoneFormProps) {
  const { addMilestone, updateMilestone, isLoading, initiatives } = useStrategic()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [selectedInitiativeId, setSelectedInitiativeId] = useState(initiativeId || "")

  // Get team members from the selected initiative
  const selectedInitiative = initiatives.find((i) => i.id === selectedInitiativeId)
  const teamMembers = selectedInitiative?.teamMembers || []

  // Update form default values
  const form = useForm<MilestoneFormData & { initiativeId?: string }>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: editMilestone?.title || "",
      description: editMilestone?.description || "",
      dueDate: editMilestone?.dueDate ? new Date(editMilestone.dueDate).toISOString().split("T")[0] : "",
      status: editMilestone?.status || "not-started",
      progress: editMilestone?.progress || 0,
      assigneeId: editMilestone?.assigneeId || "",
      initiativeId: initiativeId || selectedInitiativeId || "",
    },
  })

  const onSubmit = async (data: MilestoneFormData & { initiativeId?: string }) => {
    try {
      setSubmitting(true)
      const targetInitiativeId = initiativeId || data.initiativeId || selectedInitiativeId

      if (!targetInitiativeId) {
        toast({
          title: "Error",
          description: "Please select an initiative",
          variant: "destructive",
        })
        return
      }

      if (editMilestone) {
        await updateMilestone(targetInitiativeId, editMilestone.id, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          status: data.status,
          progress: data.progress,
          assigneeId: data.assigneeId,
        })

        toast({
          title: "Milestone Updated",
          description: `"${data.title}" has been successfully updated.`,
        })
      } else {
        await addMilestone(targetInitiativeId, {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          status: data.status,
          progress: data.progress,
          assigneeId: data.assigneeId,
        })

        toast({
          title: "Milestone Created",
          description: `"${data.title}" has been successfully created.`,
        })
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Milestone form error:", error)
      toast({
        title: "Error",
        description: `Failed to ${editMilestone ? "update" : "create"} milestone. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editMilestone ? "Edit" : "Create New"} Milestone</DialogTitle>
          <DialogDescription>
            Define a key milestone for this initiative with specific deliverables and timeline.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Complete user research phase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!initiativeId && (
              <FormField
                control={form.control}
                name="initiativeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initiative *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedInitiativeId(value)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select initiative" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {initiatives.map((initiative) => (
                          <SelectItem key={initiative.id} value={initiative.id}>
                            {initiative.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what needs to be accomplished..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || isLoading}>
                {(submitting || isLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editMilestone ? "Update" : "Create"} Milestone
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
