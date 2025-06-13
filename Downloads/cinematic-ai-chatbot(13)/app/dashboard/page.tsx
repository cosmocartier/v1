"use client"

import { useStrategic } from "@/lib/strategic-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Overview } from "@/components/overview"
import {
  Target,
  Layers,
  ListChecks,
  Flag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { initiatives, operations, tasks } = useStrategic()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { getUserDisplayName } = useAuth()

  // Calculate metrics
  const activeInitiatives = initiatives.filter((i) => i.status !== "Completed")
  const completedInitiatives = initiatives.filter((i) => i.status === "Completed")
  const activeOperations = operations.filter((o) => o.status === "In Progress")
  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  const metrics = [
    {
      title: "Active Initiatives",
      value: activeInitiatives.length,
      total: initiatives.length,
      icon: Layers,
      href: "/dashboard/initiatives",
      status: "active",
      change: "+12%",
    },
    {
      title: "Operations",
      value: activeOperations.length,
      total: operations.length,
      icon: Target,
      href: "/dashboard/operations",
      status: "progress",
      change: "+8%",
    },
    {
      title: "Tasks",
      value: pendingTasks.length,
      total: tasks.length,
      icon: ListChecks,
      href: "/dashboard/tasks",
      status: "pending",
      change: "-3%",
    },
    {
      title: "Milestones",
      value: 12,
      total: 18,
      icon: Flag,
      href: "/dashboard/milestones",
      status: "milestone",
      change: "+15%",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-neo-accent"
      case "progress":
        return "text-neo-success"
      case "pending":
        return "text-neo-warning"
      case "milestone":
        return "text-white"
      default:
        return "text-white/70"
    }
  }

  const getChangeColor = (change: string) => {
    return change.startsWith("+") ? "text-neo-success" : "text-neo-error"
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Mobile-optimized Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">Strategic Overview</h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl">
              Real-time operational intelligence and performance metrics
            </p>
          </div>

          {/* Mobile Action Menu */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-neutral-800 text-white/70 hover:text-white hover:bg-white/5 neo-interactive w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Export Data
            </Button>
            <Button size="sm" className="bg-white text-black hover:bg-neutral-100 neo-interactive w-full sm:w-auto">
              <TrendingUp className="h-4 w-4 mr-2" strokeWidth={1.5} />
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <Link key={metric.title} href={metric.href} className="block">
            <Card className="bg-card border-neutral-800 hover:border-neutral-700 neo-interactive cursor-pointer h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <metric.icon
                    className={cn("h-5 w-5 sm:h-6 sm:w-6", getStatusColor(metric.status))}
                    strokeWidth={1.5}
                  />
                  <ArrowUpRight className="h-4 w-4 text-white/40" strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tabular-nums">
                      {metric.value}
                    </span>
                    <span className="text-sm text-white/40">/ {metric.total}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base text-white/70 font-medium">{metric.title}</h3>
                    <span className={cn("text-xs sm:text-sm font-bold tabular-nums", getChangeColor(metric.change))}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Mobile-optimized Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart - Full width on mobile */}
        <Card className="lg:col-span-2 bg-card border-neutral-800">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl text-white">Performance Trends</CardTitle>
              <div className="flex items-center gap-2 overflow-x-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/5 neo-interactive h-8 px-3 whitespace-nowrap"
                >
                  7d
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/5 neo-interactive h-8 px-3 whitespace-nowrap"
                >
                  30d
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 text-white neo-interactive h-8 px-3 whitespace-nowrap"
                >
                  90d
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="h-64 sm:h-80">
              <Overview />
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card className="bg-card border-neutral-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-neo-success flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm sm:text-base text-white/70">Completed Tasks</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white tabular-nums">{completedTasks.length}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-neo-warning flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm sm:text-base text-white/70">In Progress</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white tabular-nums">
                  {activeOperations.length}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-neo-error flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-sm sm:text-base text-white/70">Requires Attention</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-white tabular-nums">3</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-white/40">Overall Health</span>
                <Badge className="bg-neo-success/20 text-neo-success border-neo-success/30 text-xs sm:text-sm">
                  Excellent
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-optimized Recent Activity */}
      <Card className="bg-card border-neutral-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl text-white">Recent Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/5 neo-interactive w-full sm:w-auto"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            {[
              { action: "Initiative created", item: "Q4 Growth Strategy", time: "2 hours ago", type: "create" },
              { action: "Task completed", item: "Market Research Analysis", time: "4 hours ago", type: "complete" },
              { action: "Milestone reached", item: "Product Launch Phase 1", time: "1 day ago", type: "milestone" },
              { action: "Operation updated", item: "Customer Acquisition", time: "2 days ago", type: "update" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 sm:gap-4 py-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    activity.type === "create" && "bg-neo-accent",
                    activity.type === "complete" && "bg-neo-success",
                    activity.type === "milestone" && "bg-neo-warning",
                    activity.type === "update" && "bg-white/40",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-white/70">
                    <span className="text-white font-medium">{activity.action}</span>
                    {" • "}
                    <span className="break-words">{activity.item}</span>
                  </p>
                </div>
                <span className="text-xs sm:text-sm text-white/40 tabular-nums flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
