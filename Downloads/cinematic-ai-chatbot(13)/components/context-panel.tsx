"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Target,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  Brain,
  BookOpen,
  Settings,
  X,
} from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { MemoryPanel } from "@/components/memory/memory-panel"
import type { StrategicContext } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ContextPanelProps {
  strategicItem: StrategicContext
  onClose?: () => void
}

export function ContextPanel({ strategicItem, onClose }: ContextPanelProps) {
  const { getActivitiesForItem, getTeamCollaborationScore, getTaskCompletionRate } = useStrategic()
  const [activeTab, setActiveTab] = useState("overview")

  // Get real data from strategic context
  const activities = getActivitiesForItem(strategicItem.id, strategicItem.type)
  const collaborationScore = getTeamCollaborationScore(strategicItem.id, strategicItem.type)
  const completionRate = getTaskCompletionRate(strategicItem.id, strategicItem.type)

  // Get the actual strategic item data
  const { getInitiativeById, getOperationById } = useStrategic()
  const fullItem =
    strategicItem.type === "initiative" ? getInitiativeById(strategicItem.id) : getOperationById(strategicItem.id)

  const kpis = fullItem?.kpis || []
  const teamMembers = fullItem?.teamMembers || []
  const milestones = strategicItem.type === "initiative" ? (fullItem as any)?.milestones || [] : []
  const risks = strategicItem.type === "operation" ? (fullItem as any)?.risks || [] : []

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600"
      case "in progress":
      case "in-progress":
        return "text-blue-600"
      case "at risk":
      case "at-risk":
      case "blocked":
        return "text-red-600"
      case "on hold":
      case "on-hold":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskColor = (impact: string, probability: string) => {
    const riskScore =
      (impact === "high" ? 3 : impact === "medium" ? 2 : 1) *
      (probability === "high" ? 3 : probability === "medium" ? 2 : 1)

    if (riskScore >= 6) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    if (riskScore >= 4) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }

  return (
    <div className="w-96 border-l border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Context Panel</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{strategicItem.title}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {strategicItem.type}
            </Badge>
            <span className={`text-xs font-medium ${getStatusColor(strategicItem.status)}`}>
              {strategicItem.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs">
            Team
          </TabsTrigger>
          <TabsTrigger value="memory" className="text-xs">
            Memory
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">
            Insights
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{strategicItem.progress}%</span>
                      </div>
                      <Progress value={strategicItem.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{collaborationScore}</p>
                        <p className="text-xs text-muted-foreground">Collaboration Score</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* KPIs */}
                {kpis.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {kpis.slice(0, 3).map((kpi) => (
                        <div key={kpi.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">{kpi.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {kpi.trend === "up" ? "↗" : kpi.trend === "down" ? "↘" : "→"} {kpi.change}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {kpi.current} {kpi.unit}
                            </span>
                            <span>
                              Target: {kpi.target} {kpi.unit}
                            </span>
                          </div>
                          <Progress value={(kpi.current / kpi.target) * 100} className="h-1" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Milestones (for initiatives) */}
                {strategicItem.type === "initiative" && milestones.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {milestones.slice(0, 4).map((milestone: any) => (
                        <div key={milestone.id} className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {milestone.status === "completed" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : milestone.status === "in-progress" ? (
                              <Clock className="w-4 h-4 text-blue-500" />
                            ) : milestone.status === "delayed" ? (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{milestone.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Due {formatDistanceToNow(new Date(milestone.dueDate), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">{milestone.progress}%</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Risks (for operations) */}
                {strategicItem.type === "operation" && risks.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {risks.slice(0, 3).map((risk: any) => (
                        <div key={risk.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{risk.title}</span>
                            <Badge className={`text-xs ${getRiskColor(risk.impact, risk.probability)}`}>
                              {risk.impact}/{risk.probability}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{risk.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.userName} •{" "}
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="team" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                {/* Team Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teamMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            member.status === "active"
                              ? "bg-green-500"
                              : member.status === "away"
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                          }`}
                        />
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No team members assigned</p>
                    )}
                  </CardContent>
                </Card>

                {/* Team Performance */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Team Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold">
                          {teamMembers.filter((m: any) => m.status === "active").length}
                        </p>
                        <p className="text-xs text-muted-foreground">Active Members</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{collaborationScore}</p>
                        <p className="text-xs text-muted-foreground">Collaboration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="memory" className="h-full m-0">
            <MemoryPanel
              itemId={strategicItem.id}
              itemType={strategicItem.type}
              className="border-0 shadow-none h-full"
            />
          </TabsContent>

          <TabsContent value="insights" className="h-full m-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                {/* AI Insights */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100">Progress Trend</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Current progress is{" "}
                        {strategicItem.progress > 75
                          ? "excellent"
                          : strategicItem.progress > 50
                            ? "good"
                            : "needs attention"}
                        . Consider focusing on{" "}
                        {strategicItem.type === "initiative" ? "milestone completion" : "task execution"}.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-xs font-medium text-green-900 dark:text-green-100">Team Collaboration</p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Team collaboration score of {collaborationScore} indicates{" "}
                        {collaborationScore > 70 ? "strong" : "moderate"} engagement.
                        {collaborationScore <= 70 && "Consider increasing team touchpoints."}
                      </p>
                    </div>

                    {risks.length > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <p className="text-xs font-medium text-orange-900 dark:text-orange-100">Risk Assessment</p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          {risks.filter((r: any) => r.status === "active").length} active risks detected. Monitor
                          high-impact risks closely and update mitigation plans.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Calendar className="w-3 h-3 mr-2" />
                      Schedule Review
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Users className="w-3 h-3 mr-2" />
                      Update Team
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <BookOpen className="w-3 h-3 mr-2" />
                      Add Memory
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
