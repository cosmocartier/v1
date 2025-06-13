"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import * as d3 from "d3"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GraphData, GraphNode, GraphLink, GraphSettings } from "@/lib/graph-data-processor"

interface LightweightGraphViewProps {
  data: GraphData
  settings: GraphSettings
  onNodeClick?: (node: GraphNode) => void
}

export function LightweightGraphView({ data, settings, onNodeClick }: LightweightGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const previousTransform = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Cache node data for faster lookups
  const nodesById = useMemo(() => {
    const map = new Map<string, GraphNode>()
    data.nodes.forEach((node) => map.set(node.id, node))
    return map
  }, [data.nodes])

  // Optimize data for rendering - more aggressive optimization for lightweight version
  const optimizedData = useMemo(() => {
    // More aggressive filtering for lightweight version
    const maxNodes = 100
    const maxLinks = 200

    let visibleNodes = data.nodes
    let visibleLinks = data.links

    // If too many nodes, prioritize important ones
    if (data.nodes.length > maxNodes) {
      visibleNodes = data.nodes
        .sort((a, b) => {
          // Prioritize by type importance
          const typeOrder = { initiative: 0, operation: 1, milestone: 2, task: 3 }
          return (typeOrder[a.type as keyof typeof typeOrder] || 4) - (typeOrder[b.type as keyof typeof typeOrder] || 4)
        })
        .slice(0, maxNodes)
    }

    // Filter links to only include those between visible nodes
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id))
    visibleLinks = data.links
      .filter((link) => {
        const sourceId = typeof link.source === "string" ? link.source : link.source.id
        const targetId = typeof link.target === "string" ? link.target : link.target.id
        return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)
      })
      .slice(0, maxLinks)

    return {
      nodes: visibleNodes,
      links: visibleLinks,
    }
  }, [data.nodes, data.links])

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600,
        })
      }
    }

    updateDimensions()
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Lightweight graph rendering effect
  useEffect(() => {
    if (!svgRef.current || !optimizedData.nodes.length) return

    const svg = d3.select(svgRef.current)
    const { width, height } = dimensions

    // Clear previous content
    svg.selectAll("*").remove()

    // Create main group for zoom/pan
    const g = svg.append("g").attr("class", "main-group")

    // Simplified zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString())
        previousTransform.current = event.transform
      })

    zoomRef.current = zoom
    svg.call(zoom)

    // Apply previous transform if it exists
    if (previousTransform.current) {
      svg.call(zoom.transform, previousTransform.current)
    }

    // Lightweight force layout with faster settling
    const simulation = d3
      .forceSimulation<GraphNode>(optimizedData.nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(optimizedData.links)
          .id((d) => d.id)
          .distance(settings.linkDistance * 0.8) // Closer nodes for compact view
          .strength(settings.linkForce * 0.6),
      )
      .force("charge", d3.forceManyBody().strength(settings.repelForce * 0.5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.size + 1),
      )
      .alphaDecay(0.1) // Faster settling
      .velocityDecay(0.8) // More damping

    simulationRef.current = simulation

    // Minimal link rendering
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(optimizedData.links)
      .enter()
      .append("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1)
      .style("pointer-events", "none")

    // Minimal node rendering
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(optimizedData.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.size * 0.6) // Smaller nodes for lightweight view
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation()
        onNodeClick?.(d)
      })

    // Simplified simulation tick with throttling
    let tickCount = 0
    simulation.on("tick", () => {
      tickCount++
      // Only update every 2nd tick for better performance
      if (tickCount % 2 === 0) {
        link
          .attr("x1", (d) => (d.source as GraphNode).x || 0)
          .attr("y1", (d) => (d.source as GraphNode).y || 0)
          .attr("x2", (d) => (d.target as GraphNode).x || 0)
          .attr("y2", (d) => (d.target as GraphNode).y || 0)

        node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0)
      }
    })

    return () => {
      simulation.stop()
    }
  }, [optimizedData, dimensions, settings, onNodeClick])

  // Simple zoom controls
  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, 1.5)
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(200)
        .call(zoomRef.current.scaleBy, 1 / 1.5)
    }
  }, [])

  const handleReset = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity)

      previousTransform.current = d3.zoomIdentity

      if (simulationRef.current) {
        simulationRef.current.alpha(0.8).restart()
      }
    }
  }, [])

  return (
    <Card className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full bg-gray-50" />

        {/* Compact Control Panel */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <Button onClick={handleZoomIn} size="sm" variant="outline">
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button onClick={handleZoomOut} size="sm" variant="outline">
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {/* Performance indicator */}
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          {optimizedData.nodes.length} nodes, {optimizedData.links.length} links
        </div>
      </div>
    </Card>
  )
}
