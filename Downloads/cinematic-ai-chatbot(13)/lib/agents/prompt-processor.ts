import type { AIAgent, StrategicContext, TeamMember, Task } from "@/lib/types"

interface PromptContext {
  strategicContext?: StrategicContext | null
  tasks?: Task[]
  teamMembers?: TeamMember[]
  additionalData?: Record<string, any>
}

export class PromptProcessor {
  static processPrompt(agent: AIAgent, context: PromptContext): string {
    let processedPrompt = agent.systemPromptTemplate

    // Replace template variables with actual context data
    const replacements: Record<string, string> = {
      "{{STRATEGIC_CONTEXT}}": this.formatStrategicContext(context.strategicContext),
      "{{CONTEXT_DATA}}": this.formatContextData(context),
      "{{TEAM_DATA}}": this.formatTeamData(context.teamMembers || []),
      "{{HISTORICAL_DATA}}": this.formatHistoricalData(context),
      "{{CONSTRAINTS}}": this.formatConstraints(context),
      "{{RESOURCES}}": this.formatResources(context),
      "{{CURRENT_TECH}}": this.formatTechnicalContext(context),
      "{{TECHNICAL_CONSTRAINTS}}": this.formatTechnicalConstraints(context),
      "{{PROCESS_DATA}}": this.formatProcessData(context),
      "{{RISK_TOLERANCE}}": this.formatRiskTolerance(context),
      "{{COMPLIANCE_REQS}}": this.formatComplianceRequirements(context),
      "{{COMPETITOR_DATA}}": this.formatCompetitorData(context),
      "{{MARKET_TRENDS}}": this.formatMarketTrends(context),
      "{{BUDGET_DATA}}": this.formatBudgetData(context),
      "{{FINANCIAL_TARGETS}}": this.formatFinancialTargets(context),
      "{{CULTURE_DATA}}": this.formatCultureData(context),
      "{{STAKEHOLDER_DATA}}": this.formatStakeholderData(context),
      "{{PERFORMANCE_TARGETS}}": this.formatPerformanceTargets(context),
    }

    // Apply replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedPrompt = processedPrompt.replace(new RegExp(placeholder, "g"), value)
    })

    return processedPrompt
  }

  private static formatStrategicContext(context?: StrategicContext | null): string {
    if (!context) return "No strategic context provided."

    return `
Strategic Item: ${context.title} (${context.type})
Status: ${context.status}
Progress: ${context.progress}%
Objectives: ${context.objectives?.map((obj) => `- ${obj.title}: ${obj.status}`).join("\n") || "None defined"}
KPIs: ${context.kpis?.map((kpi) => `- ${kpi.title}: ${kpi.current}/${kpi.target} ${kpi.unit || ""} (${kpi.status})`).join("\n") || "None defined"}
Milestones: ${context.milestones?.map((milestone) => `- ${milestone.title}: ${milestone.status} (Due: ${milestone.dueDate})`).join("\n") || "None defined"}
Risks: ${context.risks?.map((risk) => `- ${risk.title}: ${risk.impact}/${risk.probability}`).join("\n") || "None identified"}
`
  }

  private static formatContextData(context: PromptContext): string {
    const data = context.additionalData || {}
    return (
      Object.entries(data)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join("\n") || "No additional context data available."
    )
  }

  private static formatTeamData(teamMembers: TeamMember[]): string {
    if (teamMembers.length === 0) return "No team members assigned."

    return teamMembers.map((member) => `- ${member.name} (${member.role})`).join("\n")
  }

  private static formatHistoricalData(context: PromptContext): string {
    return context.additionalData?.historicalData || "No historical data available."
  }

  private static formatConstraints(context: PromptContext): string {
    return context.additionalData?.constraints || "No specific constraints identified."
  }

  private static formatResources(context: PromptContext): string {
    return context.additionalData?.resources || "Resource information not available."
  }

  private static formatTechnicalContext(context: PromptContext): string {
    return context.additionalData?.currentTech || "Current technical systems not documented."
  }

  private static formatTechnicalConstraints(context: PromptContext): string {
    return context.additionalData?.technicalConstraints || "No technical constraints specified."
  }

  private static formatProcessData(context: PromptContext): string {
    return context.additionalData?.processData || "Current process information not available."
  }

  private static formatRiskTolerance(context: PromptContext): string {
    return context.additionalData?.riskTolerance || "Risk tolerance not specified."
  }

  private static formatComplianceRequirements(context: PromptContext): string {
    return context.additionalData?.complianceReqs || "Compliance requirements not specified."
  }

  private static formatCompetitorData(context: PromptContext): string {
    return context.additionalData?.competitorData || "Competitor information not available."
  }

  private static formatMarketTrends(context: PromptContext): string {
    return context.additionalData?.marketTrends || "Market trend data not available."
  }

  private static formatBudgetData(context: PromptContext): string {
    return context.additionalData?.budgetData || "Budget information not available."
  }

  private static formatFinancialTargets(context: PromptContext): string {
    return context.additionalData?.financialTargets || "Financial targets not specified."
  }

  private static formatCultureData(context: PromptContext): string {
    return context.additionalData?.cultureData || "Organizational culture information not available."
  }

  private static formatStakeholderData(context: PromptContext): string {
    return context.additionalData?.stakeholderData || "Stakeholder information not available."
  }

  private static formatPerformanceTargets(context: PromptContext): string {
    return context.additionalData?.performanceTargets || "Performance targets not specified."
  }
}
