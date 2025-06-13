"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Lightbulb,
  MessageSquare,
  FileText,
  Users,
  Star,
  Tag,
  Link,
  Download,
} from "lucide-react"
import { useMemory } from "@/lib/memory-context"
import { MemoryForm } from "./memory-form"
import { MemoryCard } from "./memory-card"
import { MemoryStats } from "./memory-stats"
import type { Memory, MemorySearchFilters } from "@/lib/memory-types"
import { cn } from "@/lib/utils"

interface MemoryPanelProps {
  itemId: string
  itemType: "initiative" | "operation" | "session"
  className?: string
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

const memoryTypeColors = {
  note: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  decision: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  insight: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  learning: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  meeting: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  feedback: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  idea: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  reference: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

export function MemoryPanel({ itemId, itemType, className }: MemoryPanelProps) {
  const { getMemoriesForItem, searchMemories, getMemoryStats, getMemoryTags, exportMemories, isLoading } = useMemory()

  const [showMemoryForm, setShowMemoryForm] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<Memory["type"] | "all">("all")
  const [selectedPriority, setSelectedPriority] = useState<Memory["priority"] | "all">("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("memories")

  // Get memories and apply filters
  const allMemories = getMemoriesForItem(itemId, itemType)
  const availableTags = getMemoryTags(itemId, itemType)
  const stats = getMemoryStats(itemId, itemType)

  const filters: MemorySearchFilters = {
    query: searchQuery || undefined,
    type: selectedType !== "all" ? selectedType : undefined,
    priority: selectedPriority !== "all" ? selectedPriority : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    itemId,
    itemType,
  }

  const filteredMemories =
    searchQuery || selectedType !== "all" || selectedPriority !== "all" || selectedTags.length > 0
      ? searchMemories(filters)
      : allMemories

  const handleExport = () => {
    const data = exportMemories(itemId, itemType)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memories-${itemType}-${itemId}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Memory Bank
            </CardTitle>
            <CardDescription>Capture insights, decisions, and learnings for this {itemType}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => setShowMemoryForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="memories">Memories ({stats.total})</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="memories" className="flex-1 flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="note">Notes</SelectItem>
                    <SelectItem value="decision">Decisions</SelectItem>
                    <SelectItem value="insight">Insights</SelectItem>
                    <SelectItem value="learning">Learnings</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="idea">Ideas</SelectItem>
                    <SelectItem value="reference">References</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {availableTags.slice(0, 10).map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Memory List */}
            <ScrollArea className="flex-1">
              {filteredMemories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start capturing insights and decisions for this {itemType}.
                  </p>
                  <Button onClick={() => setShowMemoryForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Memory
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMemories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onEdit={(memory) => {
                        setEditingMemory(memory)
                        setShowMemoryForm(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex-1">
            <MemoryStats stats={stats} itemType={itemType} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <MemoryForm
        open={showMemoryForm}
        onOpenChange={(open) => {
          setShowMemoryForm(open)
          if (!open) {
            setEditingMemory(undefined)
          }
        }}
        itemId={itemId}
        itemType={itemType}
        editingMemory={editingMemory}
      />
    </Card>
  )
}
