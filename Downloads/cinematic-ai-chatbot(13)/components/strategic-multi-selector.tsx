"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useStrategic } from "@/lib/strategic-context"
import { useMemory } from "@/lib/memory-context"
import { Layers, Target, Search, FileText, Calendar, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StrategicItem {
  id: string
  type: "initiative" | "operation" | "milestone" | "task" | "memory"
  title: string
  description?: string
  category?: string
  date?: string
}

interface StrategicMultiSelectorProps {
  isOpen: boolean
  onClose: () => void
  onItemsSelected: (items: StrategicItem[]) => void
  initialSelectedItems?: StrategicItem[]
  agentId?: string
}

export function StrategicMultiSelector({
  isOpen,
  onClose,
  onItemsSelected,
  initialSelectedItems = [],
  agentId,
}: StrategicMultiSelectorProps) {
  const { initiatives, operations, tasks, isLoading: isStrategicLoading } = useStrategic()
  const { memories, isLoading: isMemoryLoading } = useMemory()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedItems, setSelectedItems] = useState<StrategicItem[]>(initialSelectedItems)

  // Extract milestones from initiatives
  const milestones = useMemo(() => {
    const allMilestones: any[] = []
    initiatives.forEach((initiative) => {
      if (initiative.milestones && Array.isArray(initiative.milestones)) {
        initiative.milestones.forEach((milestone) => {
          allMilestones.push({
            ...milestone,
            initiativeId: initiative.id,
            initiativeTitle: initiative.title,
          })
        })
      }
    })
    return allMilestones
  }, [initiatives])

  // Reset selected items when modal opens with initialSelectedItems
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(initialSelectedItems)
    }
  }, [isOpen, initialSelectedItems])

  const isLoading = isStrategicLoading || isMemoryLoading

  // Convert strategic data to unified format
  const allItems: StrategicItem[] = useMemo(
    () => [
      ...initiatives.map((item) => ({
        id: item.id,
        type: "initiative" as const,
        title: item.title,
        description: item.desiredOutcome || item.description,
        category: "Strategic",
      })),
      ...operations.map((item) => ({
        id: item.id,
        type: "operation" as const,
        title: item.title,
        description: item.deliverable || item.description,
        category: "Operational",
      })),
      ...milestones.map((item) => ({
        id: item.id,
        type: "milestone" as const,
        title: item.title,
        description: item.description || `Milestone for ${item.initiativeTitle}`,
        date: item.dueDate,
        category: "Timeline",
      })),
      ...tasks.map((item) => ({
        id: item.id,
        type: "task" as const,
        title: item.title,
        description: item.description,
        category: `${item.priority || "Medium"} Priority`,
      })),
      ...memories.map((item) => ({
        id: item.id,
        type: "memory" as const,
        title: item.title,
        description: item.content.substring(0, 100) + (item.content.length > 100 ? "..." : ""),
        category: item.type,
      })),
    ],
    [initiatives, operations, milestones, tasks, memories],
  )

  // Filter items based on search and tab
  const filteredItems = useMemo(
    () =>
      allItems.filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(searchTerm.toLowerCase())

        const matchesTab =
          selectedTab === "all" ||
          (selectedTab === "initiatives" && item.type === "initiative") ||
          (selectedTab === "operations" && item.type === "operation") ||
          (selectedTab === "milestones" && item.type === "milestone") ||
          (selectedTab === "tasks" && item.type === "task") ||
          (selectedTab === "memories" && item.type === "memory")

        return matchesSearch && matchesTab
      }),
    [allItems, searchTerm, selectedTab],
  )

  const handleItemToggle = (item: StrategicItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id && i.type === item.type)
      if (isSelected) {
        return prev.filter((i) => !(i.id === item.id && i.type === item.type))
      } else {
        return [...prev, item]
      }
    })
  }

  const handleConfirm = () => {
    onItemsSelected(selectedItems)
    onClose()
  }

  const isItemSelected = (item: StrategicItem) => selectedItems.some((i) => i.id === item.id && i.type === item.type)

  const getItemIcon = (type: StrategicItem["type"]) => {
    switch (type) {
      case "initiative":
        return <Layers className="h-4 w-4 mr-2" />
      case "operation":
        return <Target className="h-4 w-4 mr-2" />
      case "milestone":
        return <Calendar className="h-4 w-4 mr-2" />
      case "task":
        return <CheckCircle2 className="h-4 w-4 mr-2" />
      case "memory":
        return <FileText className="h-4 w-4 mr-2" />
    }
  }

  const getItemTypeLabel = (type: StrategicItem["type"]) => {
    switch (type) {
      case "initiative":
        return "Initiative"
      case "operation":
        return "Operation"
      case "milestone":
        return "Milestone"
      case "task":
        return "Task"
      case "memory":
        return "Memory"
    }
  }

  // Count items by type
  const itemCounts = useMemo(
    () => ({
      initiatives: initiatives.length,
      operations: operations.length,
      milestones: milestones.length,
      tasks: tasks.length,
      memories: memories.length,
    }),
    [initiatives.length, operations.length, milestones.length, tasks.length, memories.length],
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Strategic Context</DialogTitle>
          <DialogDescription>
            Choose initiatives, operations, milestones, tasks, or memories to provide context for your AI agent.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-grow flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({allItems.length})</TabsTrigger>
            <TabsTrigger value="initiatives">
              <Layers className="w-4 h-4 mr-1" />
              Init ({itemCounts.initiatives})
            </TabsTrigger>
            <TabsTrigger value="operations">
              <Target className="w-4 h-4 mr-1" />
              Ops ({itemCounts.operations})
            </TabsTrigger>
            <TabsTrigger value="milestones">
              <Calendar className="w-4 h-4 mr-1" />
              Miles ({itemCounts.milestones})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Tasks ({itemCounts.tasks})
            </TabsTrigger>
            <TabsTrigger value="memories">
              <FileText className="w-4 h-4 mr-1" />
              Mem ({itemCounts.memories})
            </TabsTrigger>
          </TabsList>

          <div className="mt-2 mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
            </span>
            {selectedItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                Clear selection
              </Button>
            )}
          </div>

          <ScrollArea className="flex-grow mt-2 border rounded-md">
            <div className="space-y-1 p-2">
              {isLoading && <p className="text-center py-4">Loading items...</p>}
              {!isLoading && filteredItems.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No items found.</p>
              )}
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={cn(
                    "flex items-center space-x-2 rounded-md p-2 hover:bg-accent cursor-pointer",
                    isItemSelected(item) && "bg-accent/50",
                  )}
                  onClick={() => handleItemToggle(item)}
                >
                  <Checkbox checked={isItemSelected(item)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      {getItemIcon(item.type)}
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                    <div className="flex items-center mt-1 gap-2">
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                        {getItemTypeLabel(item.type)}
                      </span>
                      {item.category && (
                        <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full">{item.category}</span>
                      )}
                      {item.date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedItems.length === 0}>
            Apply Context ({selectedItems.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
