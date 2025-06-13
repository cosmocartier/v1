import type { Operation } from "./strategic-context"

export interface OperationPrediction {
  estimatedCompletionDate: string
  confidenceLevel: "High" | "Medium" | "Low"
  riskFactors: string[]
  recommendations: string[]
  progressVelocity: number // Progress per day
  daysRemaining: number
  probabilityOnTime: number // 0-100
  similarOperations: string[] // IDs of similar past operations
  lastUpdated: string
}

export interface PredictionFactors {
  priority: number
  complexity: number
  ownerPerformance: number
  progressPattern: number
  timeInCurrentStatus: number
  dependencyRisk: number
}

export class PredictionEngine {
  private historicalData: Operation[] = []
  private ownerPerformanceCache: Map<string, number> = new Map()

  constructor() {
    // Initialize with default performance scores
  }

  /**
   * Train the model with historical operation data
   */
  trainModel(operations: Operation[]): void {
    this.historicalData = operations.filter((op) => op.status === "Completed")
    this.calculateOwnerPerformance()
  }

  /**
   * Generate a prediction for an operation
   */
  async predict(operation: Operation, allOperations: Operation[]): Promise<OperationPrediction | null> {
    if (operation.status === "Completed") {
      return null // No prediction needed for completed operations
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    const factors = this.calculatePredictionFactors(operation, allOperations)
    const similarOps = this.findSimilarOperations(operation, allOperations)

    const baseEstimate = this.calculateBaseEstimate(operation, factors)
    const adjustedEstimate = this.applyFactorAdjustments(baseEstimate, factors)

    const progressVelocity = this.calculateProgressVelocity(operation)
    const daysRemaining = this.calculateDaysRemaining(operation, progressVelocity)
    const estimatedCompletionDate = this.calculateCompletionDate(daysRemaining)

    const confidenceLevel = this.calculateConfidenceLevel(factors, similarOps.length)
    const probabilityOnTime = this.calculateOnTimeProbability(operation, daysRemaining)

    const riskFactors = this.identifyRiskFactors(operation, factors)
    const recommendations = this.generateRecommendations(operation, factors, riskFactors)

    return {
      estimatedCompletionDate,
      confidenceLevel,
      riskFactors,
      recommendations,
      progressVelocity,
      daysRemaining,
      probabilityOnTime,
      similarOperations: similarOps.map((op) => op.id),
      lastUpdated: new Date().toISOString(),
    }
  }

  private calculatePredictionFactors(operation: Operation, allOperations: Operation[]): PredictionFactors {
    const priorityScore = this.getPriorityScore(operation.priority)
    const complexityScore = this.getComplexityScore(operation.complexity || "Medium")
    const ownerPerformance = this.ownerPerformanceCache.get(operation.owner) || 0.7
    const progressPattern = this.analyzeProgressPattern(operation)
    const timeInCurrentStatus = this.calculateTimeInCurrentStatus(operation)
    const dependencyRisk = this.calculateDependencyRisk(operation, allOperations)

    return {
      priority: priorityScore,
      complexity: complexityScore,
      ownerPerformance,
      progressPattern,
      timeInCurrentStatus,
      dependencyRisk,
    }
  }

  private getPriorityScore(priority: string): number {
    const scores = { Critical: 1.0, High: 0.8, Medium: 0.6, Low: 0.4 }
    return scores[priority as keyof typeof scores] || 0.6
  }

  private getComplexityScore(complexity: string): number {
    const scores = { High: 0.3, Medium: 0.6, Low: 0.9 }
    return scores[complexity as keyof typeof scores] || 0.6
  }

  private calculateOwnerPerformance(): void {
    const ownerStats = new Map<string, { completed: number; onTime: number; avgDays: number }>()

    this.historicalData.forEach((op) => {
      if (!ownerStats.has(op.owner)) {
        ownerStats.set(op.owner, { completed: 0, onTime: 0, avgDays: 0 })
      }

      const stats = ownerStats.get(op.owner)!
      stats.completed++

      if (op.completedDate && op.dueDate) {
        const completed = new Date(op.completedDate)
        const due = new Date(op.dueDate)
        if (completed <= due) {
          stats.onTime++
        }

        const created = new Date(op.createdAt)
        const daysToComplete = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        stats.avgDays = (stats.avgDays * (stats.completed - 1) + daysToComplete) / stats.completed
      }
    })

    // Calculate performance score (0-1) based on on-time completion rate
    ownerStats.forEach((stats, owner) => {
      const onTimeRate = stats.onTime / stats.completed
      const performanceScore = Math.min(1.0, Math.max(0.3, onTimeRate))
      this.ownerPerformanceCache.set(owner, performanceScore)
    })
  }

  private analyzeProgressPattern(operation: Operation): number {
    if (operation.progressHistory.length < 2) return 0.5

    const recentProgress = operation.progressHistory.slice(-3)
    let velocitySum = 0
    let velocityCount = 0

    for (let i = 1; i < recentProgress.length; i++) {
      const current = recentProgress[i]
      const previous = recentProgress[i - 1]
      const timeDiff = new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

      if (daysDiff > 0) {
        const progressDiff = current.progress - previous.progress
        const velocity = progressDiff / daysDiff
        velocitySum += velocity
        velocityCount++
      }
    }

    const avgVelocity = velocityCount > 0 ? velocitySum / velocityCount : 0
    return Math.min(1.0, Math.max(0.1, avgVelocity / 10)) // Normalize to 0-1
  }

  private calculateTimeInCurrentStatus(operation: Operation): number {
    if (operation.statusHistory.length === 0) return 0

    const lastStatusChange = operation.statusHistory[operation.statusHistory.length - 1]
    const daysSinceChange = Math.ceil(
      (new Date().getTime() - new Date(lastStatusChange.timestamp).getTime()) / (1000 * 60 * 60 * 24),
    )

    // Normalize: 0-7 days = 0-1 score
    return Math.min(1.0, daysSinceChange / 7)
  }

  private calculateDependencyRisk(operation: Operation, allOperations: Operation[]): number {
    if (!operation.dependencies || operation.dependencies.length === 0) return 0

    const dependentOps = allOperations.filter((op) =>
      operation.dependencies?.some((dep) => op.title.toLowerCase().includes(dep.toLowerCase())),
    )

    const blockedDependencies = dependentOps.filter((op) => op.status === "Blocked" || op.status === "On Hold").length

    return dependentOps.length > 0 ? blockedDependencies / dependentOps.length : 0
  }

  private findSimilarOperations(operation: Operation, allOperations: Operation[]): Operation[] {
    return allOperations
      .filter(
        (op) =>
          op.id !== operation.id &&
          op.status === "Completed" &&
          op.priority === operation.priority &&
          (op.complexity || "Medium") === (operation.complexity || "Medium") &&
          op.owner === operation.owner,
      )
      .slice(0, 5) // Return top 5 similar operations
  }

  private calculateBaseEstimate(operation: Operation, factors: PredictionFactors): number {
    // Base estimate in days based on complexity and priority
    const complexityDays = { Low: 3, Medium: 7, High: 14 }
    const complexity = operation.complexity || "Medium"
    const baseDays = complexityDays[complexity as keyof typeof complexityDays]

    // Adjust based on priority
    const priorityMultiplier = { Critical: 0.7, High: 0.8, Medium: 1.0, Low: 1.3 }
    const multiplier = priorityMultiplier[operation.priority as keyof typeof priorityMultiplier]

    return baseDays * multiplier
  }

  private applyFactorAdjustments(baseEstimate: number, factors: PredictionFactors): number {
    let adjusted = baseEstimate

    // Owner performance adjustment
    adjusted *= 2 - factors.ownerPerformance // Better performers reduce time

    // Progress pattern adjustment
    if (factors.progressPattern > 0.7) {
      adjusted *= 0.8 // Good progress pattern reduces time
    } else if (factors.progressPattern < 0.3) {
      adjusted *= 1.3 // Poor progress pattern increases time
    }

    // Dependency risk adjustment
    adjusted *= 1 + factors.dependencyRisk * 0.5

    // Time in current status adjustment
    if (factors.timeInCurrentStatus > 0.7) {
      adjusted *= 1.2 // Long time in status increases estimate
    }

    return Math.max(1, Math.round(adjusted))
  }

  private calculateProgressVelocity(operation: Operation): number {
    if (operation.progressHistory.length < 2) return 0

    const recent = operation.progressHistory.slice(-2)
    const timeDiff = new Date(recent[1].timestamp).getTime() - new Date(recent[0].timestamp).getTime()
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

    if (daysDiff === 0) return 0

    const progressDiff = recent[1].progress - recent[0].progress
    return Math.max(0, progressDiff / daysDiff)
  }

  private calculateDaysRemaining(operation: Operation, velocity: number): number {
    const remainingProgress = 100 - operation.progress

    if (velocity <= 0) {
      // If no velocity, use average velocity from similar operations
      const avgVelocity = this.getAverageVelocityForSimilarOps(operation)
      return remainingProgress / Math.max(0.5, avgVelocity)
    }

    return Math.ceil(remainingProgress / velocity)
  }

  private getAverageVelocityForSimilarOps(operation: Operation): number {
    const similar = this.historicalData.filter(
      (op) => op.priority === operation.priority && (op.complexity || "Medium") === (operation.complexity || "Medium"),
    )

    if (similar.length === 0) return 2 // Default 2% progress per day

    const avgDays =
      similar.reduce((sum, op) => {
        const created = new Date(op.createdAt)
        const completed = new Date(op.completedDate || op.updatedAt)
        return sum + Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      }, 0) / similar.length

    return 100 / Math.max(1, avgDays) // Convert to progress per day
  }

  private calculateCompletionDate(daysRemaining: number): string {
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysRemaining)
    return completionDate.toISOString()
  }

  private calculateConfidenceLevel(factors: PredictionFactors, similarOpsCount: number): "High" | "Medium" | "Low" {
    let confidenceScore = 0

    // Owner performance contributes to confidence
    confidenceScore += factors.ownerPerformance * 0.3

    // Progress pattern contributes to confidence
    confidenceScore += Math.abs(factors.progressPattern - 0.5) * 0.4

    // Similar operations data contributes to confidence
    confidenceScore += Math.min(1, similarOpsCount / 3) * 0.3

    if (confidenceScore > 0.7) return "High"
    if (confidenceScore > 0.4) return "Medium"
    return "Low"
  }

  private calculateOnTimeProbability(operation: Operation, daysRemaining: number): number {
    const dueDate = new Date(operation.dueDate)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysRemaining <= daysUntilDue) {
      return Math.min(95, 60 + (daysUntilDue - daysRemaining) * 5)
    } else {
      const daysLate = daysRemaining - daysUntilDue
      return Math.max(5, 60 - daysLate * 10)
    }
  }

  private identifyRiskFactors(operation: Operation, factors: PredictionFactors): string[] {
    const risks: string[] = []

    if (factors.ownerPerformance < 0.5) {
      risks.push("Owner has history of delays")
    }

    if (factors.progressPattern < 0.3) {
      risks.push("Slow progress velocity")
    }

    if (factors.timeInCurrentStatus > 0.7) {
      risks.push("Operation stalled in current status")
    }

    if (factors.dependencyRisk > 0.5) {
      risks.push("High dependency risk")
    }

    if (operation.progress < 20 && this.getDaysUntilDue(operation) < 7) {
      risks.push("Low progress with approaching deadline")
    }

    if (operation.status === "Blocked") {
      risks.push("Currently blocked")
    }

    return risks
  }

  private generateRecommendations(operation: Operation, factors: PredictionFactors, risks: string[]): string[] {
    const recommendations: string[] = []

    if (risks.includes("Slow progress velocity")) {
      recommendations.push("Consider breaking down into smaller tasks")
      recommendations.push("Schedule daily check-ins with owner")
    }

    if (risks.includes("High dependency risk")) {
      recommendations.push("Review and resolve blocking dependencies")
      recommendations.push("Consider parallel work streams")
    }

    if (risks.includes("Operation stalled in current status")) {
      recommendations.push("Schedule status review meeting")
      recommendations.push("Identify and remove blockers")
    }

    if (factors.ownerPerformance < 0.5) {
      recommendations.push("Provide additional support or resources")
      recommendations.push("Consider reassigning if critical")
    }

    if (operation.priority === "Critical" && factors.progressPattern < 0.5) {
      recommendations.push("Escalate to leadership")
      recommendations.push("Allocate additional resources")
    }

    return recommendations
  }

  private getDaysUntilDue(operation: Operation): number {
    const dueDate = new Date(operation.dueDate)
    const today = new Date()
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }
}
