export interface PerformanceMetrics {
  fps: number
  nodeCount: number
  linkCount: number
  renderTime: number
  simulationTime: number
  memoryUsage: number
  interactionLatency: number
}

export class GraphPerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private renderTimes: number[] = []
  private simulationTimes: number[] = []
  private interactionTimes: number[] = []
  private maxSamples = 60 // Keep last 60 samples for averaging

  startFrame(): number {
    return performance.now()
  }

  endFrame(startTime: number, type: "render" | "simulation" | "interaction"): void {
    const duration = performance.now() - startTime

    switch (type) {
      case "render":
        this.renderTimes.push(duration)
        if (this.renderTimes.length > this.maxSamples) {
          this.renderTimes.shift()
        }
        break
      case "simulation":
        this.simulationTimes.push(duration)
        if (this.simulationTimes.length > this.maxSamples) {
          this.simulationTimes.shift()
        }
        break
      case "interaction":
        this.interactionTimes.push(duration)
        if (this.interactionTimes.length > this.maxSamples) {
          this.interactionTimes.shift()
        }
        break
    }

    this.frameCount++
  }

  getMetrics(nodeCount: number, linkCount: number): PerformanceMetrics {
    const now = performance.now()
    const timeDiff = now - this.lastTime
    const fps = timeDiff > 0 ? (this.frameCount * 1000) / timeDiff : 0

    // Reset counters
    this.frameCount = 0
    this.lastTime = now

    return {
      fps: Math.round(fps),
      nodeCount,
      linkCount,
      renderTime: this.average(this.renderTimes),
      simulationTime: this.average(this.simulationTimes),
      memoryUsage: this.getMemoryUsage(),
      interactionLatency: this.average(this.interactionTimes),
    }
  }

  private average(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  getPerformanceLevel(nodeCount: number): "excellent" | "good" | "fair" | "poor" {
    if (nodeCount < 50) return "excellent"
    if (nodeCount < 150) return "good"
    if (nodeCount < 300) return "fair"
    return "poor"
  }

  getOptimizationSuggestions(metrics: PerformanceMetrics): string[] {
    const suggestions: string[] = []

    if (metrics.fps < 30) {
      suggestions.push("Consider reducing node count or disabling some node types")
    }

    if (metrics.renderTime > 16) {
      suggestions.push("Rendering is slow - try reducing visual effects or node size")
    }

    if (metrics.simulationTime > 10) {
      suggestions.push("Physics simulation is heavy - reduce force strengths or link distance")
    }

    if (metrics.interactionLatency > 50) {
      suggestions.push("Interactions are laggy - consider simplifying the graph structure")
    }

    if (metrics.nodeCount > 200) {
      suggestions.push("Large graph detected - enable performance mode for better experience")
    }

    return suggestions
  }
}
