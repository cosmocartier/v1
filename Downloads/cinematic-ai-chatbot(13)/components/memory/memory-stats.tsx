"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Star, Lightbulb, BookOpen, Users, MessageSquare, Link, Calendar, Tag } from "lucide-react"
import type { MemoryStats } from "@/lib/memory-types"

interface MemoryStatsProps {
  stats: MemoryStats
  itemType: "initiative" | "operation" | "session"
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
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
}

export function MemoryStats({ stats, itemType }: MemoryStatsProps) {
  const totalByType = Object.values(stats.byType).reduce((sum, count) => sum + count, 0)
  const totalByPriority = Object.values(stats.byPriority).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Memories</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent (7 days)</p>
                <p className="text-2xl font-bold">{stats.recentCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Memory Types</CardTitle>
          <CardDescription>Distribution of memory types for this {itemType}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.byType).map(([type, count]) => {
            const Icon = memoryTypeIcons[type as keyof typeof memoryTypeIcons]
            const percentage = totalByType > 0 ? (count / totalByType) * 100 : 0

            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Distribution</CardTitle>
          <CardDescription>Memory priorities breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats.byPriority).map(([priority, count]) => {
            const percentage = totalByPriority > 0 ? (count / totalByPriority) * 100 : 0

            return (
              <div key={priority} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}
                    />
                    <span className="text-sm font-medium capitalize">{priority}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Top Tags */}
      {stats.topTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Tags</CardTitle>
            <CardDescription>Most frequently used tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.topTags.map(({ tag, count }) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <span className="ml-1 text-xs">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
