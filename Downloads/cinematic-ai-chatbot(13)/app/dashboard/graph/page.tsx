"use client"

import { useState, useEffect } from "react"
import { StrategicGraphView } from "@/components/graph/strategic-graph-view"
import { LightweightGraphView } from "@/components/graph/lightweight-graph-view"
import { GraphSettingsPanel } from "@/components/graph/graph-settings-panel"
import { GraphStressTester } from "@/components/graph/graph-stress-tester"
import {
  GraphDataProcessor,
  type GraphSettings,
  defaultGraphSettings,
  type GraphNode,
  type GraphData,
} from "@/lib/graph-data-processor"
import { useStrategic } from "@/lib/strategic-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Target, CheckCircle, TestTube, Database, Layers } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function GraphViewPage() {
  const { initiatives, operations, tasks } = useStrategic()
  const [settings, setSettings] = useState<GraphSettings>(defaultGraphSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [stressTesterOpen, setStressTesterOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [isStressTestMode, setIsStressTestMode] = useState(false)
  const [stressTestData, setStressTestData] = useState<GraphData | null>(null)
  const [useLightweightMode, setUseLightweightMode] = useState(true)

  const processor = new GraphDataProcessor()

  // Extract milestones from initiatives
  const milestones = initiatives.flatMap((init) =>
    init.milestones.map((milestone) => ({
      ...milestone,
      initiativeId: init.id,
      initiativeTitle: init.title,
    })),
  )

  // Use either real data or stress test data
  const currentData =
    isStressTestMode && stressTestData
      ? stressTestData
      : processor.processData(initiatives, operations, milestones, tasks, settings)

  const filteredData = processor.filterData(currentData, settings)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("graph-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to load graph settings:", error)
      }
    }
    
    // Load lightweight mode preference
    const savedMode = localStorage.getItem("graph-lightweight-mode")
    if (savedMode) {
      setUseLightweightMode(savedMode === "true")
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("graph-settings", JSON.stringify(settings))
  }, [settings])
  
  // Save lightweight mode preference
  useEffect(() => {
    localStorage.setItem("graph-lightweight-mode", String(useLightweightMode))
  }, [useLightweightMode])

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }

  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node)
  }

  const handleStressTestData = (data: GraphData) => {
    setStressTestData(data)
    setIsStressTestMode(true)
    setStressTesterOpen(false)
  }

  const handleResetToRealData = () => {
    setIsStressTestMode(false)
    setStressTestData(null)
    setSelectedNode(null)
    setHoveredNode(null)
  }
  
  const toggleRenderingMode = () => {
    setUseLightweightMode(!useLightweightMode)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "Completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "delayed":
      case "At Risk":
        return "bg-red-100 text-red-800"
      case "not-started":
      case "Not Started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Graph View */}
      <div className="flex-1 p-6">
        <div className="h-full">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Strategic Graph View</h1>
              <p className="text-muted-foreground">
                Interactive visualization of your complete initiative structure
                {isStressTestMode && <Badge className="ml-2 bg-orange-100 text-orange-800">Stress Test Mode</Badge>}
                {useLightweightMode && <Badge className="ml-2 bg-green-100 text-green-800">Performance Mode</Badge>}
              </p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Label htmlFor="lightweight-mode" className="text-sm">Performance Mode</Label>
                <Switch 
                  id="lightweight-mode" 
                  checked={useLightweightMode} 
                  onCheckedChange={toggleRenderingMode}
                />
              </div>

              <Button onClick={() => setStressTesterOpen(!stressTesterOpen)} variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Stress Test
              </Button>

              {isStressTestMode && (
                <Button onClick={handleResetToRealData} variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Real Data
                </Button>
              )}
            </div>
          </div>

          <div className="h-[calc(100%-5rem)] graph-wrapper">
            {useLightweightMode ? (
              <div className="w-full h-full gpu-accelerated">
                <LightweightGraphView
                  data={filteredData}
                  settings={settings}
                  onNodeClick={handleNodeClick}
                />
              </div>
            ) : (
              <div className="w-full h-full gpu-accelerated">
                <StrategicGraphView
                  data={filteredData}
                  settings={settings}
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  useWebGL={isStressTestMode || filteredData.nodes.length > 200}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      <div className={`w-80 border-l bg-card p-4 overflow-y-auto panel-stable detail-panel ${!selectedNode ? 'hidden' : ''}`}>
        {selectedNode && (
          <Card className="border-stable">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                {selectedNode.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize">
                  {selectedNode.type}
                </Badge>
                <Badge className={getStatusColor(selectedNode.status || "")}>
                  {selectedNode.status}
                </Badge>
                {selectedNode.priority && (
                  <Badge className={getPriorityColor(selectedNode.priority)}>
                    {selectedNode.priority}
                  </Badge>
                )}
              </div>

              {selectedNode.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                </div>
              )}

              {selectedNode.progress !== undefined && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${selectedNode.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{selectedNode.progress || 0}%</span>
                  </div>
                </div>
              )}

              {selectedNode.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Due: {new Date(selectedNode.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {selectedNode.assignee && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Assigned to: {selectedNode.assignee}</span>
                </div>
              )}

              {selectedNode.parentId && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Parent: {selectedNode.parentId}</span>
                </div>
              )}

              {/* Connection Information */}
              <div>
                <h4 className="font-medium mb-2">Connections</h4>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Connected to{" "}
                    {
                      filteredData.links.filter((link) => {
                        const sourceId = typeof link.source === "string" ? link.source : link.source.id
                        const targetId = typeof link.target === "string" ? link.target : link.target.id
                        return sourceId === selectedNode.id || targetId === selectedNode.id
                      }).length
                    }{" "}
                    other nodes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stress Tester Panel */}
      {stressTesterOpen && (
        <div className="absolute top-20 right-4 z-40">
          <GraphStressTester onDataGenerated={handleStressTestData} onReset={handleResetToRealData} />
        </div>
      )}

      {/* Settings Panel */}
      <GraphSettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen(!settingsOpen)}
      />
    </div>
  )
}
