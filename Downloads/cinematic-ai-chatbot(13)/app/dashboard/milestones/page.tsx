"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Flag,
  Activity,
  Search,
  Plus,
  Target,
  Zap,
  AlertCircle,
} from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { MilestoneAnalyticsEngine, type MilestoneAnalytics, type MilestoneInsight } from "@/lib/milestone-analytics"
import { MilestoneCard } from "@/components/milestone/milestone-card"
import { MilestoneForm } from "@/components/milestone/milestone-form"

export default function MilestonesPage() {
  const { initiatives, operations } = useStrategic()
  const [analytics, setAnalytics] = useState<MilestoneAnalytics | null>(null)
  const [insights, setInsights] = useState<MilestoneInsight[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string>("")

  // Generate analytics
  const analyticsEngine = useMemo(() => {
    return new MilestoneAnalyticsEngine(initiatives, operations)
  }, [initiatives, operations])

  useEffect(() => {
    const newAnalytics = analyticsEngine.generateAnalytics()
    const newInsights = analyticsEngine.generateInsights()
    setAnalytics(newAnalytics)
    setInsights(newInsights)
  }, [analyticsEngine])

  // Get all milestones with initiative context
  const allMilestones = useMemo(() => {
    return initiatives.flatMap((initiative) =>
      initiative.milestones.map((milestone) => ({
        ...milestone,
        initiativeId: initiative.id,
        initiativeTitle: initiative.title,
        initiativePriority: initiative.priority,
      })),
    )
  }, [initiatives])

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    return allMilestones.filter((milestone) => {
      const matchesSearch =
        milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        milestone.initiativeTitle.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || milestone.status === statusFilter
      const matchesPriority = priorityFilter === "all" || milestone.initiativePriority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [allMilestones, searchTerm, statusFilter, priorityFilter])

  // Categorize milestones
  const categorizedMilestones = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return {
      overdue: filteredMilestones.filter((m) => new Date(m.dueDate) < now && m.status !== "completed"),
      upcoming: filteredMilestones.filter(
        (m) => new Date(m.dueDate) >= now && new Date(m.dueDate) <= nextWeek && m.status !== "completed",
      ),
      inProgress: filteredMilestones.filter((m) => m.status === "in-progress"),
      completed: filteredMilestones.filter((m) => m.status === "completed"),
      all: filteredMilestones,
    }
  }, [filteredMilestones])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500"
      case "warning":
        return "border-l-yellow-500"
      case "error":
        return "border-l-red-500"
      default:
        return "border-l-blue-500"
    }
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestones</h1>
          <p className="text-muted-foreground">Track and analyze milestone performance across all initiatives</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Milestone
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMilestones}</div>
            <p className="text-xs text-muted-foreground">{analytics.completedMilestones} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdueMilestones}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.upcomingMilestones}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Key Insights
            </CardTitle>
            <CardDescription>AI-powered analysis of your milestone performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 border-l-4 bg-muted/50 rounded-r-lg ${getInsightBorderColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge
                          variant={
                            insight.priority === "high"
                              ? "destructive"
                              : insight.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-sm font-medium text-primary">{insight.recommendation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>On-Time Delivery</span>
                <span className="font-medium">{analytics.performanceMetrics.onTimeDelivery.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.performanceMetrics.onTimeDelivery} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Efficiency</span>
                <span className="font-medium">{analytics.performanceMetrics.teamEfficiency.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.performanceMetrics.teamEfficiency} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Resource Utilization</span>
                <span className="font-medium">{analytics.performanceMetrics.resourceUtilization.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.performanceMetrics.resourceUtilization} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Risk</span>
                <Badge variant="destructive">{analytics.riskAssessment.highRiskMilestones}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Risk</span>
                <Badge variant="default">{analytics.riskAssessment.mediumRiskMilestones}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Risk</span>
                <Badge variant="secondary">{analytics.riskAssessment.lowRiskMilestones}</Badge>
              </div>
              {analytics.riskAssessment.criticalDeadlines.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-red-600 mb-2">Critical Deadlines</p>
                  {analytics.riskAssessment.criticalDeadlines.slice(0, 2).map((milestone) => (
                    <div key={milestone.id} className="text-xs text-muted-foreground">
                      {milestone.title} - {new Date(milestone.dueDate).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Bottleneck Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.bottlenecks.length > 0 ? (
              <div className="space-y-3">
                {analytics.bottlenecks.slice(0, 3).map((bottleneck, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium truncate">{bottleneck.milestoneTitle}</p>
                      <Badge variant="destructive" className="text-xs">
                        {bottleneck.impactScore.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{bottleneck.delayDays} days delayed</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No significant bottlenecks detected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Management</CardTitle>
          <CardDescription>Filter and manage milestones across all initiatives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search milestones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({categorizedMilestones.all.length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({categorizedMilestones.overdue.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({categorizedMilestones.upcoming.length})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({categorizedMilestones.inProgress.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({categorizedMilestones.completed.length})</TabsTrigger>
            </TabsList>

            {Object.entries(categorizedMilestones).map(([category, milestones]) => (
              <TabsContent key={category} value={category} className="mt-6">
                {milestones.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {milestones.map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        initiativeId={milestone.initiativeId}
                        onUpdate={() => {
                          // Refresh analytics
                          const newAnalytics = analyticsEngine.generateAnalytics()
                          const newInsights = analyticsEngine.generateInsights()
                          setAnalytics(newAnalytics)
                          setInsights(newInsights)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No milestones found</h3>
                    <p className="text-muted-foreground mb-4">
                      {category === "all"
                        ? "Create your first milestone to start tracking progress"
                        : `No milestones in the ${category.replace("-", " ")} category`}
                    </p>
                    {category === "all" && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Milestone
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Milestone Form */}
      {showCreateForm && (
        <MilestoneForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          initiativeId={selectedInitiativeId}
          onSuccess={() => {
            setShowCreateForm(false)
            // Refresh analytics
            const newAnalytics = analyticsEngine.generateAnalytics()
            const newInsights = analyticsEngine.generateInsights()
            setAnalytics(newAnalytics)
            setInsights(newInsights)
          }}
        />
      )}
    </div>
  )
}
