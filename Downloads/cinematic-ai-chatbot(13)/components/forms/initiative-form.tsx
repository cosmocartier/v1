"use client"

import type React from "react"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2, Wand2 } from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { useToast } from "@/hooks/use-toast"
import type { Initiative } from "@/lib/strategic-context"
import { EnhancedTemplateSelector } from "./enhanced-template-selector"

const initiativeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  desiredOutcome: z
    .string()
    .min(1, "Desired outcome is required")
    .max(500, "Desired outcome must be less than 500 characters"),
  successMetric: z
    .string()
    .min(1, "Success metric is required")
    .max(200, "Success metric must be less than 200 characters"),
  owner: z.string().min(1, "Owner is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
  strategicAlignment: z.string().optional(),
  visibility: z.enum(["Public", "Private", "Team"]),
  milestones: z.array(z.string()).optional(),
})

type InitiativeFormData = z.infer<typeof initiativeSchema>

interface InitiativeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (initiative: any) => void
  editInitiative?: Initiative
}

export function InitiativeForm({ open, onOpenChange, onSuccess, editInitiative }: InitiativeFormProps) {
  const { createInitiative, updateInitiative, isLoading } = useStrategic()
  const { toast } = useToast()
  const [milestones, setMilestones] = useState<string[]>(editInitiative?.milestones?.map((m) => m.title) || [])
  const [newMilestone, setNewMilestone] = useState("")
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      title: editInitiative?.title || "",
      desiredOutcome: editInitiative?.desiredOutcome || "",
      successMetric: editInitiative?.successMetric || "",
      owner: editInitiative?.owner || "",
      priority: editInitiative?.priority || "Medium",
      dueDate: editInitiative?.dueDate ? new Date(editInitiative.dueDate).toISOString().split("T")[0] : "",
      description: editInitiative?.description || "",
      strategicAlignment: editInitiative?.strategicAlignment || "",
      visibility: editInitiative?.visibility || "Team",
      milestones: editInitiative?.milestones?.map((m) => m.title) || [],
    },
  })

  const onSubmit = async (data: InitiativeFormData) => {
    try {
      setSubmitting(true)
      let result

      if (editInitiative) {
        result = await updateInitiative(editInitiative.id, {
          ...data,
          milestones:
            milestones.length > 0
              ? milestones.map((title) => ({
                  id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title,
                  status: "not-started",
                  progress: 0,
                  dueDate: data.dueDate,
                  createdAt: new Date().toISOString(),
                }))
              : [],
        })

        toast({
          title: "Initiative Updated",
          description: `"${result.title}" has been successfully updated.`,
        })
      } else {
        result = await createInitiative({
          ...data,
          milestones: milestones.length > 0 ? milestones : [],
        })

        toast({
          title: "Initiative Created",
          description: `"${result.title}" has been successfully created.`,
        })
      }

      form.reset()
      setMilestones([])
      setNewMilestone("")
      onOpenChange(false)
      if (onSuccess) onSuccess(result)
    } catch (error) {
      console.error("Initiative form error:", error)
      toast({
        title: "Error",
        description: `Failed to ${editInitiative ? "update" : "create"} initiative. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const addMilestone = () => {
    if (newMilestone.trim() && !milestones.includes(newMilestone.trim())) {
      setMilestones([...milestones, newMilestone.trim()])
      setNewMilestone("")
    }
  }

  const removeMilestone = (milestone: string) => {
    setMilestones(milestones.filter((m) => m !== milestone))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addMilestone()
    }
  }

  const handleApplyTemplate = (template: Omit<Initiative, "id" | "createdAt" | "updatedAt" | "progress">) => {
    form.setValue("title", template.title)
    form.setValue("desiredOutcome", template.desiredOutcome)
    form.setValue("successMetric", template.successMetric)
    form.setValue("priority", template.priority)
    form.setValue("description", template.description || "")
    form.setValue("strategicAlignment", template.strategicAlignment || "")
    form.setValue("visibility", template.visibility)

    if (template.milestones && template.milestones.length > 0) {
      setMilestones(template.milestones.map((m) => m.title))
    }

    toast({
      title: "Template Applied",
      description: "The template has been applied. You can now customize it to your needs.",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editInitiative ? "Edit" : "Create New"} Initiative</DialogTitle>
            <DialogDescription>
              Define a strategic outcome with measurable success criteria. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          {!editInitiative && (
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-20 border-dashed"
                onClick={() => setIsTemplateModalOpen(true)}
              >
                <Wand2 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Use Enhanced Template</div>
                  <div className="text-xs text-muted-foreground">
                    Generate complete initiative with operations, milestones & tasks
                  </div>
                </div>
              </Button>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Increase Customer Retention" {...field} />
                      </FormControl>
                      <FormDescription>Focus on the outcome, not the activity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="desiredOutcome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Desired Outcome *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the specific outcome you want to achieve..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="successMetric"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Success Metric/KPI *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Increase retention rate from 85% to 92%" {...field} />
                      </FormControl>
                      <FormDescription>How will you measure success? Be specific and quantifiable.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner *</FormLabel>
                      <FormControl>
                        <Input placeholder="Initiative owner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Team">Team</SelectItem>
                          <SelectItem value="Private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional context or details..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strategicAlignment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategic Alignment</FormLabel>
                    <FormControl>
                      <Input placeholder="How does this align with company strategy?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <label className="text-sm font-medium">Milestones</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a milestone..."
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" onClick={addMilestone} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {milestones.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {milestones.map((milestone, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {milestone}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeMilestone(milestone)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || isLoading}>
                  {(submitting || isLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editInitiative ? "Update" : "Create"} Initiative
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <EnhancedTemplateSelector
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSuccess={(initiative) => {
          if (onSuccess) onSuccess(initiative)
        }}
      />
    </>
  )
}
