import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, ChevronLeft, ChevronRight, Globe, Zap } from "lucide-react"
import type { JSX } from "react"

interface Initiative {
  id: string
  title: string
  status: "active" | "paused" | "completed" | "planning"
  priority: "high" | "medium" | "low"
  progress: number
  icon: React.ComponentType<{ className?: string }>
}

const mockInitiatives: Initiative[] = [
  {
    id: "si-001",
    title: "Market Expansion Strategy - APAC",
    status: "active",
    priority: "high",
    progress: 65,
    icon: Globe,
  },
  {
    id: "si-002",
    title: "Digital Transformation Initiative",
    status: "active",
    priority: "high",
    progress: 42,
    icon: Zap,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-green-500"
    case "paused":
      return "text-yellow-500"
    case "completed":
      return "text-blue-500"
    case "planning":
      return "text-purple-500"
    default:
      return "text-muted-foreground"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-500"
    case "medium":
      return "text-yellow-500"
    case "low":
      return "text-green-500"
    default:
      return "text-muted-foreground"
  }
}

export function StrategicSidebar({ onCreateInitiative, onSelectInitiative }: {
  onCreateInitiative: () => void
  onSelectInitiative: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [initiatives] = useState(mockInitiatives)

  return (
    <aside
      className={`h-full bg-card border-r border-border flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-80"}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Initiatives</span>
        )}
        <div className="flex items-center gap-2">
          {!collapsed && (
            <Button size="sm" onClick={onCreateInitiative} className="h-8 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCollapsed((c: boolean) => !c)}
            className="rounded-full h-8 w-8"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {initiatives.map((initiative) => {
          const Icon = initiative.icon
          return (
            <div
              key={initiative.id}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-muted transition group border border-transparent`}
              onClick={() => onSelectInitiative(initiative.id)}
            >
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                <Icon className="w-4 h-4 text-foreground" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{initiative.title}</span>
                    <span className={`text-xs font-bold ${getPriorityColor(initiative.priority)}`}>{initiative.priority.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${getStatusColor(initiative.status)}`}>{initiative.status}</span>
                    <Progress value={initiative.progress} className="h-1 w-20" />
                    <span className="text-xs text-muted-foreground">{initiative.progress}%</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default StrategicSidebar;
