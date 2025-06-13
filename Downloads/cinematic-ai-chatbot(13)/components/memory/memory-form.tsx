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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2, Link, FileText } from "lucide-react"
import { useMemory } from "@/lib/memory-context"
import { useToast } from "@/hooks/use-toast"
import type { Memory, MemoryAttachment } from "@/lib/memory-types"

const memorySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["note", "decision", "insight", "learning", "meeting", "feedback", "idea", "reference"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  visibility: z.enum(["private", "team", "public"]),
  tags: z.array(z.string()).optional(),
})

type MemoryFormData = z.infer<typeof memorySchema>

interface MemoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  itemType: "initiative" | "operation" | "session"
  editingMemory?: Memory
}

export function MemoryForm({ open, onOpenChange, itemId, itemType, editingMemory }: MemoryFormProps) {
  const { createMemory, updateMemory, isLoading } = useMemory()
  const { toast } = useToast()
  const [tags, setTags] = useState<string[]>(editingMemory?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [attachments, setAttachments] = useState<MemoryAttachment[]>(editingMemory?.attachments || [])
  const [newAttachment, setNewAttachment] = useState({ name: "", url: "", type: "link" as const })

  const form = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: editingMemory?.title || "",
      content: editingMemory?.content || "",
      type: editingMemory?.type || "note",
      priority: editingMemory?.priority || "medium",
      visibility: editingMemory?.visibility || "team",
      tags: editingMemory?.tags || [],
    },
  })

  const onSubmit = async (data: MemoryFormData) => {
    try {
      if (editingMemory) {
        await updateMemory(editingMemory.id, {
          ...data,
          tags,
          attachments,
        })

        toast({
          title: "Memory Updated",
          description: `"${data.title}" has been successfully updated.`,
        })
      } else {
        await createMemory({
          ...data,
          tags,
          attachments: attachments.length > 0 ? attachments : undefined,
          itemId,
          itemType,
        })

        toast({
          title: "Memory Created",
          description: `"${data.title}" has been successfully created.`,
        })
      }

      form.reset()
      setTags([])
      setAttachments([])
      setNewTag("")
      setNewAttachment({ name: "", url: "", type: "link" })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingMemory ? "update" : "create"} memory. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      const attachment: MemoryAttachment = {
        id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newAttachment.name.trim(),
        url: newAttachment.url.trim(),
        type: newAttachment.type,
      }
      setAttachments([...attachments, attachment])
      setNewAttachment({ name: "", url: "", type: "link" })
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attachmentId))
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      action()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingMemory ? "Edit" : "Create New"} Memory</DialogTitle>
          <DialogDescription>
            Capture important information, insights, and decisions for this {itemType}.
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
                      <Input placeholder="e.g., Key decision on market strategy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="insight">Insight</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
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
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">Private (Only me)</SelectItem>
                        <SelectItem value="team">Team (Team members)</SelectItem>
                        <SelectItem value="public">Public (Everyone)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the memory, insight, or decision in detail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTag)}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Attachments</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Attachment name"
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                />
                <Input
                  placeholder="URL or file path"
                  value={newAttachment.url}
                  onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                />
                <div className="flex gap-2">
                  <Select
                    value={newAttachment.type}
                    onValueChange={(value) => setNewAttachment({ ...newAttachment, type: value as any })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addAttachment} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                      {attachment.type === "link" ? <Link className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      <span className="flex-1 text-sm">{attachment.name}</span>
                      <Button type="button" onClick={() => removeAttachment(attachment.id)} size="sm" variant="ghost">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
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
                {editingMemory ? "Update" : "Create"} Memory
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
