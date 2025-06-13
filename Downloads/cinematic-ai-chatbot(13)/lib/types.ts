// Add these types to your existing types file or create a new one

export interface StrategicContext {
  id: string
  type: "initiative" | "operation"
  title: string
  status: "not-started" | "in-progress" | "at-risk" | "on-hold" | "completed"
  progress: number
  objectives?: Objective[]
  kpis?: KPI[]
  milestones?: Milestone[]
  risks?: Risk[]
  team?: TeamMember[]
  recentActivity?: Activity[]
}

export interface Objective {
  id: string
  title: string
  description?: string
  status: "not-started" | "in-progress" | "completed"
}

export interface KPI {
  id: string
  title: string
  description?: string
  current: number
  target: number
  unit?: string
  status: "on-track" | "at-risk" | "off-track"
}

export interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: string
  status: "not-started" | "in-progress" | "completed" | "delayed"
}

export interface Risk {
  id: string
  title: string
  description?: string
  impact: "low" | "medium" | "high"
  probability: "low" | "medium" | "high"
  mitigationPlan?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
}

export interface Activity {
  id: string
  date: string
  type: "update" | "decision" | "risk" | "milestone" | "comment"
  description: string
  userId?: string
}

export interface ChatAction {
  actionType: string
  itemId?: string // Can be used for Task ID, Milestone ID, etc.
  payload: Record<string, any>
}

// New Task Management Types
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent"
export type TaskStatus = "To Do" | "In Progress" | "Blocked" | "Completed"

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string // ISO string for date
  priority: TaskPriority
  status: TaskStatus
  assigneeId?: string // Corresponds to TeamMember.id from StrategicContext
  assigneeName?: string // For display convenience
  createdAt: string // ISO string
  updatedAt: string // ISO string
  completedAt?: string // ISO string, set when status becomes 'Completed'
  strategicItemId?: string // ID of the Initiative or Operation it's related to
  strategicItemType?: "initiative" | "operation"
  sessionId?: string // Optional: ID of the chat session where it was created/discussed
  creatorId?: string // User ID of the creator
}

// AI Agent Types
export type AIMode = "daily" | "pro"

export interface AIAgent {
  id: string
  name: string
  description: string
  category: "strategic" | "analytical" | "creative" | "technical"
  icon: string
  color: string
  capabilities: string[]
  systemPromptTemplate: string
  contextIntegration: "full" | "partial" | "minimal"
  maxTokens?: number
  temperature?: number
}

export interface ChatSession {
  id: string
  title: string
  summary: string
  mode: AIMode
  agentId?: string // For Pro Mode
  objective?: string
  customName?: string
  variables: SessionVariable[]
  tags: string[]
  colorCode: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  messages: ChatMessage[]
  category?: string
  activeStrategicItemId?: string
  activeStrategicItemType?: "initiative" | "operation"
}

export interface SessionVariable {
  key: string
  value: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: Date
  updatedAt: Date
  sessionId: string
  userId?: string
  agentId?: string
  strategicItemId?: string
  strategicItemType?: "initiative" | "operation"
  taskId?: string
}
