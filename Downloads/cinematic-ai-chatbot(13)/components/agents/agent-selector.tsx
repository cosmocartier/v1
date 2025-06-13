"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, Brain, BarChart3, Wrench } from "lucide-react"
import { getAllAgents } from "@/lib/agents/agent-registry"
import { AGENT_CATEGORIES, type AgentCategory, type AIAgent } from "@/lib/agents/agent-types"
import { cn } from "@/lib/utils"

interface AgentSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (agent: AIAgent) => void
  selectedAgentId?: string
}

const categoryIcons: Record<AgentCategory, any> = {
  strategic: Brain,
  analytical: BarChart3,
  creative: Sparkles,
  technical: Wrench,
}

export function AgentSelector({ open, onClose, onSelect, selectedAgentId }: AgentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | "all">("all")

  const allAgents = getAllAgents()

  const filteredAgents = allAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleAgentSelect = (agent: AIAgent) => {
    onSelect(agent)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Select AI Agent
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search and Filters */}
          <div className="px-6 py-4 border-b bg-muted/30">
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents by name, description, or capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as AgentCategory | "all")}
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                {Object.entries(AGENT_CATEGORIES).map(([key, category]) => {
                  const Icon = categoryIcons[key as AgentCategory]
                  return (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Agent Grid */}
          <ScrollArea className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredAgents.map((agent) => {
                  const CategoryIcon = categoryIcons[agent.category]
                  const isSelected = selectedAgentId === agent.id

                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className={cn(
                          "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50",
                        )}
                        onClick={() => handleAgentSelect(agent)}
                      >
                        {/* Agent Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: agent.color }}
                          >
                            {/* Placeholder for agent icon - will be replaced with actual icons */}
                            <CategoryIcon className="h-6 w-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg leading-tight">{agent.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                          </div>

                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>

                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {AGENT_CATEGORIES[agent.category].label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.contextIntegration} context
                          </Badge>
                        </div>

                        {/* Capabilities */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Key Capabilities</h4>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.capabilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Selection Overlay */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-primary/10 rounded-lg pointer-events-none"
                          />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No agents found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or category filter.</p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/30">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {filteredAgents.length} of {allAgents.length} agents available
              </p>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
