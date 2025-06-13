"use client"

import { useEffect, useState, useRef } from "react"
import type { Operation } from "@/lib/operations-context"
import { Settings, ZoomIn, ZoomOut, Move } from "lucide-react"

// Dynamically import to avoid SSR issues with canvas
import type ForceGraph2D from "react-force-graph-2d"

interface GraphViewProps {
  operation: Operation
}

export function OperationGraphView({ operation }: GraphViewProps) {
  const [ForceGraph, setForceGraph] = useState<typeof ForceGraph2D | null>(null)
  const fgRef = useRef<any>()

  useEffect(() => {
    import("react-force-graph-2d").then((module) => setForceGraph(() => module.default))
  }, [])

  if (!ForceGraph) {
    return <div className="flex items-center justify-center h-full">Loading Graph...</div>
  }

  const graphData = {
    nodes: [{ id: operation.id, label: operation.title, type: "operation" }, ...operation.nodes],
    links:
      operation.nodes.length > 0 ? [{ source: operation.id, target: operation.nodes[0].id }, ...operation.links] : [],
  }

  const getNodeColor = (node: any) => {
    switch (node.type) {
      case "operation":
        return "#8b5cf6" // violet
      case "goal":
        return "#22c55e" // green
      case "task":
        return "#3b82f6" // blue
      case "milestone":
        return "#eab308" // yellow
      case "risk":
        return "#ef4444" // red
      default:
        return "#64748b" // slate
    }
  }

  return (
    <div className="w-full h-full bg-muted/30 rounded-lg relative overflow-hidden border border-border">
      <ForceGraph
        ref={fgRef}
        graphData={graphData}
        backgroundColor="hsl(var(--background))"
        nodeId="id"
        nodeLabel="label"
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => "hsl(var(--primary))"}
        linkColor={() => "hsl(var(--border))"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label as string
          const fontSize = 12 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.4)

          // Node circle
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, 5 / globalScale, 0, 2 * Math.PI, false)
          ctx.fillStyle = getNodeColor(node)
          ctx.fill()

          // Node label
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = "hsl(var(--foreground))"
          ctx.fillText(label, node.x!, node.y! + 12 / globalScale)
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, 5, 0, 2 * Math.PI, false)
          ctx.fill()
        }}
        onNodeDragEnd={(node) => {
          node.fx = node.x
          node.fy = node.y
        }}
      />
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <button
          className="p-2 bg-background/80 border border-border rounded-md hover:bg-muted"
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.2)}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          className="p-2 bg-background/80 border border-border rounded-md hover:bg-muted"
          onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 0.8)}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          className="p-2 bg-background/80 border border-border rounded-md hover:bg-muted"
          onClick={() => fgRef.current?.centerAt(0, 0, 1000)}
        >
          <Move className="w-4 h-4" />
        </button>
        <button className="p-2 bg-background/80 border border-border rounded-md hover:bg-muted">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
