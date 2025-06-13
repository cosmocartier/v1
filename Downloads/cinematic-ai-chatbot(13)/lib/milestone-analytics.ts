import type { Initiative, Operation, Milestone } from "./strategic-context"

export interface MilestoneAnalytics {
  totalMilestones: number
  completedMilestones: number
  overdueMilestones: number
  upcomingMilestones: number
  completionRate: number
  averageCompletionTime: number
  criticalPathMilestones: Milestone[]
  bottlenecks: BottleneckAnalysis[]
  performanceMetrics: PerformanceMetrics
  trendData: TrendData[]
  riskAssessment: RiskAssessment
}

export interface BottleneckAnalysis {
  milestoneId: string
  milestoneTitle: string
  initiativeId: string
  initiativeTitle: string
  delayDays: number
  impactScore: number
  blockers: string[]
  recommendations: string[]
}

export interface PerformanceMetrics {
  onTimeDelivery: number
  averageDelayDays: number
  productivityScore: number
  qualityScore: number
  teamEfficiency: number
  resourceUtilization: number
}

export interface TrendData {
  period: string
  completed: number
  created: number
  overdue: number
  completionRate: number
}

export interface RiskAssessment {
  highRiskMilestones: number
  mediumRiskMilestones: number
  lowRiskMilestones: number
  criticalDeadlines: Milestone[]
  resourceConstraints: string[]
  dependencyRisks: string[]
}

export interface MilestoneInsight {
  type: "success" | "warning" | "error" | "info"
  title: string
  description: string
  actionable: boolean
  recommendation?: string
  priority: "high" | "medium" | "low"
}

export class MilestoneAnalyticsEngine {
  private initiatives: Initiative[]
  private operations: Operation[]

  constructor(initiatives: Initiative[], operations: Operation[]) {
    this.initiatives = initiatives
    this.operations = operations
  }

  public generateAnalytics(): MilestoneAnalytics {
    const allMilestones = this.getAllMilestones()

    return {
      totalMilestones: allMilestones.length,
      completedMilestones: this.getCompletedMilestones(allMilestones).length,
      overdueMilestones: this.getOverdueMilestones(allMilestones).length,
      upcomingMilestones: this.getUpcomingMilestones(allMilestones).length,
      completionRate: this.calculateCompletionRate(allMilestones),
      averageCompletionTime: this.calculateAverageCompletionTime(allMilestones),
      criticalPathMilestones: this.identifyCriticalPath(allMilestones),
      bottlenecks: this.analyzeBottlenecks(allMilestones),
      performanceMetrics: this.calculatePerformanceMetrics(allMilestones),
      trendData: this.generateTrendData(allMilestones),
      riskAssessment: this.assessRisks(allMilestones),
    }
  }

  public generateInsights(): MilestoneInsight[] {
    const analytics = this.generateAnalytics()
    const insights: MilestoneInsight[] = []

    // Completion rate insights
    if (analytics.completionRate < 70) {
      insights.push({
        type: "warning",
        title: "Low Milestone Completion Rate",
        description: `Only ${analytics.completionRate.toFixed(1)}% of milestones are completed on time`,
        actionable: true,
        recommendation: "Review milestone planning and resource allocation",
        priority: "high",
      })
    } else if (analytics.completionRate > 90) {
      insights.push({
        type: "success",
        title: "Excellent Milestone Performance",
        description: `${analytics.completionRate.toFixed(1)}% completion rate indicates strong execution`,
        actionable: false,
        priority: "low",
      })
    }

    // Overdue milestones
    if (analytics.overdueMilestones > 0) {
      insights.push({
        type: "error",
        title: "Overdue Milestones Detected",
        description: `${analytics.overdueMilestones} milestones are past their due dates`,
        actionable: true,
        recommendation: "Prioritize overdue milestones and reassess timelines",
        priority: "high",
      })
    }

    // Bottleneck analysis
    if (analytics.bottlenecks.length > 0) {
      const criticalBottlenecks = analytics.bottlenecks.filter((b) => b.impactScore > 7)
      if (criticalBottlenecks.length > 0) {
        insights.push({
          type: "warning",
          title: "Critical Bottlenecks Identified",
          description: `${criticalBottlenecks.length} high-impact bottlenecks are affecting milestone delivery`,
          actionable: true,
          recommendation: "Address resource constraints and dependency issues",
          priority: "high",
        })
      }
    }

    // Performance trends
    const recentTrend = analytics.trendData.slice(-3)
    if (recentTrend.length >= 2) {
      const trendDirection = recentTrend[recentTrend.length - 1].completionRate - recentTrend[0].completionRate
      if (trendDirection < -10) {
        insights.push({
          type: "warning",
          title: "Declining Performance Trend",
          description: "Milestone completion rates have decreased over recent periods",
          actionable: true,
          recommendation: "Investigate causes of performance decline",
          priority: "medium",
        })
      }
    }

    // Resource utilization
    if (analytics.performanceMetrics.resourceUtilization < 60) {
      insights.push({
        type: "info",
        title: "Low Resource Utilization",
        description: "Team resources may be underutilized for milestone delivery",
        actionable: true,
        recommendation: "Consider increasing milestone scope or reallocating resources",
        priority: "medium",
      })
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private getAllMilestones(): (Milestone & { initiativeId: string; initiativeTitle: string })[] {
    return this.initiatives.flatMap((initiative) =>
      initiative.milestones.map((milestone) => ({
        ...milestone,
        initiativeId: initiative.id,
        initiativeTitle: initiative.title,
      })),
    )
  }

  private getCompletedMilestones(milestones: Milestone[]): Milestone[] {
    return milestones.filter((m) => m.status === "completed")
  }

  private getOverdueMilestones(milestones: Milestone[]): Milestone[] {
    const now = new Date()
    return milestones.filter((m) => new Date(m.dueDate) < now && m.status !== "completed")
  }

  private getUpcomingMilestones(milestones: Milestone[]): Milestone[] {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return milestones.filter(
      (m) => new Date(m.dueDate) >= now && new Date(m.dueDate) <= nextWeek && m.status !== "completed",
    )
  }

  private calculateCompletionRate(milestones: Milestone[]): number {
    if (milestones.length === 0) return 0
    const completed = this.getCompletedMilestones(milestones).length
    return (completed / milestones.length) * 100
  }

  private calculateAverageCompletionTime(milestones: Milestone[]): number {
    const completedMilestones = milestones.filter((m) => m.status === "completed" && m.completedAt)
    if (completedMilestones.length === 0) return 0

    const totalDays = completedMilestones.reduce((sum, milestone) => {
      const created = new Date(milestone.createdAt)
      const completed = new Date(milestone.completedAt!)
      const days = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)

    return totalDays / completedMilestones.length
  }

  private identifyCriticalPath(milestones: (Milestone & { initiativeId: string })[]): Milestone[] {
    // Identify milestones that are critical to project success
    return milestones
      .filter((m) => m.status !== "completed")
      .sort((a, b) => {
        // Sort by due date and impact (progress weight)
        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()
        const impactA = (100 - a.progress) * 0.01
        const impactB = (100 - b.progress) * 0.01

        return dateA * impactA - dateB * impactB
      })
      .slice(0, 5) // Top 5 critical milestones
  }

  private analyzeBottlenecks(
    milestones: (Milestone & { initiativeId: string; initiativeTitle: string })[],
  ): BottleneckAnalysis[] {
    const now = new Date()

    return milestones
      .filter((m) => m.status === "delayed" || (new Date(m.dueDate) < now && m.status !== "completed"))
      .map((milestone) => {
        const delayDays = Math.ceil((now.getTime() - new Date(milestone.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        const impactScore = this.calculateImpactScore(milestone, delayDays)

        return {
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          initiativeId: milestone.initiativeId,
          initiativeTitle: milestone.initiativeTitle,
          delayDays: Math.max(0, delayDays),
          impactScore,
          blockers: this.identifyBlockers(milestone),
          recommendations: this.generateRecommendations(milestone, impactScore),
        }
      })
      .sort((a, b) => b.impactScore - a.impactScore)
  }

  private calculateImpactScore(milestone: Milestone, delayDays: number): number {
    // Calculate impact based on delay, progress, and milestone importance
    const delayImpact = Math.min(delayDays * 0.5, 5) // Max 5 points for delay
    const progressImpact = (100 - milestone.progress) * 0.03 // Max 3 points for incomplete progress
    const urgencyImpact = delayDays > 7 ? 2 : delayDays > 3 ? 1 : 0 // Urgency bonus

    return Math.min(delayImpact + progressImpact + urgencyImpact, 10)
  }

  private identifyBlockers(milestone: Milestone): string[] {
    const blockers: string[] = []

    if (milestone.progress < 25) {
      blockers.push("Low progress indicates potential resource or planning issues")
    }

    if (milestone.status === "delayed") {
      blockers.push("Milestone explicitly marked as delayed")
    }

    if (!milestone.assigneeId) {
      blockers.push("No assignee - unclear ownership")
    }

    return blockers
  }

  private generateRecommendations(milestone: Milestone, impactScore: number): string[] {
    const recommendations: string[] = []

    if (impactScore > 7) {
      recommendations.push("Escalate to leadership for immediate attention")
      recommendations.push("Consider reallocating resources from lower-priority tasks")
    }

    if (milestone.progress < 50) {
      recommendations.push("Break down milestone into smaller, manageable tasks")
      recommendations.push("Schedule daily check-ins with assignee")
    }

    if (!milestone.assigneeId) {
      recommendations.push("Assign clear ownership immediately")
    }

    recommendations.push("Review and update timeline based on current constraints")

    return recommendations
  }

  private calculatePerformanceMetrics(milestones: Milestone[]): PerformanceMetrics {
    const completedMilestones = this.getCompletedMilestones(milestones)
    const overdueMilestones = this.getOverdueMilestones(milestones)

    const onTimeDelivery =
      milestones.length > 0 ? ((milestones.length - overdueMilestones.length) / milestones.length) * 100 : 100

    const averageDelayDays =
      overdueMilestones.length > 0
        ? overdueMilestones.reduce((sum, m) => {
            const delay = Math.ceil((new Date().getTime() - new Date(m.dueDate).getTime()) / (1000 * 60 * 60 * 24))
            return sum + Math.max(0, delay)
          }, 0) / overdueMilestones.length
        : 0

    const avgProgress =
      milestones.length > 0 ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length : 0

    return {
      onTimeDelivery,
      averageDelayDays,
      productivityScore: Math.min(avgProgress * 1.2, 100), // Boost score for high progress
      qualityScore: onTimeDelivery, // Quality correlates with on-time delivery
      teamEfficiency: Math.max(0, 100 - averageDelayDays * 2), // Efficiency decreases with delays
      resourceUtilization: Math.min(avgProgress + completedMilestones.length * 10, 100),
    }
  }

  private generateTrendData(milestones: Milestone[]): TrendData[] {
    const periods = this.generatePeriods(6) // Last 6 months

    return periods.map((period) => {
      const periodMilestones = milestones.filter((m) => {
        const created = new Date(m.createdAt)
        return created >= period.start && created < period.end
      })

      const completed = periodMilestones.filter(
        (m) =>
          m.status === "completed" &&
          m.completedAt &&
          new Date(m.completedAt) >= period.start &&
          new Date(m.completedAt) < period.end,
      ).length

      const overdue = periodMilestones.filter(
        (m) => new Date(m.dueDate) < period.end && m.status !== "completed",
      ).length

      const completionRate = periodMilestones.length > 0 ? (completed / periodMilestones.length) * 100 : 0

      return {
        period: period.label,
        completed,
        created: periodMilestones.length,
        overdue,
        completionRate,
      }
    })
  }

  private generatePeriods(count: number): Array<{ start: Date; end: Date; label: string }> {
    const periods = []
    const now = new Date()

    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = start.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      periods.push({ start, end, label })
    }

    return periods
  }

  private assessRisks(milestones: (Milestone & { initiativeId: string })[]): RiskAssessment {
    const now = new Date()
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const upcomingMilestones = milestones.filter(
      (m) => new Date(m.dueDate) >= now && new Date(m.dueDate) <= nextMonth && m.status !== "completed",
    )

    const highRisk = upcomingMilestones.filter((m) => m.progress < 25).length
    const mediumRisk = upcomingMilestones.filter((m) => m.progress >= 25 && m.progress < 75).length
    const lowRisk = upcomingMilestones.filter((m) => m.progress >= 75).length

    const criticalDeadlines = milestones
      .filter((m) => {
        const daysUntilDue = Math.ceil((new Date(m.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDue <= 7 && daysUntilDue > 0 && m.status !== "completed"
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)

    return {
      highRiskMilestones: highRisk,
      mediumRiskMilestones: mediumRisk,
      lowRiskMilestones: lowRisk,
      criticalDeadlines,
      resourceConstraints: this.identifyResourceConstraints(milestones),
      dependencyRisks: this.identifyDependencyRisks(milestones),
    }
  }

  private identifyResourceConstraints(milestones: (Milestone & { initiativeId: string })[]): string[] {
    const constraints: string[] = []

    // Check for overallocation
    const assigneeWorkload = new Map<string, number>()
    milestones
      .filter((m) => m.assigneeId && m.status !== "completed")
      .forEach((m) => {
        const current = assigneeWorkload.get(m.assigneeId!) || 0
        assigneeWorkload.set(m.assigneeId!, current + 1)
      })

    Array.from(assigneeWorkload.entries()).forEach(([assigneeId, count]) => {
      if (count > 5) {
        constraints.push(`Assignee ${assigneeId} has ${count} active milestones - potential overallocation`)
      }
    })

    // Check for unassigned milestones
    const unassigned = milestones.filter((m) => !m.assigneeId && m.status !== "completed").length
    if (unassigned > 0) {
      constraints.push(`${unassigned} milestones lack assigned owners`)
    }

    return constraints
  }

  private identifyDependencyRisks(milestones: (Milestone & { initiativeId: string })[]): string[] {
    const risks: string[] = []

    // Group by initiative to identify potential dependencies
    const initiativeGroups = new Map<string, Milestone[]>()
    milestones.forEach((m) => {
      const group = initiativeGroups.get(m.initiativeId) || []
      group.push(m)
      initiativeGroups.set(m.initiativeId, group)
    })

    initiativeGroups.forEach((groupMilestones, initiativeId) => {
      const delayed = groupMilestones.filter((m) => m.status === "delayed").length
      const total = groupMilestones.length

      if (delayed > 0 && delayed / total > 0.3) {
        risks.push(`Initiative ${initiativeId} has ${delayed}/${total} delayed milestones - cascade risk`)
      }
    })

    return risks
  }
}
