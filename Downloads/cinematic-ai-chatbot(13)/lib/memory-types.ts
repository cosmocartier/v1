export interface Memory {
  id: string
  title: string
  content: string
  type: "note" | "decision" | "insight" | "learning" | "meeting" | "feedback" | "idea" | "reference"
  tags: string[]
  priority: "low" | "medium" | "high" | "critical"
  visibility: "private" | "team" | "public"
  attachments?: MemoryAttachment[]
  relatedMemories?: string[] // IDs of related memories
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
  itemId: string // ID of the initiative, operation, or session
  itemType: "initiative" | "operation" | "session"
  metadata?: Record<string, any>
}

export interface MemoryAttachment {
  id: string
  name: string
  type: "link" | "file" | "image" | "document"
  url: string
  size?: number
  mimeType?: string
}

export interface MemorySearchFilters {
  query?: string
  type?: Memory["type"]
  tags?: string[]
  priority?: Memory["priority"]
  visibility?: Memory["visibility"]
  dateRange?: "today" | "week" | "month" | "quarter" | "year" | "all"
  createdBy?: string
  itemId?: string
  itemType?: Memory["itemType"]
}

export interface MemoryStats {
  total: number
  byType: Record<Memory["type"], number>
  byPriority: Record<Memory["priority"], number>
  recentCount: number
  topTags: Array<{ tag: string; count: number }>
}
