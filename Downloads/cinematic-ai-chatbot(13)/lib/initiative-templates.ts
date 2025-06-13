import type { Initiative } from "./strategic-context"

export interface InitiativeTemplate {
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
  template: Omit<Initiative, "id" | "createdAt" | "updatedAt" | "progress">
}

export const initiativeTemplates: InitiativeTemplate[] = [
  {
    id: "market-expansion",
    name: "Market Expansion",
    category: "Growth",
    subcategory: "Market Development",
    department: ["Sales", "Marketing", "Strategy"],
    businessSize: ["Startup", "SMB", "Enterprise"],
    industry: ["Technology", "Retail", "Manufacturing", "Services"],
    timeframe: "6-12 months",
    complexity: "High",
    tags: ["expansion", "revenue growth", "market research", "go-to-market"],
    description: "Expand into new geographic markets or customer segments",
    template: {
      title: "Expand into [Market/Segment]",
      desiredOutcome: "Successfully enter and establish presence in [Market/Segment] with positive unit economics",
      successMetric: "Achieve $X revenue and Y% market share within Z months",
      owner: "",
      priority: "High",
      dueDate: "",
      description:
        "This initiative focuses on expanding our product/service into a new market or customer segment to drive growth and diversify revenue streams.",
      strategicAlignment: "Growth pillar of company strategy",
      visibility: "Team",
      milestones: [
        "Complete market research and validation",
        "Develop market entry strategy",
        "Launch initial offering",
        "Achieve break-even in new market",
      ],
    },
  },
  {
    id: "customer-retention",
    name: "Customer Retention Improvement",
    category: "Customer Success",
    subcategory: "Retention & Loyalty",
    department: ["Customer Success", "Product", "Marketing"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["SaaS", "E-commerce", "Financial Services", "Healthcare"],
    timeframe: "3-6 months",
    complexity: "Medium",
    tags: ["churn reduction", "customer satisfaction", "loyalty", "analytics"],
    description: "Increase customer retention rates through improved experience",
    template: {
      title: "Improve Customer Retention Rate",
      desiredOutcome:
        "Significantly reduce customer churn through improved product experience and customer success processes",
      successMetric: "Increase retention rate from X% to Y% within Z months",
      owner: "",
      priority: "High",
      dueDate: "",
      description:
        "This initiative aims to identify and address key factors contributing to customer churn, and implement strategies to improve overall retention.",
      strategicAlignment: "Customer success pillar of company strategy",
      visibility: "Team",
      milestones: [
        "Complete churn analysis and identify key drivers",
        "Develop retention improvement strategy",
        "Implement key product/service enhancements",
        "Roll out new customer success processes",
      ],
    },
  },
  {
    id: "product-launch",
    name: "New Product Launch",
    category: "Product",
    subcategory: "Product Development",
    department: ["Product", "Engineering", "Marketing", "Sales"],
    businessSize: ["Startup", "SMB", "Enterprise"],
    industry: ["Technology", "Consumer Goods", "Healthcare", "Automotive"],
    timeframe: "3-9 months",
    complexity: "High",
    tags: ["product launch", "go-to-market", "innovation", "market validation"],
    description: "Successfully launch a new product to market",
    template: {
      title: "Launch [Product Name]",
      desiredOutcome: "Successfully bring [Product Name] to market with strong adoption and positive customer feedback",
      successMetric: "X new customers and $Y revenue within Z months of launch",
      owner: "",
      priority: "Critical",
      dueDate: "",
      description:
        "This initiative covers all aspects of bringing our new product to market, from final development through marketing and sales enablement.",
      strategicAlignment: "Innovation pillar of company strategy",
      visibility: "Public",
      milestones: [
        "Complete product development and testing",
        "Prepare go-to-market materials and sales enablement",
        "Execute launch event/announcement",
        "Achieve initial sales targets",
      ],
    },
  },
  {
    id: "operational-efficiency",
    name: "Operational Efficiency",
    category: "Operations",
    subcategory: "Process Optimization",
    department: ["Operations", "Finance", "HR"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Manufacturing", "Logistics", "Healthcare", "Financial Services"],
    timeframe: "3-6 months",
    complexity: "Medium",
    tags: ["cost reduction", "process improvement", "automation", "lean"],
    description: "Improve operational efficiency and reduce costs",
    template: {
      title: "Optimize [Process/Department] Efficiency",
      desiredOutcome: "Streamline operations and reduce costs while maintaining or improving quality",
      successMetric: "Reduce operational costs by X% while maintaining Y quality benchmark",
      owner: "",
      priority: "Medium",
      dueDate: "",
      description:
        "This initiative focuses on identifying and eliminating inefficiencies in our operations to reduce costs and improve overall performance.",
      strategicAlignment: "Operational excellence pillar of company strategy",
      visibility: "Team",
      milestones: [
        "Complete process audit and identify improvement opportunities",
        "Develop optimization strategy",
        "Implement process changes",
        "Measure and report on efficiency gains",
      ],
    },
  },
  {
    id: "digital-transformation",
    name: "Digital Transformation",
    category: "Technology",
    subcategory: "Digital Innovation",
    department: ["IT", "Operations", "Strategy"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Traditional Retail", "Manufacturing", "Healthcare", "Financial Services"],
    timeframe: "6-18 months",
    complexity: "High",
    tags: ["digitization", "automation", "cloud migration", "data analytics"],
    description: "Transform key business processes through digital technology",
    template: {
      title: "Digital Transformation of [Business Area]",
      desiredOutcome:
        "Successfully modernize and digitize [Business Area] to improve efficiency, data quality, and user experience",
      successMetric: "Reduce process time by X%, improve data quality by Y%, and achieve Z% user satisfaction",
      owner: "",
      priority: "High",
      dueDate: "",
      description:
        "This initiative aims to leverage digital technologies to transform our business processes, improving efficiency and creating new value.",
      strategicAlignment: "Digital transformation pillar of company strategy",
      visibility: "Team",
      milestones: [
        "Complete current state assessment and future state design",
        "Select and implement technology solutions",
        "Migrate processes and data",
        "Train users and measure adoption",
      ],
    },
  },
  {
    id: "talent-development",
    name: "Talent Development",
    category: "People",
    subcategory: "Learning & Development",
    department: ["HR", "Learning & Development", "Management"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Technology", "Consulting", "Healthcare", "Financial Services"],
    timeframe: "6-12 months",
    complexity: "Medium",
    tags: ["skills development", "training", "career growth", "performance"],
    description: "Develop internal talent and improve employee capabilities",
    template: {
      title: "Develop [Skill/Capability] Across the Organization",
      desiredOutcome: "Build critical skills and capabilities to support business growth and innovation",
      successMetric: "X% of employees proficient in target skills, Y% improvement in related performance metrics",
      owner: "",
      priority: "Medium",
      dueDate: "",
      description:
        "This initiative focuses on developing key skills and capabilities across the organization to support our strategic objectives.",
      strategicAlignment: "People development pillar of company strategy",
      visibility: "Team",
      milestones: [
        "Complete skills gap analysis",
        "Develop learning and development program",
        "Execute training and coaching",
        "Measure skill improvement and business impact",
      ],
    },
  },
  {
    id: "sustainability",
    name: "Sustainability Initiative",
    category: "Corporate Responsibility",
    subcategory: "Environmental Impact",
    department: ["Sustainability", "Operations", "Strategy"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Manufacturing", "Energy", "Transportation", "Retail"],
    timeframe: "12-24 months",
    complexity: "High",
    tags: ["carbon reduction", "waste management", "green energy", "ESG"],
    description: "Improve environmental sustainability of operations",
    template: {
      title: "Reduce Environmental Impact of [Business Area]",
      desiredOutcome: "Significantly reduce environmental footprint while maintaining business performance",
      successMetric: "Reduce carbon emissions by X%, waste by Y%, and resource usage by Z%",
      owner: "",
      priority: "Medium",
      dueDate: "",
      description:
        "This initiative aims to improve our environmental sustainability through targeted reductions in emissions, waste, and resource consumption.",
      strategicAlignment: "Sustainability pillar of company strategy",
      visibility: "Public",
      milestones: [
        "Complete environmental impact assessment",
        "Develop sustainability improvement strategy",
        "Implement key sustainability initiatives",
        "Measure and report on environmental impact reductions",
      ],
    },
  },
  {
    id: "customer-acquisition",
    name: "Customer Acquisition",
    category: "Growth",
    subcategory: "Customer Acquisition",
    department: ["Marketing", "Sales", "Growth"],
    businessSize: ["Startup", "SMB"],
    industry: ["SaaS", "E-commerce", "Consumer Goods", "Services"],
    timeframe: "3-6 months",
    complexity: "Medium",
    tags: ["lead generation", "conversion optimization", "marketing campaigns", "sales funnel"],
    description: "Increase customer acquisition through improved marketing and sales",
    template: {
      title: "Increase Customer Acquisition Rate",
      desiredOutcome: "Significantly increase new customer acquisition through optimized marketing and sales processes",
      successMetric: "Increase monthly new customers by X% and reduce customer acquisition cost by Y%",
      owner: "",
      priority: "High",
      dueDate: "",
      description: "This initiative focuses on optimizing our customer acquisition funnel to drive sustainable growth.",
      strategicAlignment: "Growth pillar of company strategy",
      visibility: "Team",
      milestones: [
        "Analyze current acquisition funnel and identify bottlenecks",
        "Develop acquisition optimization strategy",
        "Implement marketing and sales improvements",
        "Measure and optimize acquisition metrics",
      ],
    },
  },
  {
    id: "data-analytics",
    name: "Data Analytics Platform",
    category: "Technology",
    subcategory: "Data & Analytics",
    department: ["Data", "IT", "Strategy"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Technology", "E-commerce", "Financial Services", "Healthcare"],
    timeframe: "6-12 months",
    complexity: "High",
    tags: ["business intelligence", "data warehouse", "reporting", "insights"],
    description: "Build comprehensive data analytics capabilities",
    template: {
      title: "Implement Data Analytics Platform",
      desiredOutcome: "Enable data-driven decision making across the organization with comprehensive analytics",
      successMetric: "X% of decisions backed by data, Y% improvement in key business metrics",
      owner: "",
      priority: "High",
      dueDate: "",
      description:
        "This initiative aims to build a comprehensive data analytics platform to enable better decision making.",
      strategicAlignment: "Data-driven strategy pillar",
      visibility: "Team",
      milestones: [
        "Define data requirements and architecture",
        "Implement data collection and storage",
        "Build analytics dashboards and reports",
        "Train teams on data usage and interpretation",
      ],
    },
  },
  {
    id: "cost-reduction",
    name: "Cost Reduction Program",
    category: "Finance",
    subcategory: "Cost Management",
    department: ["Finance", "Operations", "Procurement"],
    businessSize: ["SMB", "Enterprise"],
    industry: ["Manufacturing", "Retail", "Services", "Healthcare"],
    timeframe: "3-9 months",
    complexity: "Medium",
    tags: ["cost cutting", "vendor optimization", "budget management", "efficiency"],
    description: "Systematic approach to reducing operational costs",
    template: {
      title: "Reduce Operational Costs by [X%]",
      desiredOutcome: "Achieve sustainable cost reductions while maintaining service quality and growth trajectory",
      successMetric: "Reduce operational costs by X% ($Y savings) within Z months",
      owner: "",
      priority: "High",
      dueDate: "",
      description:
        "This initiative focuses on identifying and implementing cost reduction opportunities across the organization.",
      strategicAlignment: "Financial efficiency pillar",
      visibility: "Team",
      milestones: [
        "Complete cost analysis and identify reduction opportunities",
        "Develop cost reduction strategy and timeline",
        "Implement cost reduction measures",
        "Monitor and report on cost savings achieved",
      ],
    },
  },
]

export function getTemplateById(id: string): InitiativeTemplate | undefined {
  return initiativeTemplates.find((template) => template.id === id)
}

export function getTemplatesByCategory(category: string): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.category === category)
}

export function getTemplatesBySubcategory(subcategory: string): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.subcategory === subcategory)
}

export function getTemplatesByDepartment(department: string): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.department.includes(department))
}

export function getTemplatesByBusinessSize(businessSize: string): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.businessSize.includes(businessSize))
}

export function getTemplatesByIndustry(industry: string): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.industry.includes(industry))
}

export function getTemplatesByComplexity(complexity: "Low" | "Medium" | "High"): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.complexity === complexity)
}

export function getTemplatesByTimeframe(timeframe: string): InitiativeTemplate[] {
  return initiativeTemplates.filter((template) => template.timeframe === timeframe)
}

export function searchTemplates(query: string): InitiativeTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return initiativeTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery) ||
      template.subcategory.toLowerCase().includes(lowercaseQuery) ||
      template.department.some((dept) => dept.toLowerCase().includes(lowercaseQuery)) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

// Extract unique values for filter options
export const templateCategories = Array.from(new Set(initiativeTemplates.map((template) => template.category)))
export const templateSubcategories = Array.from(new Set(initiativeTemplates.map((template) => template.subcategory)))
export const templateDepartments = Array.from(
  new Set(initiativeTemplates.flatMap((template) => template.department)),
).sort()
export const templateBusinessSizes = Array.from(
  new Set(initiativeTemplates.flatMap((template) => template.businessSize)),
)
export const templateIndustries = Array.from(
  new Set(initiativeTemplates.flatMap((template) => template.industry)),
).sort()
export const templateComplexities = ["Low", "Medium", "High"] as const
export const templateTimeframes = Array.from(new Set(initiativeTemplates.map((template) => template.timeframe)))
export const templateTags = Array.from(new Set(initiativeTemplates.flatMap((template) => template.tags))).sort()
