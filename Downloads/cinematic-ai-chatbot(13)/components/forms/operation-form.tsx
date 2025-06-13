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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { useToast } from "@/hooks/use-toast"

const operationSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  initiativeIds: z.array(z.string()).min(1, "Must be linked to at least one initiative"),
  deliverable: z.string().min(1, "Deliverable is required").max(200, "Deliverable must be less than 200 characters"),
  owner: z.string().min(1, "Owner is required"),
  status: z.enum(["Not Started", "In Progress", "Blocked", "Completed", "On Hold"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  dueDate: z.string().min(1, "Due date is required"),
  progress: z.number().min(0).max(100),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
})

type OperationFormData = z.infer<typeof operationSchema>

interface OperationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedInitiativeId?: string
  onSuccess?: (operation: any) => void
}

export function OperationForm({ open, onOpenChange, preselectedInitiativeId, onSuccess }: OperationFormProps) {
  const { createOperation, initiatives, isLoading } = useStrategic()
  const { toast } = useToast()
  const [dependencies, setDependencies] = useState<string[]>([])
  const [risks, setRisks] = useState<string[]>([])
  const [resources, setResources] = useState<string[]>([])
  const [newDependency, setNewDependency] = useState("")
  const [newRisk, setNewRisk] = useState("")
  const [newResource, setNewResource] = useState("")

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      title: "",
      initiativeIds: preselectedInitiativeId ? [preselectedInitiativeId] : [],
      deliverable: "",
      owner: "",
      status: "Not Started",
      priority: "Medium",
      dueDate: "",
      progress: 0,
      description: "",
      dependencies: [],
      risks: [],
      resources: [],
    },
  })

  const onSubmit = async (data: OperationFormData) => {
    try {
      const operation = await createOperation({
        ...data,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        risks: risks.length > 0 ? risks : undefined,
        resources: resources.length > 0 ? resources : undefined,
      })

      toast({
        title: "Operation Created",
        description: `"${operation.title}" has been successfully created.`,
      })

      form.reset()
      setDependencies([])
      setRisks([])
      setResources([])
      setNewDependency("")
      setNewRisk("")
      setNewResource("")
      onOpenChange(false)
      onSuccess?.(operation)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create operation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addItem = (type: "dependency" | "risk" | "resource") => {
    const newItem = type === "dependency" ? newDependency : type === "risk" ? newRisk : newResource
    const currentItems = type === "dependency" ? dependencies : type === "risk" ? risks : resources
    const setItems = type === "dependency" ? setDependencies : type === "risk" ? setRisks : setResources
    const setNewItem = type === "dependency" ? setNewDependency : type === "risk" ? setNewRisk : setNewResource

    if (newItem.trim() && !currentItems.includes(newItem.trim())) {
      setItems([...currentItems, newItem.trim()])
      setNewItem("")
    }
  }

  const removeItem = (type: "dependency" | "risk" | "resource", item: string) => {
    const currentItems = type === "dependency" ? dependencies : type === "risk" ? risks : resources
    const setItems = type === "dependency" ? setDependencies : type === "risk" ? setRisks : setResources

    setItems(currentItems.filter((i) => i !== item))
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: "dependency" | "risk" | "resource") => {
    if (e.key === "Enter") {
      e.preventDefault()
      addItem(type)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Operation</DialogTitle>
          <DialogDescription>
            Define an execution task that delivers measurable progress toward strategic initiatives. All fields marked
            with * are required.
          </DialogDescription>
        </DialogHeader>

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
                      <Input placeholder="e.g., Implement Customer Feedback System" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initiativeIds"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Linked Initiatives *</FormLabel>
                    <FormDescription>Select at least one initiative this operation supports</FormDescription>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                      {initiatives.map((initiative) => (
                        <div key={initiative.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={initiative.id}
                            checked={field.value.includes(initiative.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, initiative.id])
                              } else {
                                field.onChange(field.value.filter((id) => id !== initiative.id))
                              }
                            }}
                          />
                          <label
                            htmlFor={initiative.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {initiative.title}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliverable"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Deliverable/Milestone *</FormLabel>
                    <FormControl>
                      <Input placeholder="What specific outcome will this operation deliver?" {...field} />
                    </FormControl>
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
                      <Input placeholder="Operation owner" {...field} />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this operation..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dependencies */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Dependencies</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a dependency..."
                  value={newDependency}
                  onChange={(e) => setNewDependency(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "dependency")}
                />
                <Button type="button" onClick={() => addItem("dependency")} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dependencies.map((dep, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {dep}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem("dependency", dep)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Risks */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Risks</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a risk..."
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "risk")}
                />
                <Button type="button" onClick={() => addItem("risk")} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {risks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {risks.map((risk, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {risk}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem("risk", risk)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Resources/Team</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a resource or team member..."
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "resource")}
                />
                <Button type="button" onClick={() => addItem("resource")} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {resources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resources.map((resource, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {resource}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem("resource", resource)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Operation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
