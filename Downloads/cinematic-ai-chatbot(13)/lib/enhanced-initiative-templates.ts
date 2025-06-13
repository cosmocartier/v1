import type { Initiative, Operation, Task } from "./strategic-context"

export interface EnhancedMilestone {
  title: string
  description: string
  dueDate: string // relative to initiative start (e.g., "+30 days", "+3 months")
  status: "not-started" | "in-progress" | "completed" | "delayed"
  progress: number
  dependencies?: string[] // references to other milestone titles
  assigneeRole?: string // role instead of specific person
  deliverables: string[]
  acceptanceCriteria: string[]
}

export interface EnhancedOperation {
  title: string
  deliverable: string
  description: string
  status: "Not Started" | "In Progress" | "Blocked" | "Completed" | "On Hold"
  priority: "Low" | "Medium" | "High" | "Critical"
  dueDate: string // relative to initiative start
  dependencies?: string[]
  ownerRole: string
  estimatedHours?: number
  complexity: "Low" | "Medium" | "High"
  resources: string[]
  risks: Array<{
    title: string
    description: string
    impact: "low" | "medium" | "high"
    probability: "low" | "medium" | "high"
    mitigationPlan: string
  }>
  tasks: EnhancedTask[]
}

export interface EnhancedTask {
  title: string
  description: string
  priority: "Low" | "Medium" | "High" | "Critical"
  estimatedHours?: number
  dueDate: string // relative to operation start
  assigneeRole?: string
  dependencies?: string[]
  tags: string[]
  acceptanceCriteria: string[]
}

export interface EnhancedKPI {
  name: string
  description: string
  target: string
  currentValue: string
  unit: string
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly"
  owner: string
  formula?: string
}

export interface EnhancedTeamMember {
  name: string
  role: string
  responsibilities: string[]
  skills: string[]
  availability: string
  contactInfo?: string
}

export interface EnhancedInitiativeTemplate {
  id: string
  name: string
  category: string
  subcategory: string
  department: string[]
  businessSize: string[]
  industry: string[]
  timeframe: string
  complexity: "Low" | "Medium" | "High"
  tags: string[]
  description: string

  // Enhanced template structure
  template: {
    title: string
    desiredOutcome: string
    successMetric: string
    priority: "Low" | "Medium" | "High" | "Critical"
    description: string
    strategicAlignment: string
    visibility: "Public" | "Private" | "Team"
    estimatedDuration: string // in days
    estimatedBudget?: string

    // Pre-defined structure
    milestones: EnhancedMilestone[]
    operations: EnhancedOperation[]
    kpis: EnhancedKPI[]
    teamRoles: EnhancedTeamMember[]

    // Guidance and prompts
    setupGuide: {
      overview: string
      keyConsiderations: string[]
      successFactors: string[]
      commonPitfalls: string[]
      customizationTips: string[]
    }

    // Customization options
    customizationOptions: {
      adjustableParameters: Array<{
        name: string
        description: string
        type: "text" | "number" | "select" | "date" | "boolean"
        options?: string[]
        defaultValue: any
      }>
      optionalSections: Array<{
        name: string
        description: string
        enabled: boolean
      }>
    }
  }
}

export const enhancedInitiativeTemplates: EnhancedInitiativeTemplate[] = [
  {
    id: "market-expansion-enhanced",
    name: "Market Expansion Initiative",
    category: "Growth",
    subcategory: "Market Development",
    department: ["Sales", "Marketing", "Strategy", "Product"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Technology", "Retail", "Manufacturing", "Services"],
    timeframe: "6-12 months",
    complexity: "High",
    tags: ["expansion", "revenue growth", "market research", "go-to-market"],
    description: "Comprehensive market expansion initiative with structured approach to entering new markets",

    template: {
      title: "Expand into [Target Market/Region]",
      desiredOutcome:
        "Successfully establish market presence in [Target Market] with sustainable revenue growth and positive unit economics",
      successMetric: "Achieve $[X] revenue and [Y]% market share within [Z] months of launch",
      priority: "High",
      description:
        "This comprehensive initiative focuses on strategic market expansion through systematic market research, product adaptation, go-to-market strategy development, and execution.",
      strategicAlignment: "Growth pillar - expanding addressable market and revenue diversification",
      visibility: "Public",
      estimatedDuration: "270", // 9 months
      estimatedBudget: "$250,000 - $500,000",

      milestones: [
        {
          title: "Market Research & Validation Complete",
          description:
            "Comprehensive analysis of target market including size, competition, customer needs, and regulatory requirements",
          dueDate: "+45 days",
          status: "not-started",
          progress: 0,
          assigneeRole: "Market Research Lead",
          deliverables: [
            "Market size and opportunity assessment",
            "Competitive landscape analysis",
            "Customer persona definitions",
            "Regulatory compliance requirements",
            "Market entry feasibility report",
          ],
          acceptanceCriteria: [
            "Market opportunity quantified with TAM/SAM/SOM analysis",
            "At least 5 key competitors analyzed",
            "3-5 customer personas validated through interviews",
            "All regulatory requirements documented",
            "Go/no-go recommendation with supporting data",
          ],
        },
        {
          title: "Product-Market Fit Validation",
          description:
            "Validate product offering meets target market needs through pilot programs and customer feedback",
          dueDate: "+90 days",
          status: "not-started",
          progress: 0,
          dependencies: ["Market Research & Validation Complete"],
          assigneeRole: "Product Manager",
          deliverables: [
            "Product adaptation requirements",
            "Pilot program results",
            "Customer feedback analysis",
            "Product-market fit assessment",
            "Feature prioritization roadmap",
          ],
          acceptanceCriteria: [
            "Pilot program with at least 10 target customers",
            "Product-market fit score above 40%",
            "Clear product adaptation plan",
            "Customer acquisition cost validated",
            "Revenue model proven",
          ],
        },
        {
          title: "Go-to-Market Strategy Finalized",
          description: "Complete go-to-market strategy including pricing, positioning, channels, and launch plan",
          dueDate: "+135 days",
          status: "not-started",
          progress: 0,
          dependencies: ["Product-Market Fit Validation"],
          assigneeRole: "Marketing Director",
          deliverables: [
            "Pricing strategy and model",
            "Brand positioning and messaging",
            "Channel partner agreements",
            "Marketing campaign plan",
            "Sales enablement materials",
          ],
          acceptanceCriteria: [
            "Pricing strategy validated with target customers",
            "Brand messaging tested and optimized",
            "At least 2 channel partners secured",
            "Marketing budget allocated and approved",
            "Sales team trained and ready",
          ],
        },
        {
          title: "Market Launch Executed",
          description: "Official market launch with full marketing campaign and sales activation",
          dueDate: "+180 days",
          status: "not-started",
          progress: 0,
          dependencies: ["Go-to-Market Strategy Finalized"],
          assigneeRole: "Launch Manager",
          deliverables: [
            "Launch event execution",
            "Marketing campaign activation",
            "Sales pipeline establishment",
            "Customer onboarding process",
            "Performance tracking dashboard",
          ],
          acceptanceCriteria: [
            "Launch event with 100+ attendees",
            "Marketing campaign reaching 10,000+ prospects",
            "Sales pipeline with 50+ qualified leads",
            "First 10 customers onboarded",
            "All KPIs tracking and reporting",
          ],
        },
        {
          title: "Initial Revenue Targets Achieved",
          description: "Achieve initial revenue and customer acquisition targets demonstrating market traction",
          dueDate: "+270 days",
          status: "not-started",
          progress: 0,
          dependencies: ["Market Launch Executed"],
          assigneeRole: "Sales Director",
          deliverables: [
            "Revenue target achievement",
            "Customer acquisition metrics",
            "Market share analysis",
            "Profitability assessment",
            "Scale-up recommendations",
          ],
          acceptanceCriteria: [
            "Monthly recurring revenue of $50,000+",
            "100+ active customers",
            "Customer acquisition cost under target",
            "Positive unit economics demonstrated",
            "Clear path to profitability established",
          ],
        },
      ],

      operations: [
        {
          title: "Market Research & Analysis",
          deliverable: "Comprehensive market intelligence report with go/no-go recommendation",
          description:
            "Conduct thorough market research including competitive analysis, customer interviews, and regulatory assessment",
          status: "Not Started",
          priority: "Critical",
          dueDate: "+45 days",
          ownerRole: "Market Research Lead",
          estimatedHours: 160,
          complexity: "High",
          resources: ["Market research tools", "Survey platform", "Interview budget", "Industry reports"],
          risks: [
            {
              title: "Insufficient market data availability",
              description: "Target market may lack comprehensive data sources",
              impact: "medium",
              probability: "medium",
              mitigationPlan: "Engage local market research firms and conduct primary research",
            },
            {
              title: "Regulatory complexity underestimated",
              description: "Regulatory requirements may be more complex than anticipated",
              impact: "high",
              probability: "low",
              mitigationPlan: "Engage legal counsel early and build buffer time for compliance",
            },
          ],
          tasks: [
            {
              title: "Define research methodology and scope",
              description: "Establish research framework, questions, and success criteria",
              priority: "High",
              estimatedHours: 8,
              dueDate: "+5 days",
              assigneeRole: "Market Research Lead",
              dependencies: [],
              tags: ["planning", "methodology"],
              acceptanceCriteria: [
                "Research plan approved by stakeholders",
                "Budget allocated and approved",
                "Timeline established with key milestones",
              ],
            },
            {
              title: "Conduct competitive landscape analysis",
              description: "Analyze direct and indirect competitors, their strategies, and market positioning",
              priority: "High",
              estimatedHours: 24,
              dueDate: "+15 days",
              assigneeRole: "Business Analyst",
              dependencies: ["Define research methodology and scope"],
              tags: ["competitive-analysis", "research"],
              acceptanceCriteria: [
                "At least 10 competitors analyzed",
                "SWOT analysis completed for top 5 competitors",
                "Competitive positioning map created",
              ],
            },
            {
              title: "Execute customer interviews and surveys",
              description: "Conduct interviews with potential customers to validate assumptions and gather insights",
              priority: "High",
              estimatedHours: 40,
              dueDate: "+30 days",
              assigneeRole: "UX Researcher",
              dependencies: ["Define research methodology and scope"],
              tags: ["customer-research", "interviews"],
              acceptanceCriteria: [
                "25+ customer interviews completed",
                "Survey responses from 200+ prospects",
                "Customer personas validated and refined",
              ],
            },
          ],
        },
        {
          title: "Product Adaptation & Development",
          deliverable: "Market-ready product with localized features and compliance",
          description:
            "Adapt existing product for target market including localization, compliance, and feature development",
          status: "Not Started",
          priority: "High",
          dueDate: "+120 days",
          dependencies: ["Market Research & Analysis"],
          ownerRole: "Product Manager",
          estimatedHours: 320,
          complexity: "High",
          resources: ["Development team", "Design resources", "Compliance consultants", "Testing infrastructure"],
          risks: [
            {
              title: "Technical complexity higher than estimated",
              description: "Product adaptation may require more development effort than planned",
              impact: "high",
              probability: "medium",
              mitigationPlan: "Conduct technical feasibility assessment early and maintain development buffer",
            },
          ],
          tasks: [
            {
              title: "Define product requirements for target market",
              description: "Document specific product requirements based on market research findings",
              priority: "Critical",
              estimatedHours: 16,
              dueDate: "+50 days",
              assigneeRole: "Product Manager",
              dependencies: [],
              tags: ["requirements", "product-definition"],
              acceptanceCriteria: [
                "Product requirements document completed",
                "Technical feasibility assessed",
                "Resource requirements estimated",
              ],
            },
          ],
        },
      ],

      kpis: [
        {
          name: "Market Share",
          description: "Percentage of target market captured",
          target: "5%",
          currentValue: "0%",
          unit: "%",
          frequency: "Monthly",
          owner: "Sales Director",
          formula: "Our revenue / Total addressable market revenue",
        },
        {
          name: "Customer Acquisition Cost (CAC)",
          description: "Cost to acquire each new customer",
          target: "$500",
          currentValue: "$0",
          unit: "$",
          frequency: "Monthly",
          owner: "Marketing Director",
          formula: "Total marketing + sales costs / Number of new customers",
        },
        {
          name: "Monthly Recurring Revenue (MRR)",
          description: "Predictable monthly revenue from target market",
          target: "$100,000",
          currentValue: "$0",
          unit: "$",
          frequency: "Monthly",
          owner: "Sales Director",
        },
        {
          name: "Customer Lifetime Value (CLV)",
          description: "Total value of customer relationship",
          target: "$5,000",
          currentValue: "$0",
          unit: "$",
          frequency: "Quarterly",
          owner: "Customer Success Manager",
          formula: "Average revenue per customer * Customer lifespan",
        },
      ],

      teamRoles: [
        {
          name: "Initiative Lead",
          role: "Project Manager",
          responsibilities: [
            "Overall initiative coordination and management",
            "Stakeholder communication and reporting",
            "Risk management and issue resolution",
            "Timeline and budget management",
          ],
          skills: ["Project management", "Stakeholder management", "Risk assessment", "Communication"],
          availability: "Full-time",
        },
        {
          name: "Market Research Lead",
          role: "Market Research Manager",
          responsibilities: [
            "Market analysis and competitive intelligence",
            "Customer research and persona development",
            "Market sizing and opportunity assessment",
            "Regulatory compliance research",
          ],
          skills: ["Market research", "Data analysis", "Customer insights", "Competitive analysis"],
          availability: "Full-time for first 3 months",
        },
        {
          name: "Product Manager",
          role: "Senior Product Manager",
          responsibilities: [
            "Product adaptation strategy",
            "Feature prioritization and roadmap",
            "Product-market fit validation",
            "Technical requirements definition",
          ],
          skills: ["Product management", "Market analysis", "Technical requirements", "User experience"],
          availability: "Full-time",
        },
      ],

      setupGuide: {
        overview:
          "This template provides a comprehensive framework for market expansion initiatives. It includes structured phases from research through launch and initial traction, with built-in risk management and success metrics.",
        keyConsiderations: [
          "Ensure adequate budget allocation for market research and product adaptation",
          "Consider regulatory requirements early in the planning process",
          "Build strong local partnerships for market entry",
          "Plan for cultural and language localization needs",
          "Establish clear success criteria and exit conditions",
        ],
        successFactors: [
          "Thorough market research and validation before significant investment",
          "Strong product-market fit demonstrated through pilot programs",
          "Effective go-to-market strategy with proven channels",
          "Experienced team with relevant market knowledge",
          "Adequate funding and resource allocation",
        ],
        commonPitfalls: [
          "Underestimating regulatory complexity and compliance costs",
          "Insufficient market research leading to poor product-market fit",
          "Overestimating market size or underestimating competition",
          "Inadequate localization and cultural adaptation",
          "Poor channel partner selection and management",
        ],
        customizationTips: [
          "Adjust timeline based on market complexity and regulatory requirements",
          "Customize team roles based on internal capabilities and external needs",
          "Modify KPIs based on business model and market characteristics",
          "Add industry-specific milestones and compliance requirements",
          "Consider phased approach for large or complex markets",
        ],
      },

      customizationOptions: {
        adjustableParameters: [
          {
            name: "targetMarket",
            description: "Primary target market or region",
            type: "text",
            defaultValue: "[Target Market/Region]",
          },
          {
            name: "revenueTarget",
            description: "Target revenue in first year",
            type: "text",
            defaultValue: "$1,000,000",
          },
          {
            name: "timeframe",
            description: "Initiative duration in months",
            type: "number",
            defaultValue: 9,
          },
          {
            name: "budget",
            description: "Total initiative budget",
            type: "text",
            defaultValue: "$500,000",
          },
          {
            name: "teamSize",
            description: "Core team size",
            type: "number",
            defaultValue: 5,
          },
        ],
        optionalSections: [
          {
            name: "regulatoryCompliance",
            description: "Include detailed regulatory compliance tracking",
            enabled: true,
          },
          {
            name: "partnerManagement",
            description: "Include channel partner management operations",
            enabled: true,
          },
          {
            name: "brandLocalization",
            description: "Include brand and marketing localization tasks",
            enabled: false,
          },
        ],
      },
    },
  },

  // Additional enhanced templates would follow the same structure...
  {
    id: "digital-transformation-enhanced",
    name: "Digital Transformation Initiative",
    category: "Technology",
    subcategory: "Digital Innovation",
    department: ["IT", "Operations", "Strategy"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Traditional Retail", "Manufacturing", "Healthcare", "Financial Services"],
    timeframe: "12-18 months",
    complexity: "High",
    tags: ["digitization", "automation", "cloud migration", "data analytics"],
    description:
      "Comprehensive digital transformation initiative with structured approach to modernizing business processes",

    template: {
      title: "Digital Transformation of [Business Area]",
      desiredOutcome:
        "Successfully modernize and digitize [Business Area] to improve efficiency, data quality, and user experience while reducing operational costs",
      successMetric: "Reduce process time by 40%, improve data quality by 60%, and achieve 90% user satisfaction",
      priority: "High",
      description:
        "This comprehensive initiative focuses on digital transformation through systematic process analysis, technology selection, implementation, and change management.",
      strategicAlignment: "Digital transformation pillar - modernizing operations and improving competitive advantage",
      visibility: "Public",
      estimatedDuration: "450", // 15 months
      estimatedBudget: "$750,000 - $1,500,000",

      milestones: [
        {
          title: "Current State Assessment Complete",
          description: "Comprehensive analysis of existing processes, systems, and capabilities",
          dueDate: "+60 days",
          status: "not-started",
          progress: 0,
          assigneeRole: "Business Analyst Lead",
          deliverables: [
            "Process mapping and documentation",
            "Technology inventory and assessment",
            "Gap analysis report",
            "Stakeholder impact assessment",
            "Digital readiness evaluation",
          ],
          acceptanceCriteria: [
            "All critical processes mapped and documented",
            "Technology stack fully inventoried",
            "Gaps identified and prioritized",
            "Stakeholder interviews completed",
            "Baseline metrics established",
          ],
        },
        {
          title: "Future State Design Approved",
          description: "Design and approval of target digital architecture and processes",
          dueDate: "+120 days",
          status: "not-started",
          progress: 0,
          dependencies: ["Current State Assessment Complete"],
          assigneeRole: "Solution Architect",
          deliverables: [
            "Target architecture design",
            "Process redesign documentation",
            "Technology selection report",
            "Implementation roadmap",
            "Change management plan",
          ],
          acceptanceCriteria: [
            "Architecture approved by technical committee",
            "Process designs validated by business users",
            "Technology vendors selected",
            "Implementation plan approved",
            "Change management strategy finalized",
          ],
        },
      ],

      operations: [
        {
          title: "Process Analysis & Documentation",
          deliverable: "Complete current state process documentation and analysis",
          description: "Analyze and document existing business processes to identify digitization opportunities",
          status: "Not Started",
          priority: "Critical",
          dueDate: "+60 days",
          ownerRole: "Business Process Analyst",
          estimatedHours: 200,
          complexity: "Medium",
          resources: ["Process mapping tools", "Interview time", "Documentation platform"],
          risks: [
            {
              title: "Process complexity underestimated",
              description: "Business processes may be more complex than initially assessed",
              impact: "medium",
              probability: "medium",
              mitigationPlan: "Allocate additional time for complex process analysis and engage subject matter experts",
            },
          ],
          tasks: [
            {
              title: "Identify key business processes",
              description: "Catalog and prioritize all business processes for analysis",
              priority: "High",
              estimatedHours: 16,
              dueDate: "+10 days",
              assigneeRole: "Business Analyst",
              dependencies: [],
              tags: ["process-mapping", "analysis"],
              acceptanceCriteria: [
                "Process inventory completed",
                "Processes prioritized by impact",
                "Stakeholders identified for each process",
              ],
            },
          ],
        },
      ],

      kpis: [
        {
          name: "Process Efficiency Gain",
          description: "Percentage improvement in process completion time",
          target: "40%",
          currentValue: "0%",
          unit: "%",
          frequency: "Monthly",
          owner: "Operations Manager",
        },
        {
          name: "Data Quality Score",
          description: "Overall data quality and accuracy measurement",
          target: "95%",
          currentValue: "60%",
          unit: "%",
          frequency: "Weekly",
          owner: "Data Manager",
        },
      ],

      teamRoles: [
        {
          name: "Transformation Lead",
          role: "Digital Transformation Manager",
          responsibilities: [
            "Overall initiative leadership and coordination",
            "Stakeholder management and communication",
            "Change management oversight",
            "Risk and issue management",
          ],
          skills: ["Digital transformation", "Change management", "Project management", "Stakeholder management"],
          availability: "Full-time",
        },
      ],

      setupGuide: {
        overview:
          "This template provides a structured approach to digital transformation with emphasis on thorough analysis, stakeholder engagement, and change management.",
        keyConsiderations: [
          "Ensure strong executive sponsorship and change management",
          "Plan for significant user training and adoption support",
          "Consider data migration complexity and requirements",
          "Build in adequate testing and validation phases",
          "Plan for business continuity during transition",
        ],
        successFactors: [
          "Strong leadership commitment and change management",
          "Comprehensive stakeholder engagement and communication",
          "Thorough current state analysis and future state design",
          "Adequate training and support for end users",
          "Phased implementation with regular validation",
        ],
        commonPitfalls: [
          "Underestimating change management and user adoption challenges",
          "Insufficient data migration planning and testing",
          "Poor stakeholder communication and engagement",
          "Inadequate training and support resources",
          "Trying to transform too much too quickly",
        ],
        customizationTips: [
          "Adjust scope based on organizational readiness and capacity",
          "Customize training programs for different user groups",
          "Consider industry-specific compliance and regulatory requirements",
          "Plan phased rollout based on business criticality",
          "Include specific metrics relevant to your business model",
        ],
      },

      customizationOptions: {
        adjustableParameters: [
          {
            name: "businessArea",
            description: "Primary business area for transformation",
            type: "text",
            defaultValue: "[Business Area]",
          },
          {
            name: "userCount",
            description: "Number of users affected by transformation",
            type: "number",
            defaultValue: 100,
          },
          {
            name: "systemCount",
            description: "Number of systems to be transformed",
            type: "number",
            defaultValue: 5,
          },
        ],
        optionalSections: [
          {
            name: "cloudMigration",
            description: "Include cloud migration specific tasks",
            enabled: true,
          },
          {
            name: "dataAnalytics",
            description: "Include advanced analytics implementation",
            enabled: false,
          },
        ],
      },
    },
  },
]

// Utility functions for template processing
export function calculateRelativeDate(baseDate: Date, relativeDateString: string): string {
  const match = relativeDateString.match(/^\+(\d+)\s*(days?|months?|years?)$/)
  if (!match) return baseDate.toISOString().split("T")[0]

  const amount = Number.parseInt(match[1])
  const unit = match[2]

  const resultDate = new Date(baseDate)

  switch (unit) {
    case "day":
    case "days":
      resultDate.setDate(resultDate.getDate() + amount)
      break
    case "month":
    case "months":
      resultDate.setMonth(resultDate.getMonth() + amount)
      break
    case "year":
    case "years":
      resultDate.setFullYear(resultDate.getFullYear() + amount)
      break
  }

  return resultDate.toISOString().split("T")[0]
}

export function processTemplateVariables(text: string, variables: Record<string, string>): string {
  let processedText = text
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, "gi")
    processedText = processedText.replace(regex, value)
  })
  return processedText
}

export function generateInitiativeFromTemplate(
  template: EnhancedInitiativeTemplate,
  customizations: {
    variables: Record<string, string>
    startDate: Date
    selectedOptions: Record<string, boolean>
    teamAssignments: Record<string, string>
  },
): {
  initiative: Omit<Initiative, "id" | "createdAt" | "updatedAt" | "progress" | "status">
  operations: Array<
    Omit<Operation, "id" | "createdAt" | "updatedAt" | "statusHistory" | "progressHistory" | "risks" | "teamMembers">
  >
  tasks: Array<Omit<Task, "id" | "createdAt" | "updatedAt" | "status">>
} {
  const { variables, startDate, selectedOptions, teamAssignments } = customizations

  // Process template variables in all text fields
  const processText = (text: string) => processTemplateVariables(text, variables)

  // Generate milestones
  const milestones = template.template.milestones.map((milestone) => ({
    id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: processText(milestone.title),
    description: processText(milestone.description || ""),
    dueDate: calculateRelativeDate(startDate, milestone.dueDate),
    status: milestone.status,
    progress: milestone.progress,
    assigneeId: teamAssignments[milestone.assigneeRole || ""] || undefined,
    createdAt: new Date().toISOString(),
  }))

  // Generate KPIs
  const kpis = template.template.kpis.map((kpi) => ({
    id: `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: processText(kpi.name),
    description: processText(kpi.description),
    target: processText(kpi.target),
    currentValue: kpi.currentValue,
    unit: kpi.unit,
    frequency: kpi.frequency,
    owner: teamAssignments[kpi.owner] || kpi.owner,
    updatedAt: new Date().toISOString(),
  }))

  // Generate team members
  const teamMembers = template.template.teamRoles.map((role) => ({
    id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: teamAssignments[role.role] || role.name,
    role: role.role,
    email: `${role.name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
    responsibilities: role.responsibilities,
    skills: role.skills,
    status: "active" as const,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  }))

  // Generate initiative
  const initiative = {
    title: processText(template.template.title),
    desiredOutcome: processText(template.template.desiredOutcome),
    successMetric: processText(template.template.successMetric),
    owner: teamAssignments["Initiative Lead"] || "Unassigned",
    priority: template.template.priority,
    dueDate: calculateRelativeDate(startDate, `+${template.template.estimatedDuration} days`),
    description: processText(template.template.description),
    strategicAlignment: processText(template.template.strategicAlignment),
    visibility: template.template.visibility,
    milestones,
    kpis,
    teamMembers,
  }

  // Generate operations
  const operations = template.template.operations.map((operation) => ({
    title: processText(operation.title),
    initiativeIds: [], // Will be set when initiative is created
    deliverable: processText(operation.deliverable),
    owner: teamAssignments[operation.ownerRole] || operation.ownerRole,
    status: operation.status,
    priority: operation.priority,
    dueDate: calculateRelativeDate(startDate, operation.dueDate),
    description: processText(operation.description),
    dependencies: operation.dependencies || [],
    resources: operation.resources,
    progress: 0,
    estimatedHours: operation.estimatedHours,
    complexity: operation.complexity,
  }))

  // Generate tasks
  const tasks = template.template.operations.flatMap((operation) =>
    operation.tasks.map((task) => ({
      title: processText(task.title),
      description: processText(task.description),
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      dueDate: calculateRelativeDate(startDate, task.dueDate),
      assigneeId: teamAssignments[task.assigneeRole || ""] || undefined,
      assigneeName: teamAssignments[task.assigneeRole || ""] || undefined,
      tags: task.tags,
      strategicItemType: "operation" as const,
      strategicItemId: "", // Will be set when operation is created
      creatorId: "system",
    })),
  )

  return { initiative, operations, tasks }
}
