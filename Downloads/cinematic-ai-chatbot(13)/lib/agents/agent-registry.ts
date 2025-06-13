import type { AIAgent } from "./agent-types"
import { strategicAdvisorPrompt } from "./prompts/strategic-advisor"
import { dataAnalystPrompt } from "./prompts/data-analyst"
import { innovationCatalystPrompt } from "./prompts/innovation-catalyst"
import { technicalArchitectPrompt } from "./prompts/technical-architect"
import { operationsOptimizerPrompt } from "./prompts/operations-optimizer"
import { riskAssessorPrompt } from "./prompts/risk-assessor"
import { marketResearcherPrompt } from "./prompts/market-researcher"
import { financialAdvisorPrompt } from "./prompts/financial-advisor"
import { changeManagerPrompt } from "./prompts/change-manager"
import { performanceCoachPrompt } from "./prompts/performance-coach"

export const AI_AGENTS: Record<string, AIAgent> = {
  "strategic-advisor": {
    id: "strategic-advisor",
    name: "Strategic Advisor",
    description: "High-level strategic planning and business intelligence",
    category: "strategic",
    icon: "brain-circuit", // Placeholder for icon
    color: "#3b82f6",
    capabilities: [
      "Strategic Planning",
      "Market Analysis",
      "Risk Assessment",
      "Stakeholder Alignment",
      "Vision Development",
    ],
    systemPromptTemplate: strategicAdvisorPrompt,
    contextIntegration: "full",
    temperature: 0.3,
    maxTokens: 2000,
  },
  "data-analyst": {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Quantitative analysis and data-driven insights",
    category: "analytical",
    icon: "chart-bar",
    color: "#10b981",
    capabilities: [
      "Statistical Analysis",
      "Trend Identification",
      "Performance Metrics",
      "Data Visualization",
      "Predictive Modeling",
    ],
    systemPromptTemplate: dataAnalystPrompt,
    contextIntegration: "full",
    temperature: 0.2,
    maxTokens: 1800,
  },
  "innovation-catalyst": {
    id: "innovation-catalyst",
    name: "Innovation Catalyst",
    description: "Creative problem-solving and breakthrough thinking",
    category: "creative",
    icon: "lightbulb",
    color: "#f59e0b",
    capabilities: [
      "Creative Ideation",
      "Design Thinking",
      "Innovation Frameworks",
      "Technology Integration",
      "Disruptive Strategy",
    ],
    systemPromptTemplate: innovationCatalystPrompt,
    contextIntegration: "partial",
    temperature: 0.8,
    maxTokens: 2200,
  },
  "technical-architect": {
    id: "technical-architect",
    name: "Technical Architect",
    description: "System design and technical implementation",
    category: "technical",
    icon: "cpu",
    color: "#8b5cf6",
    capabilities: [
      "System Architecture",
      "Technology Stack",
      "Scalability Planning",
      "Integration Design",
      "Technical Risk Assessment",
    ],
    systemPromptTemplate: technicalArchitectPrompt,
    contextIntegration: "full",
    temperature: 0.3,
    maxTokens: 2000,
  },
  "operations-optimizer": {
    id: "operations-optimizer",
    name: "Operations Optimizer",
    description: "Process improvement and operational excellence",
    category: "analytical",
    icon: "settings",
    color: "#06b6d4",
    capabilities: [
      "Process Optimization",
      "Workflow Design",
      "Resource Allocation",
      "Quality Management",
      "Continuous Improvement",
    ],
    systemPromptTemplate: operationsOptimizerPrompt,
    contextIntegration: "full",
    temperature: 0.4,
    maxTokens: 1900,
  },
  "risk-assessor": {
    id: "risk-assessor",
    name: "Risk Assessor",
    description: "Comprehensive risk analysis and mitigation planning",
    category: "analytical",
    icon: "shield-alert",
    color: "#ef4444",
    capabilities: [
      "Risk Identification",
      "Impact Assessment",
      "Mitigation Planning",
      "Contingency Planning",
      "Compliance Analysis",
    ],
    systemPromptTemplate: riskAssessorPrompt,
    contextIntegration: "full",
    temperature: 0.2,
    maxTokens: 1800,
  },
  "market-researcher": {
    id: "market-researcher",
    name: "Market Researcher",
    description: "Market analysis and competitive intelligence",
    category: "analytical",
    icon: "trending-up",
    color: "#84cc16",
    capabilities: [
      "Market Analysis",
      "Competitive Intelligence",
      "Customer Insights",
      "Opportunity Identification",
      "Industry Benchmarking",
    ],
    systemPromptTemplate: marketResearcherPrompt,
    contextIntegration: "partial",
    temperature: 0.4,
    maxTokens: 1900,
  },
  "financial-advisor": {
    id: "financial-advisor",
    name: "Financial Advisor",
    description: "Financial analysis and investment strategy",
    category: "analytical",
    icon: "dollar-sign",
    color: "#22c55e",
    capabilities: ["Financial Modeling", "ROI Analysis", "Budget Planning", "Risk Assessment", "Capital Allocation"],
    systemPromptTemplate: financialAdvisorPrompt,
    contextIntegration: "full",
    temperature: 0.3,
    maxTokens: 1800,
  },
  "change-manager": {
    id: "change-manager",
    name: "Change Manager",
    description: "Organizational change and transformation leadership",
    category: "strategic",
    icon: "users",
    color: "#ec4899",
    capabilities: [
      "Change Strategy",
      "Stakeholder Engagement",
      "Training Planning",
      "Resistance Management",
      "Cultural Transformation",
    ],
    systemPromptTemplate: changeManagerPrompt,
    contextIntegration: "full",
    temperature: 0.5,
    maxTokens: 2000,
  },
  "performance-coach": {
    id: "performance-coach",
    name: "Performance Coach",
    description: "Team performance optimization and leadership development",
    category: "strategic",
    icon: "target",
    color: "#f97316",
    capabilities: [
      "Performance Analysis",
      "Team Dynamics",
      "Leadership Development",
      "Goal Setting",
      "Motivation Strategies",
    ],
    systemPromptTemplate: performanceCoachPrompt,
    contextIntegration: "full",
    temperature: 0.6,
    maxTokens: 2000,
  },
}

export function getAgentById(agentId: string): AIAgent | undefined {
  return AI_AGENTS[agentId]
}

export function getAgentsByCategory(category: string): AIAgent[] {
  return Object.values(AI_AGENTS).filter((agent) => agent.category === category)
}

export function getAllAgents(): AIAgent[] {
  return Object.values(AI_AGENTS)
}
