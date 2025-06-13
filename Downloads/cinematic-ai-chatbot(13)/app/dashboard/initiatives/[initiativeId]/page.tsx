"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Milestone,
} from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { OperationForm } from "@/components/forms/operation-form"
import { MilestoneForm } from "@/components/milestone/milestone-form"
import { MilestoneCard } from "@/components/milestone/milestone-card"
import Link from "next/link"

export default function InitiativeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const initiativeId = params.initiativeId as string
  const { getInitiativeById, getOperationsForInitiative } = useStrategic()
  const [showCreateOperation, setShowCreateOperation] = useState(false)
  const [showCreateMilestone, setShowCreateMilestone] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const initiative = getInitiativeById(initiativeId)
  const operations = getOperationsForInitiative(initiativeId)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (!initiative) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Initiative Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested initiative could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive"
      case "High":
        return "default"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "Blocked":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "On Hold":
        return <Pause className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{initiative.title}</h1>
          <p className="text-muted-foreground">Initiative Details & Progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateMilestone(true)}>
            <Milestone className="w-4 h-4 mr-2" />
            New Milestone
          </Button>
          <Button onClick={() => setShowCreateOperation(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Operation
          </Button>
        </div>
      </div>

      {/* Initiative Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant={getPriorityColor(initiative.priority)}>{initiative.priority} Priority</Badge>
                <Badge variant="outline">{initiative.visibility}</Badge>
              </div>
              <CardTitle className="text-xl">{initiative.title}</CardTitle>
              <CardDescription>{initiative.desiredOutcome}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span>{initiative.progress}%</span>
            </div>
            <Progress value={initiative.progress} className="h-3" />
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Owner</span>
              </div>
              <p className="font-medium">{initiative.owner}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <p className="font-medium">{new Date(initiative.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Success Metric</span>
              </div>
              <p className="font-medium text-sm">{initiative.successMetric}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>Operations</span>
              </div>
              <p className="font-medium">{operations.length} active</p>
            </div>
          </div>

          {/* Description */}
          {initiative.description && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{initiative.description}</p>
              </div>
            </>
          )}

          {/* Strategic Alignment */}
          {initiative.strategicAlignment && (
            <div>
              <h4 className="font-medium mb-2">Strategic Alignment</h4>
              <p className="text-muted-foreground">{initiative.strategicAlignment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>Key deliverables and checkpoints for this initiative</CardDescription>
            </div>
            <Button onClick={() => setShowCreateMilestone(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {initiative.milestones && initiative.milestones.length > 0 ? (
            <div className="space-y-4">
              {initiative.milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  initiativeId={initiativeId}
                  onUpdate={handleRefresh}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Milestone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
              <p className="text-muted-foreground mb-4">
                Create milestones to track key deliverables and progress checkpoints.
              </p>
              <Button onClick={() => setShowCreateMilestone(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Milestone
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
          <CardDescription>Execution tasks that deliver progress toward this initiative</CardDescription>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No operations yet</h3>
              <p className="text-muted-foreground mb-4">
                Create operations to break down this initiative into actionable tasks.
              </p>
              <Button onClick={() => setShowCreateOperation(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Operation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((operation) => (
                <Link key={operation.id} href={`/dashboard/operations/${operation.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{operation.title}</h4>
                          <p className="text-sm text-muted-foreground">{operation.deliverable}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getPriorityColor(operation.priority)} className="text-xs">
                            {operation.priority}
                          </Badge>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(operation.status)}`}
                          >
                            {getStatusIcon(operation.status)}
                            {operation.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {operation.owner}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(operation.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{operation.progress}%</span>
                          <Progress value={operation.progress} className="w-16 h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <OperationForm
        open={showCreateOperation}
        onOpenChange={setShowCreateOperation}
        preselectedInitiativeId={initiativeId}
        onSuccess={handleRefresh}
      />

      <MilestoneForm
        open={showCreateMilestone}
        onOpenChange={setShowCreateMilestone}
        initiativeId={initiativeId}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
