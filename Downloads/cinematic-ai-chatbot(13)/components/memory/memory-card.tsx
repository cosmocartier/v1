"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Star,
  Lightbulb,
  BookOpen,
  Users,
  MessageSquare,
  Link,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Tag,
} from "lucide-react"
import { useMemory } from "@/lib/memory-context"
import { useToast } from "@/hooks/use-toast"
import type { Memory } from "@/lib/memory-types"
import { formatDistanceToNow } from "date-fns"

interface MemoryCardProps {
  memory: Memory
  onEdit: (memory: Memory) => void
}

const memoryTypeIcons = {
  note: FileText,
  decision: Star,
  insight: Lightbulb,
  learning: BookOpen,
  meeting: Users,
  feedback: MessageSquare,
  idea: Lightbulb,
  reference: Link,
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function MemoryCard({ memory, onEdit }: MemoryCardProps) {
  const { deleteMemory } = useMemory()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)

  const Icon = memoryTypeIcons[memory.type]

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      try {
        await deleteMemory(memory.id)
        toast({
          title: "Memory Deleted",
          description: "The memory has been successfully deleted.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete memory. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${memory.title}\n\n${memory.content}`)
    toast({
      title: "Copied to Clipboard",
      description: "Memory content has been copied to your clipboard.",
    })
  }

  const truncatedContent = memory.content.length > 200 ? memory.content.substring(0, 200) + "..." : memory.content

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight mb-1">{memory.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="w-4 h-4">
                  <AvatarFallback className="text-xs">
                    {memory.createdByName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{memory.createdByName}</span>
                <span>•</span>
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${priorityColors[memory.priority]}`}>{memory.priority}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(memory)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Content
                </DropdownMenuItem>
                {memory.attachments && memory.attachments.length > 0 && (
                  <DropdownMenuItem onClick={() => window.open(memory.attachments![0].url, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Attachment
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isExpanded ? memory.content : truncatedContent}
            {memory.content.length > 200 && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-primary hover:underline text-xs">
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </p>

          {/* Tags */}
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memory.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Attachments */}
          {memory.attachments && memory.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {memory.attachments.map((attachment) => (
                <Button
                  key={attachment.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => window.open(attachment.url, "_blank")}
                >
                  {attachment.type === "link" ? (
                    <Link className="w-3 h-3 mr-1" />
                  ) : (
                    <FileText className="w-3 h-3 mr-1" />
                  )}
                  {attachment.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
