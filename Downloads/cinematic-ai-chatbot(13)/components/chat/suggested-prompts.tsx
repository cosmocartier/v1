"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AIAgent } from "@/lib/types"

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void
  strategicItems: any[]
  agent?: AIAgent
  className?: string
}

export function SuggestedPrompts({ onPromptClick, strategicItems, agent, className }: SuggestedPromptsProps) {
  const [prompts, setPrompts] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate prompts based on context and agent
  useEffect(() => {
    generatePrompts()
  }, [strategicItems, agent])

  const generatePrompts = () => {
    const basePrompts = ["Give me an overview", "What am I missing?", "What should I focus on next?"]

    const contextualPrompts: string[] = []

    // Add agent-specific prompts
    if (agent) {
      switch (agent.category) {
        case "strategic":
          contextualPrompts.push("What are the key strategic risks?", "How can we improve alignment?")
          break
        case "analytical":
          contextualPrompts.push("Analyze the current performance", "What patterns do you see in the data?")
          break
        case "creative":
          contextualPrompts.push("Generate innovative solutions", "How might we approach this differently?")
          break
        case "technical":
          contextualPrompts.push(
            "What technical challenges should we anticipate?",
            "How can we optimize the implementation?",
          )
          break
      }
    }

    // Add context-specific prompts
    const hasInitiatives = strategicItems.some((item) => item.type === "initiative")
    const hasOperations = strategicItems.some((item) => item.type === "operation")
    const hasMilestones = strategicItems.some((item) => item.type === "milestone")
    const hasTasks = strategicItems.some((item) => item.type === "task")
    const hasMemories = strategicItems.some((item) => item.type === "memory")

    if (hasInitiatives) {
      contextualPrompts.push("What's the progress on these initiatives?", "How do these initiatives align?")
    }

    if (hasOperations) {
      contextualPrompts.push("What are the operational bottlenecks?", "How can we optimize these operations?")
    }

    if (hasMilestones) {
      contextualPrompts.push("Are we on track to meet these milestones?", "What dependencies exist between milestones?")
    }

    if (hasTasks) {
      contextualPrompts.push("What's the status of these tasks?", "How should we prioritize these tasks?")
    }

    if (hasMemories) {
      contextualPrompts.push("Summarize these memories", "What insights can you draw from these memories?")
    }

    // Combine and shuffle
    const allPrompts = [...basePrompts, ...contextualPrompts]
    const shuffled = allPrompts.sort(() => 0.5 - Math.random())

    // Take 5-8 prompts depending on how many we have
    const count = Math.min(Math.max(5, shuffled.length), 8)
    setPrompts(shuffled.slice(0, count))
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    generatePrompts()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Suggested prompts</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          <span className="sr-only">Refresh prompts</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {prompts.map((prompt, index) => (
          <motion.div
            key={`${prompt}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between text-left font-normal h-auto py-2"
              onClick={() => onPromptClick(prompt)}
            >
              <span className="truncate">{prompt}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2 flex-shrink-0" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
