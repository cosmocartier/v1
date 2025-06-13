"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RotateCcw, Zap } from "lucide-react"
import type { GraphData, GraphNode, GraphLink } from "@/lib/graph-data-processor"

interface StressTesterProps {
  onDataGenerated: (data: GraphData) => void
  onReset: () => void
}

export function GraphStressTester({ onDataGenerated, onReset }: StressTesterProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [nodeCount, setNodeCount] = useState([100])
  const [connectionDensity, setConnectionDensity] = useState([0.3])
  const [lastGenerated, setLastGenerated] = useState<{ nodes: number; links: number } | null>(null)

  // Determine whether the target node is exactly one level below the source node
  const isHierarchicalConnection = (sourceType: string, targetType: string): boolean => {
    const hierarchy = ["initiative", "operation", "milestone", "task"]
    const sourceLevel = hierarchy.indexOf(sourceType)
    const targetLevel = hierarchy.indexOf(targetType)
    return sourceLevel < targetLevel && targetLevel - sourceLevel === 1
  }

  const generateStressTestData = async () => {
    setIsGenerating(true)

    // Simulate async generation for large datasets
    await new Promise((resolve) => setTimeout(resolve, 100))

    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const totalNodes = nodeCount[0]
    const density = connectionDensity[0]

    // Generate nodes with realistic distribution
    const nodeTypes = ["initiative", "operation", "milestone", "task"] as const
    const typeDistribution = [0.1, 0.2, 0.3, 0.4] // 10% initiatives, 20% operations, 30% milestones, 40% tasks

    for (let i = 0; i < totalNodes; i++) {
      const rand = Math.random()
      let type: (typeof nodeTypes)[number] = "task"
      let cumulative = 0

      for (let j = 0; j < typeDistribution.length; j++) {
        cumulative += typeDistribution[j]
        if (rand <= cumulative) {
          type = nodeTypes[j]
          break
        }
      }

      const colors = {
        initiative: "#8b5cf6",
        operation: "#3b82f6",
        milestone: "#10b981",
        task: "#64748b",
      }

      const sizes = {
        initiative: 25,
        operation: 20,
        milestone: 15,
        task: 10,
      }

      nodes.push({
        id: `stress-${type}-${i}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
        type,
        color: colors[type],
        size: sizes[type],
        progress: Math.floor(Math.random() * 101),
        status: ["completed", "in-progress", "not-started", "delayed"][Math.floor(Math.random() * 4)],
        priority: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
        description: `Generated ${type} for stress testing purposes`,
      })
    }

    // Generate connections based on hierarchy and density
    const maxConnections = Math.floor(totalNodes * density)
    const connectionCount = Math.min(maxConnections, totalNodes * 2) // Reasonable upper limit

    for (let i = 0; i < connectionCount; i++) {
      const sourceIndex = Math.floor(Math.random() * totalNodes)
      const targetIndex = Math.floor(Math.random() * totalNodes)

      if (sourceIndex !== targetIndex) {
        const source = nodes[sourceIndex]
        const target = nodes[targetIndex]

        // Prefer hierarchical connections
        const isHierarchical = isHierarchicalConnection(source.type, target.type)
        const connectionType = isHierarchical ? "contains" : Math.random() > 0.7 ? "depends" : "relates"

        // Avoid duplicate links
        const linkExists = links.some(
          (link) =>
            (link.source === source.id && link.target === target.id) ||
            (link.source === target.id && link.target === source.id),
        )

        if (!linkExists) {
          links.push({
            source: source.id,
            target: target.id,
            type: connectionType,
          })
        }
      }
    }

    setLastGenerated({ nodes: nodes.length, links: links.length })
    onDataGenerated({ nodes, links })
    setIsGenerating(false)
  }

  const handleReset = () => {
    setLastGenerated(null)
    onReset()
  }

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Stress Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Node Count: {nodeCount[0]}</Label>
          <Slider value={nodeCount} onValueChange={setNodeCount} min={10} max={500} step={10} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Light (10)</span>
            <span>Heavy (500)</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Connection Density: {(connectionDensity[0] * 100).toFixed(0)}%</Label>
          <Slider
            value={connectionDensity}
            onValueChange={setConnectionDensity}
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sparse (10%)</span>
            <span>Dense (100%)</span>
          </div>
        </div>

        {lastGenerated && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Last Generated:</div>
            <div className="flex gap-2">
              <Badge variant="outline">{lastGenerated.nodes} nodes</Badge>
              <Badge variant="outline">{lastGenerated.links} links</Badge>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={generateStressTestData} disabled={isGenerating} className="flex-1">
            {isGenerating ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isGenerating ? "Generating..." : "Generate"}
          </Button>

          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Performance Guide:</strong>
          </p>
          <p>• &lt;100 nodes: Excellent performance</p>
          <p>• 100-200 nodes: Good performance</p>
          <p>• 200-300 nodes: Fair performance</p>
          <p>• &gt;300 nodes: May experience lag</p>
        </div>
      </CardContent>
    </Card>
  )
}
