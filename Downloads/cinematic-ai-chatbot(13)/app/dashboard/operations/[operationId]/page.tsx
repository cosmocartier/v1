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
  Calendar,
  User,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Brain,
  RefreshCw,
} from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { PredictionDisplay } from "@/components/prediction-display"
import Link from "next/link"

export default function OperationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const operationId = params.operationId as string
  const { getOperationById, getInitiativeById, generatePrediction, updateOperation } = useStrategic()
  const [isGeneratingPrediction, setIsGeneratingPrediction] = useState(false)

  const operation = getOperationById(operationId)

  if (!operation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2">Operation Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested operation could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const linkedInitiatives = operation.initiativeIds
    .map((id) => getInitiativeById(id))
    .filter((initiative) => initiative !== undefined)

  const handleRegeneratePrediction = async () => {
    setIsGeneratingPrediction(true)
    try {
      const newPrediction = await generatePrediction(operationId)
      if (newPrediction) {
        await updateOperation(operationId, { prediction: newPrediction })
      }
    } catch (error) {
      console.error("Failed to generate prediction:", error)
    } finally {
      setIsGeneratingPrediction(false)
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{operation.title}</h1>
          <p className="text-muted-foreground">Operation Details & AI Predictions</p>
        </div>
        <Button variant="outline" onClick={handleRegeneratePrediction} disabled={isGeneratingPrediction}>
          {isGeneratingPrediction ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          {isGeneratingPrediction ? "Generating..." : "Update Prediction"}
        </Button>
      </div>

      {/* Operation Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge variant={getPriorityColor(operation.priority)}>{operation.priority} Priority</Badge>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(operation.status)}`}
                >
                  {getStatusIcon(operation.status)}
                  {operation.status}
                </div>
              </div>
              <CardTitle className="text-xl">{operation.title}</CardTitle>
              <CardDescription>{operation.deliverable}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span>{operation.progress}%</span>
            </div>
            <Progress value={operation.progress} className="h-3" />
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Owner</span>
              </div>
              <p className="font-medium">{operation.owner}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due Date</span>
              </div>
              <p className="font-medium">{new Date(operation.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>Complexity</span>
              </div>
              <p className="font-medium">{operation.complexity || "Not Set"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Estimated Hours</span>
              </div>
              <p className="font-medium">{operation.estimatedHours || "Not Set"}</p>
            </div>
          </div>

          {/* Description */}
          {operation.description && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{operation.description}</p>
              </div>
            </>
          )}

          {/* Dependencies */}
          {operation.dependencies && operation.dependencies.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {operation.dependencies.map((dependency, index) => (
                  <Badge key={index} variant="outline">
                    {dependency}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {operation.risks && operation.risks.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Risks</h4>
              <div className="flex flex-wrap gap-2">
                {operation.risks.map((risk, index) => (
                  <Badge key={index} variant="destructive">
                    {risk.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Predictions */}
      {operation.prediction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Predictions
            </CardTitle>
            <CardDescription>Machine learning insights based on historical data and current progress</CardDescription>
          </CardHeader>
          <CardContent>
            <PredictionDisplay prediction={operation.prediction} />
          </CardContent>
        </Card>
      )}

      {/* Linked Initiatives */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Initiatives</CardTitle>
          <CardDescription>Strategic initiatives this operation contributes to</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedInitiatives.length === 0 ? (
            <p className="text-muted-foreground">No linked initiatives found.</p>
          ) : (
            <div className="space-y-3">
              {linkedInitiatives.map((initiative) => (
                <Link key={initiative.id} href={`/dashboard/initiatives/${initiative.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{initiative.title}</h4>
                          <p className="text-sm text-muted-foreground">{initiative.desiredOutcome}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getPriorityColor(initiative.priority)} className="text-xs">
                            {initiative.priority}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{initiative.progress}%</span>
                            <Progress value={initiative.progress} className="w-16 h-2" />
                          </div>
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
    </div>
  )
}
