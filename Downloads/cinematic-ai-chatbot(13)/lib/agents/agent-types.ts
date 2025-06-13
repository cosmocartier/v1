export interface AIAgent {
  id: string
  name: string
  description: string
  category: "strategic" | "analytical" | "creative" | "technical"
  icon: string // Will be used for agent icons
  color: string
  capabilities: string[]
  systemPromptTemplate: string
  contextIntegration: "full" | "partial" | "minimal"
  maxTokens?: number
  temperature?: number
}

export type AgentCategory = "strategic" | "analytical" | "creative" | "technical"

export const AGENT_CATEGORIES: Record<AgentCategory, { label: string; description: string }> = {
  strategic: {
    label: "Strategic",
    description: "Long-term planning and strategic thinking",
  },
  analytical: {
    label: "Analytical",
    description: "Data analysis and insights",
  },
  creative: {
    label: "Creative",
    description: "Innovation and creative problem solving",
  },
  technical: {
    label: "Technical",
    description: "Technical implementation and solutions",
  },
}
