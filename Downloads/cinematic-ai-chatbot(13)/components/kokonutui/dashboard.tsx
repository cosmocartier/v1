"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, CheckCircle, Clock, Users, BarChart3, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { useStrategic } from "@/lib/strategic-context"

export function KokonutDashboard() {
  const { initiatives, operations, tasks } = useStrategic()

  // Calculate metrics
  const activeInitiatives = initiatives.filter((i) => i.status !== "Completed").length
  const completedInitiatives = initiatives.filter((i) => i.status === "Completed").length
  const activeOperations = operations.filter((o) => o.status === "In Progress").length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const completedTasks = tasks.filter((t) => t.status === "completed").length

  const overallProgress = initiatives.length > 0 ? Math.round((completedInitiatives / initiatives.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Overview</h1>
          <p className="text-muted-foreground">Monitor your strategic initiatives and operational performance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/initiatives">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Initiative
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Initiatives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInitiatives}</div>
            <p className="text-xs text-muted-foreground">{completedInitiatives} completed this quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOperations}</div>
            <p className="text-xs text-muted-foreground">In progress operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} completed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Initiatives</CardTitle>
            <CardDescription>Your most recent strategic initiatives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initiatives.slice(0, 5).map((initiative) => (
                <div key={initiative.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{initiative.title}</p>
                    <p className="text-sm text-muted-foreground">{initiative.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        initiative.status === "Completed"
                          ? "default"
                          : initiative.status === "In Progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {initiative.status}
                    </Badge>
                    <Link href={`/dashboard/initiatives/${initiative.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/initiatives">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Initiative
              </Button>
            </Link>
            <Link href="/dashboard/operations">
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                New Operation
              </Button>
            </Link>
            <Link href="/dashboard/tasks">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
