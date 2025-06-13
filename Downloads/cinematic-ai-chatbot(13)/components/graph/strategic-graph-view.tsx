"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import * as d3 from "d3"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GraphData, GraphNode, GraphLink, GraphSettings } from "@/lib/graph-data-processor"

interface StrategicGraphViewProps {
  data: GraphData
  settings: GraphSettings
  onNodeClick?: (node: GraphNode) => void
}

export function StrategicGraphView({ data, settings, onNodeClick }: StrategicGraphViewProps) {
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

  // Optimize data for rendering
  const optimizedData = useMemo(() => {
    // Only render a subset of links for large graphs
    const isLargeGraph = data.nodes.length > 150
    let visibleLinks = data.links

    if (isLargeGraph && data.links.length > 500) {
      // Prioritize important connections
      visibleLinks = data.links
        .filter((link, i) => {
          if (i < 500) return true

          const sourceId = typeof link.source === "string" ? link.source : link.source.id
          const targetId = typeof link.target === "string" ? link.target : link.target.id

          const sourceNode = nodesById.get(sourceId)
          const targetNode = nodesById.get(targetId)

          // Keep hierarchical relationships as priority
          if (sourceNode && targetNode) {
            if (sourceNode.type === "initiative" || targetNode.type === "initiative") {
              return true
            }
          }

          return false
        })
        .slice(0, 1000) // Hard cap at 1000 links
    }

    return {
      nodes: data.nodes,
      links: visibleLinks,
    }
  }, [data.nodes, data.links, nodesById])

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

  // Main graph rendering effect
  useEffect(() => {
    if (!svgRef.current || !optimizedData.nodes.length) return

    const svg = d3.select(svgRef.current)
    const { width, height } = dimensions

    // Clear previous content
    svg.selectAll("*").remove()

    // Create main group for zoom/pan
    const g = svg.append("g").attr("class", "main-group")

    // Create simplified zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .interpolate(d3.interpolateZoom)
      .filter((event) => !(event.type === "mousedown" && event.button === 2))
      .on("zoom", (event) => {
        // Only update the transform if it has actually changed significantly
        const currentTransform = event.transform
        const prevTransform = previousTransform.current

        // Check if the transform has changed enough to warrant an update
        const transformChanged =
          Math.abs(currentTransform.x - prevTransform.x) > 1 ||
          Math.abs(currentTransform.y - prevTransform.y) > 1 ||
          Math.abs(currentTransform.k - prevTransform.k) > 0.01

        if (transformChanged) {
          g.attr("transform", currentTransform.toString())
          previousTransform.current = currentTransform
        }
      })

    zoomRef.current = zoom
    svg.call(zoom)

    // Apply previous transform if it exists
    if (previousTransform.current) {
      svg.call(zoom.transform, previousTransform.current)
    }

    // Create simplified force layout
    const simulation = d3
      .forceSimulation<GraphNode>(optimizedData.nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(optimizedData.links)
          .id((d) => d.id)
          .distance(settings.linkDistance)
          .strength(settings.linkForce),
      )
      .force("charge", d3.forceManyBody().strength(settings.repelForce))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.size + 2),
      )
      .alphaDecay(0.05) // Faster settling
      .velocityDecay(0.6) // More damping

    simulationRef.current = simulation

    // Simplified link rendering
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(optimizedData.links)
      .enter()
      .append("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", settings.lineThickness)
      .style("pointer-events", "none") // Disable pointer events on links for better performance

    // Simplified node rendering
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(optimizedData.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("data-id", (d) => d.id)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation()
        onNodeClick?.(d)
      })

    // Add node circles with minimal styling
    node
      .append("circle")
      .attr("r", (d) => d.size * 0.8)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)

    // Add minimal labels - only for important nodes
    node
      .filter((d) => d.type === "initiative" || d.type === "operation")
      .append("text")
      .attr("dy", (d) => d.size + 12)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .text((d) => (d.title.length > 12 ? d.title.substring(0, 12) + "..." : d.title))

    // Simplified simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x || 0)
        .attr("y1", (d) => (d.source as GraphNode).y || 0)
        .attr("x2", (d) => (d.target as GraphNode).x || 0)
        .attr("y2", (d) => (d.target as GraphNode).y || 0)

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [optimizedData, dimensions, settings, onNodeClick])

  // Simple zoom controls
  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5)
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1 / 1.5)
    }
  }, [])

  const handleReset = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)

      previousTransform.current = d3.zoomIdentity

      if (simulationRef.current) {
        simulationRef.current.alpha(1).restart()
      }
    }
  }, [])

  return (
    <Card className="relative w-full h-full overflow-hidden border-stable">
      <div ref={containerRef} className="w-full h-full graph-container">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full bg-gray-50 graph-svg gpu-accelerated"
        />

        {/* Minimal Control Panel */}
        <div className="absolute bottom-4 left-4 flex gap-2 graph-controls">
          <Button onClick={handleZoomIn} size="sm" variant="outline" className="stable-button">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleZoomOut} size="sm" variant="outline" className="stable-button">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline" className="stable-button">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Also export as LightweightGraphView for backward compatibility
export { StrategicGraphView as LightweightGraphView }
