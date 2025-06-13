"use client"

import Link from "next/link"
import { useStrategic } from "@/lib/strategic-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, ArrowLeft, Target } from "lucide-react"

export default function OperationsPage() {
  const { operations, initiatives, isLoading, getInitiativeById } = useStrategic()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Not Started":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "On Hold":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading operations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background px-4 sm:px-6 py-4 sm:py-6 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold">All Operations</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{operations.length} operations</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {operations.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Operations Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Operations are created within initiatives. Start by creating an initiative and then add operations to
              execute it.
            </p>
            <Link href="/dashboard/initiatives">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Initiative
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operations.map((operation) => (
              <Link href={`/dashboard/operations/${operation.id}`} key={operation.id}>
                <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{operation.title}</CardTitle>
                    <div className="flex gap-2 pt-2">
                      <Badge className={getPriorityColor(operation.priority)}>{operation.priority}</Badge>
                      <Badge className={getStatusColor(operation.status)}>{operation.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{operation.deliverable}</p>

                      {/* Linked Initiatives */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Linked Initiatives:</p>
                        <div className="flex flex-wrap gap-1">
                          {operation.initiativeIds.map((initiativeId) => {
                            const initiative = getInitiativeById(initiativeId)
                            return initiative ? (
                              <Badge key={initiativeId} variant="outline" className="text-xs">
                                {initiative.title}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>

                      {/* Owner */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Owner: </span>
                        <span className="font-medium">{operation.owner}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{operation.progress}%</span>
                      </div>
                      <Progress value={operation.progress} className="h-2" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                        <Calendar className="w-4 h-4" />
                        <span>Due {new Date(operation.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
