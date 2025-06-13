"use client" // Add this if not present, as it uses useState

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Target,
  Zap,
  Globe,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  X,
  Brain,
  BarChart,
  Layers,
  GitBranch,
} from "lucide-react"
import type React from "react" // Ensure React is imported if JSX is used directly
import { InitiativeCreationHandler } from "./initiative-creation-handler"

interface StrategicInitiative {
  id: string
  title: string
  description: string
  category: string
  status: "active" | "paused" | "completed" | "planning"
  priority: "high" | "medium" | "low"
  progress: number
  startDate: string
  targetDate: string
  icon: React.ComponentType<{ className?: string }>
  metrics: {
    kpis: number
    milestones: number
    completedMilestones: number
    strategicAlignment: number
    resourceUtilization: number
    riskLevel: "low" | "medium" | "high"
  }
  dependencies: string[]
  outcomes: {
    shortTerm: string[]
    longTerm: string[]
    impact: number
  }
  lastActivity: string
}

export function StrategicFramework({ onClose }: { onClose: () => void }) {
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null)
  // const [filterStatus, setFilterStatus] = useState<string>("all") // This state seems unused, consider removing or implementing
  // const [showMobileDetails, setShowMobileDetails] = useState(false) // This state seems unused

  // Mock strategic initiatives data - In a real app, this would come from context or props
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([
    {
      id: "si-001",
      title: "Market Expansion Strategy - APAC",
      description: "Comprehensive market penetration and growth strategy for Asian Pacific markets",
      category: "Growth Strategy",
      status: "active",
      priority: "high",
      progress: 65,
      startDate: "2024-01-15",
      targetDate: "2024-06-30",
      icon: Globe,
      metrics: {
        kpis: 8,
        milestones: 12,
        completedMilestones: 8,
        strategicAlignment: 85,
        resourceUtilization: 72,
        riskLevel: "medium",
      },
      dependencies: ["si-003", "si-005"], // Assuming these IDs exist if you expand mock data
      outcomes: {
        shortTerm: [
          "Establish market presence in key APAC cities",
          "Build initial customer base",
          "Set up local operations",
        ],
        longTerm: [
          "Achieve 25% market share in target segments",
          "Establish sustainable competitive advantage",
          "Create scalable growth model",
        ],
        impact: 90,
      },
      lastActivity: "2 hours ago",
    },
    {
      id: "si-002",
      title: "Digital Transformation Initiative",
      description: "Strategic technology modernization and process automation",
      category: "Innovation Strategy",
      status: "active",
      priority: "high",
      progress: 42,
      startDate: "2024-02-01",
      targetDate: "2024-08-15",
      icon: Zap,
      metrics: {
        kpis: 12,
        milestones: 18,
        completedMilestones: 7,
        strategicAlignment: 88,
        resourceUtilization: 65,
        riskLevel: "high",
      },
      dependencies: ["si-001"],
      outcomes: {
        shortTerm: [
          "Implement core digital infrastructure",
          "Automate key business processes",
          "Train staff on new systems",
        ],
        longTerm: [
          "Achieve 40% operational efficiency improvement",
          "Enable data-driven decision making",
          "Create digital-first customer experience",
        ],
        impact: 95,
      },
      lastActivity: "1 day ago",
    },
    // Add more initiatives if si-003, si-005 are dependencies
  ])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return Play
      case "paused":
        return Pause
      case "completed":
        return CheckCircle
      case "planning":
        return Clock
      default:
        return AlertCircle
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500/20 text-red-500" // Adjusted for Badge
      case "medium":
        return "bg-yellow-500/20 text-yellow-500" // Adjusted for Badge
      case "low":
        return "bg-green-500/20 text-green-500" // Adjusted for Badge
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // const filteredInitiatives = initiatives.filter( // This filter is not used, consider removing or implementing
  //   (initiative) => filterStatus === "all" || initiative.status === filterStatus
  // )
  const currentSelectedInitiative = initiatives.find((i) => i.id === selectedInitiativeId)

  return (
    <InitiativeCreationHandler>
      {({ onCreateInitiative }) => (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-background w-full max-w-7xl h-[95vh] sm:h-[90vh] rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <CardHeader className="p-4 sm:p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-primary" />
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                      STRATEGIC FRAMEWORK
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1 hidden sm:block">
                      Initiative Management & Outcome Orchestration
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    onClick={onCreateInitiative}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm tracking-tight uppercase h-9 sm:h-10 px-3 sm:px-6 rounded-md"
                  >
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">NEW INITIATIVE</span>
                  </Button>
                  <Button onClick={onClose} variant="outline" className="h-9 sm:h-10 px-3 sm:px-4 rounded-md">
                    <X className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">CLOSE</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strategic Initiatives List */}
              <div className="md:col-span-1 space-y-4 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-foreground px-1">Initiatives</h2>
                <ScrollArea className="flex-1 border rounded-md p-2">
                  <div className="space-y-3">
                    {initiatives.map((initiative) => {
                      const StatusIcon = getStatusIcon(initiative.status)
                      const InitiativeIcon = initiative.icon

                      return (
                        <div
                          key={initiative.id}
                          onClick={() => setSelectedInitiativeId(initiative.id)}
                          className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                            selectedInitiativeId === initiative.id
                              ? "border-primary bg-muted"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                <InitiativeIcon className="w-4 h-4 text-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm leading-tight">
                                  {initiative.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{initiative.category}</p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getRiskColor(initiative.metrics.riskLevel)}`}
                            >
                              {initiative.metrics.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <Progress value={initiative.progress} className="h-1.5 mb-1" />
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`w-3 h-3 ${getStatusColor(initiative.status)}`} />
                              <span className="text-muted-foreground">{initiative.status}</span>
                            </div>
                            <span className={`font-medium ${getPriorityColor(initiative.priority)}`}>
                              {initiative.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Initiative Details & Overview */}
              <div className="md:col-span-2 space-y-6 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-foreground px-1">
                  {currentSelectedInitiative ? `Details: ${currentSelectedInitiative.title}` : "Global Overview"}
                </h2>
                <ScrollArea className="flex-1 border rounded-md p-4">
                  {currentSelectedInitiative ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Strategic Alignment:</span>{" "}
                            {currentSelectedInitiative.metrics.strategicAlignment}%
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Resource Utilization:</span>{" "}
                            {currentSelectedInitiative.metrics.resourceUtilization}%
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Outcome Impact:</span>{" "}
                            {currentSelectedInitiative.outcomes.impact}%
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">KPIs:</span>{" "}
                            {currentSelectedInitiative.metrics.kpis}
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Milestones:</span>{" "}
                            {currentSelectedInitiative.metrics.completedMilestones}/
                            {currentSelectedInitiative.metrics.milestones}
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Last Activity:</span>{" "}
                            {currentSelectedInitiative.lastActivity}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Dependencies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {currentSelectedInitiative.dependencies.length > 0 ? (
                              currentSelectedInitiative.dependencies.map((depId) => {
                                const dep = initiatives.find((i) => i.id === depId)
                                return (
                                  <div
                                    key={depId}
                                    className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-md"
                                  >
                                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                                    <span>{dep?.title || `Initiative ${depId}`}</span>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-sm text-muted-foreground">No dependencies.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-sm font-semibold mb-1">Short-term</div>
                            <ul className="space-y-1 list-disc list-inside">
                              {currentSelectedInitiative.outcomes.shortTerm.map((outcome, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-semibold mb-1">Long-term</div>
                            <ul className="space-y-1 list-disc list-inside">
                              {currentSelectedInitiative.outcomes.longTerm.map((outcome, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Global Strategic Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-primary" />
                              <div className="text-sm font-medium">Overall Strategic Alignment</div>
                            </div>
                            <Progress value={86} className="h-2" />
                            <div className="text-xl font-bold text-right">86%</div>
                          </div>
                          <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2">
                              <BarChart className="w-5 h-5 text-primary" />
                              <div className="text-sm font-medium">Overall Resource Utilization</div>
                            </div>
                            <Progress value={68} className="h-2" />
                            <div className="text-xl font-bold text-right">68%</div>
                          </div>
                          <div className="space-y-3 p-3 bg-muted/50 rounded-md md:col-span-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-5 h-5 text-primary" />
                              <div className="text-sm font-medium">Overall Outcome Impact Potential</div>
                            </div>
                            <Progress value={92} className="h-2" />
                            <div className="text-xl font-bold text-right">92%</div>
                          </div>
                        </CardContent>
                      </Card>
                      <div className="flex items-center justify-center h-full min-h-[200px]">
                        <div className="text-center">
                          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-md font-semibold text-foreground mb-1">Select an Initiative</h3>
                          <p className="text-muted-foreground text-xs">
                            Choose a strategic initiative from the list to view its detailed information and metrics.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </InitiativeCreationHandler>
  )
}
