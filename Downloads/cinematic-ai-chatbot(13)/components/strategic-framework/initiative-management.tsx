"use client" // Add this if not present

import type React from "react" // Ensure React is imported
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, ChevronLeft, ChevronRight, Globe, Zap, Layers } from "lucide-react"
// import type { JSX } from "react" // type JSX is usually not needed for direct import

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
    title: "Market Expansion - APAC", // Shortened for sidebar
    status: "active",
    priority: "high",
    progress: 65,
    icon: Globe,
  },
  {
    id: "si-002",
    title: "Digital Transformation", // Shortened for sidebar
    status: "active",
    priority: "high",
    progress: 42,
    icon: Zap,
  },
  {
    id: "si-003",
    title: "Product Innovation Pipeline",
    status: "planning",
    priority: "medium",
    progress: 15,
    icon: Layers,
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
      return "text-orange-500" // Changed from yellow for better distinction
    case "low":
      return "text-green-500"
    default:
      return "text-muted-foreground"
  }
}

export function StrategicSidebar({
  onCreateInitiative,
  onSelectInitiative,
}: {
  onCreateInitiative: () => void
  onSelectInitiative: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [initiatives] = useState(mockInitiatives) // Using mock data for now

  return (
    <div className={`bg-card flex flex-col transition-all duration-300 ${collapsed ? "w-16 items-center" : "w-full"}`}>
      <div
        className={`flex items-center p-2 border-b border-border ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && <span className="font-semibold text-sm tracking-tight ml-1">Initiatives</span>}
        <div className="flex items-center gap-1">
          {!collapsed && (
            <Button size="sm" variant="ghost" onClick={onCreateInitiative} className="h-7 px-1.5">
              <Plus className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCollapsed((c: boolean) => !c)}
            className="rounded-full h-7 w-7"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto p-1.5 space-y-1.5 ${collapsed ? "mt-2" : ""}`}>
        {initiatives.map((initiative) => {
          const Icon = initiative.icon
          return (
            <div
              key={initiative.id}
              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition group border border-transparent ${collapsed ? "justify-center" : ""}`}
              onClick={() => onSelectInitiative(initiative.id)}
              title={initiative.title}
            >
              <div
                className={`w-7 h-7 bg-muted/70 rounded flex items-center justify-center ${collapsed ? "" : "flex-shrink-0"}`}
              >
                <Icon className="w-3.5 h-3.5 text-foreground" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs truncate">{initiative.title}</span>
                    <span className={`text-xs font-semibold ${getPriorityColor(initiative.priority)}`}>
                      {initiative.priority.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Progress value={initiative.progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">{initiative.progress}%</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StrategicSidebar
