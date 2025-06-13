"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Target,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Globe,
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Archive,
  Edit3,
  X,
  ChevronLeft,
} from "lucide-react"

interface Operation {
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
  }
  lastActivity: string
}

interface OperationsDashboardProps {
  onClose: () => void
  onCreateOperation: () => void
}

export function OperationsDashboard({ onClose, onCreateOperation }: OperationsDashboardProps) {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showMobileDetails, setShowMobileDetails] = useState(false)

  // Mock operations data
  const [operations] = useState<Operation[]>([
    {
      id: "op-001",
      title: "Market Entry Strategy - APAC",
      description: "Comprehensive market penetration strategy for Asian Pacific markets",
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
      },
      lastActivity: "2 hours ago",
    },
    {
      id: "op-002",
      title: "Revenue Optimization Initiative",
      description: "Strategic pricing and revenue stream optimization across all product lines",
      category: "Financial Strategy",
      status: "active",
      priority: "high",
      progress: 42,
      startDate: "2024-02-01",
      targetDate: "2024-08-15",
      icon: TrendingUp,
      metrics: {
        kpis: 6,
        milestones: 10,
        completedMilestones: 4,
      },
      lastActivity: "1 day ago",
    },
    {
      id: "op-003",
      title: "Digital Transformation Phase 2",
      description: "Technology infrastructure modernization and process automation",
      category: "Innovation Strategy",
      status: "planning",
      priority: "medium",
      progress: 15,
      startDate: "2024-03-01",
      targetDate: "2024-12-31",
      icon: Zap,
      metrics: {
        kpis: 12,
        milestones: 18,
        completedMilestones: 2,
      },
      lastActivity: "3 days ago",
    },
    {
      id: "op-004",
      title: "Team Scaling Framework",
      description: "Strategic hiring and organizational development plan",
      category: "Operational Strategy",
      status: "completed",
      priority: "medium",
      progress: 100,
      startDate: "2023-10-01",
      targetDate: "2024-01-31",
      icon: Users,
      metrics: {
        kpis: 5,
        milestones: 8,
        completedMilestones: 8,
      },
      lastActivity: "1 week ago",
    },
    {
      id: "op-005",
      title: "Risk Mitigation Protocol",
      description: "Comprehensive risk assessment and contingency planning",
      category: "Risk Management",
      status: "paused",
      priority: "low",
      progress: 28,
      startDate: "2024-01-20",
      targetDate: "2024-07-20",
      icon: Shield,
      metrics: {
        kpis: 4,
        milestones: 6,
        completedMilestones: 2,
      },
      lastActivity: "2 weeks ago",
    },
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

  const filteredOperations = operations.filter((op) => filterStatus === "all" || op.status === filterStatus)

  const handleOperationSelect = (operationId: string) => {
    setSelectedOperation(operationId)
    setShowMobileDetails(true)
  }

  const handleMobileBack = () => {
    setShowMobileDetails(false)
    setSelectedOperation(null)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-background border border-border w-full h-full max-w-7xl max-h-[95vh] rounded-lg overflow-hidden flex flex-col">
        {/* Mobile-optimized Header */}
        <div className="bg-card border-b border-border p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {showMobileDetails && (
                <button
                  onClick={handleMobileBack}
                  className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate">
                  {showMobileDetails ? "OPERATION DETAILS" : "OPERATIONS COMMAND"}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 hidden sm:block">
                  Strategic Operations Management & Orchestration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!showMobileDetails && (
                <Button
                  onClick={onCreateOperation}
                  className="bg-foreground hover:bg-foreground/90 text-background font-bold text-xs sm:text-sm tracking-tight uppercase h-9 sm:h-10 px-3 sm:px-6 rounded-sm"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">NEW OPERATION</span>
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-9 sm:h-10 px-3 sm:px-4 rounded-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">CLOSE</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex-1 overflow-hidden">
          {!showMobileDetails ? (
            <MobileOperationsList
              operations={filteredOperations}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onOperationSelect={handleOperationSelect}
              selectedOperation={selectedOperation}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          ) : (
            <MobileOperationDetails
              operation={operations.find((op) => op.id === selectedOperation)!}
              onBack={handleMobileBack}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          {/* Operations List */}
          <div className="w-1/2 border-r border-border flex flex-col">
            <DesktopOperationsList
              operations={filteredOperations}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onOperationSelect={setSelectedOperation}
              selectedOperation={selectedOperation}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          </div>

          {/* Operation Details */}
          <div className="w-1/2 flex flex-col">
            {selectedOperation ? (
              <OperationDetails
                operation={operations.find((op) => op.id === selectedOperation)!}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select an Operation</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Choose an operation from the list to view detailed information and metrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile Operations List Component with touch-friendly design
function MobileOperationsList({
  operations,
  filterStatus,
  setFilterStatus,
  onOperationSelect,
  selectedOperation,
  getStatusIcon,
  getStatusColor,
  getPriorityColor,
}: {
  operations: Operation[]
  filterStatus: string
  setFilterStatus: (status: string) => void
  onOperationSelect: (id: string) => void
  selectedOperation: string | null
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Mobile Filters with horizontal scroll */}
      <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
          {["all", "active", "planning", "paused", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors uppercase tracking-wide whitespace-nowrap flex-shrink-0 min-h-[44px] flex items-center ${
                filterStatus === status
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Operations List with touch-friendly cards */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {operations.map((operation) => {
            const StatusIcon = getStatusIcon(operation.status)
            const OperationIcon = operation.icon

            return (
              <div
                key={operation.id}
                onClick={() => onOperationSelect(operation.id)}
                className="p-4 rounded-lg border border-border bg-card hover:border-foreground/20 transition-all duration-200 hover:bg-muted/30 cursor-pointer min-h-[120px] active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <OperationIcon className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-base leading-tight mb-1">{operation.title}</h3>
                      <p className="text-sm text-muted-foreground">{operation.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(operation.status)}`} />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {operation.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{operation.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${operation.progress}%` }}
                    />
                  </div>
                </div>

                {/* Mobile Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      KPIs: <span className="text-foreground font-medium">{operation.metrics.kpis}</span>
                    </span>
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">
                        {operation.metrics.completedMilestones}/{operation.metrics.milestones}
                      </span>
                    </span>
                  </div>
                  <span className={`font-medium text-sm ${getPriorityColor(operation.priority)}`}>
                    {operation.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// Mobile Operation Details Component
function MobileOperationDetails({
  operation,
  onBack,
  getStatusIcon,
  getStatusColor,
}: {
  operation: Operation
  onBack: () => void
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>
  getStatusColor: (status: string) => string
}) {
  const StatusIcon = getStatusIcon(operation.status)
  const OperationIcon = operation.icon

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Mobile Operation Header */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <OperationIcon className="w-8 h-8 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-foreground tracking-tight mb-2 leading-tight">{operation.title}</h2>
              <p className="text-muted-foreground text-sm mb-3">{operation.category}</p>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${getStatusColor(operation.status)}`} />
                <span className={`text-sm font-medium ${getStatusColor(operation.status)}`}>
                  {operation.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{operation.description}</p>
        </div>

        {/* Mobile Progress Overview */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Progress Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="text-foreground font-medium text-lg">{operation.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${operation.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{operation.metrics.kpis}</div>
                <div className="text-xs text-muted-foreground">KPIs Defined</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{operation.metrics.completedMilestones}</div>
                <div className="text-xs text-muted-foreground">Milestones Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {operation.metrics.milestones - operation.metrics.completedMilestones}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">Start Date</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(operation.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">Target Completion</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(operation.targetDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">Last Activity</div>
                <div className="text-sm text-muted-foreground">{operation.lastActivity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions with touch-friendly buttons */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted h-14 rounded-lg text-sm justify-start"
            >
              <Edit3 className="w-5 h-5 mr-3" />
              Edit Operation
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted h-14 rounded-lg text-sm justify-start"
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted h-14 rounded-lg text-sm justify-start"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Schedule Review
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-muted h-14 rounded-lg text-sm justify-start"
            >
              <Archive className="w-5 h-5 mr-3" />
              Archive
            </Button>
          </div>
        </div>

        {/* Mobile Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4 text-lg">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground leading-relaxed">
                  Milestone "Market Research Phase" completed
                </div>
                <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground leading-relaxed">KPI "Customer Acquisition Rate" updated</div>
                <div className="text-xs text-muted-foreground mt-1">1 day ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground leading-relaxed">Risk assessment review scheduled</div>
                <div className="text-xs text-muted-foreground mt-1">3 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

// Desktop Operations List Component (unchanged for brevity)
function DesktopOperationsList({
  operations,
  filterStatus,
  setFilterStatus,
  onOperationSelect,
  selectedOperation,
  getStatusIcon,
  getStatusColor,
  getPriorityColor,
}: {
  operations: Operation[]
  filterStatus: string
  setFilterStatus: (status: string) => void
  onOperationSelect: (id: string) => void
  selectedOperation: string | null
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
}) {
  return (
    <>
      {/* Filters */}
      <div className="p-4 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex gap-2">
          {["all", "active", "planning", "paused", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors uppercase tracking-wide ${
                filterStatus === status
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {operations.map((operation) => {
            const StatusIcon = getStatusIcon(operation.status)
            const OperationIcon = operation.icon

            return (
              <div
                key={operation.id}
                onClick={() => onOperationSelect(operation.id)}
                className={`p-4 rounded-md border cursor-pointer transition-all duration-200 ${
                  selectedOperation === operation.id
                    ? "border-foreground bg-muted/50"
                    : "border-border bg-card hover:border-foreground/20 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <OperationIcon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{operation.title}</h3>
                      <p className="text-xs text-muted-foreground">{operation.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(operation.status)}`} />
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{operation.description}</p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{operation.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${operation.progress}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      KPIs: <span className="text-foreground font-medium">{operation.metrics.kpis}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Milestones:{" "}
                      <span className="text-foreground font-medium">
                        {operation.metrics.completedMilestones}/{operation.metrics.milestones}
                      </span>
                    </span>
                  </div>
                  <span className={`font-medium ${getPriorityColor(operation.priority)}`}>
                    {operation.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </>
  )
}

function OperationDetails({
  operation,
  getStatusColor,
  getStatusIcon,
}: {
  operation: Operation
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ComponentType<{ className?: string }>
}) {
  const StatusIcon = getStatusIcon(operation.status)
  const OperationIcon = operation.icon

  return (
    <div className="h-full flex flex-col">
      {/* Operation Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <OperationIcon className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">{operation.title}</h2>
              <p className="text-muted-foreground text-sm">{operation.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${getStatusColor(operation.status)}`} />
            <span className={`text-sm font-medium ${getStatusColor(operation.status)}`}>
              {operation.status.toUpperCase()}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{operation.description}</p>
      </div>

      {/* Operation Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="text-foreground font-medium">{operation.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${operation.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{operation.metrics.kpis}</div>
                  <div className="text-xs text-muted-foreground">KPIs Defined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{operation.metrics.completedMilestones}</div>
                  <div className="text-xs text-muted-foreground">Milestones Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {operation.metrics.milestones - operation.metrics.completedMilestones}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Start Date</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(operation.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Target Completion</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(operation.targetDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Last Activity</div>
                  <div className="text-xs text-muted-foreground">{operation.lastActivity}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-10 rounded-sm text-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Operation
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-10 rounded-sm text-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-10 rounded-sm text-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Review
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted h-10 rounded-sm text-sm"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm text-foreground">Milestone "Market Research Phase" completed</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm text-foreground">KPI "Customer Acquisition Rate" updated</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm text-foreground">Risk assessment review scheduled</div>
                  <div className="text-xs text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
