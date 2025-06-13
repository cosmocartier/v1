"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react"
import type { TrendData, PerformanceMetrics } from "@/lib/milestone-analytics"

interface MilestoneTrendsProps {
  trendData: TrendData[]
  performanceMetrics: PerformanceMetrics
}

export function MilestoneTrends({ trendData, performanceMetrics }: MilestoneTrendsProps) {
  const latestTrend = trendData[trendData.length - 1]
  const previousTrend = trendData[trendData.length - 2]

  const completionTrend = latestTrend && previousTrend ? latestTrend.completionRate - previousTrend.completionRate : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Completion Trends
          </CardTitle>
          <CardDescription>Monthly milestone completion performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendData.slice(-6).map((trend, index) => (
              <div key={trend.period} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">{trend.period}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {trend.completed}/{trend.created}
                    </Badge>
                    {trend.overdue > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {trend.overdue} overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12 text-right">{trend.completionRate.toFixed(0)}%</span>
                  <div className="w-20">
                    <Progress value={trend.completionRate} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completionTrend !== 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                {completionTrend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">
                  {completionTrend > 0 ? "Improving" : "Declining"} by{" "}
                  <span className={`font-medium ${completionTrend > 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(completionTrend).toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Performance Breakdown
          </CardTitle>
          <CardDescription>Key performance indicators analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Productivity Score</span>
                <span className="font-medium">{performanceMetrics.productivityScore.toFixed(1)}%</span>
              </div>
              <Progress value={performanceMetrics.productivityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quality Score</span>
                <span className="font-medium">{performanceMetrics.qualityScore.toFixed(1)}%</span>
              </div>
              <Progress value={performanceMetrics.qualityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Team Efficiency</span>
                <span className="font-medium">{performanceMetrics.teamEfficiency.toFixed(1)}%</span>
              </div>
              <Progress value={performanceMetrics.teamEfficiency} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Average Delay:{" "}
                <span className="font-medium text-foreground">
                  {performanceMetrics.averageDelayDays.toFixed(1)} days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
