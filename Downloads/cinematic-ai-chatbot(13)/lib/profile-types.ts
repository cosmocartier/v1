export interface PersonalityTrait {
  name: string
  category: "cognitive" | "emotional" | "behavioral" | "social"
  score: number // 0-100
  description: string
}

export interface CommunicationStyle {
  primary: "direct" | "diplomatic" | "analytical" | "expressive"
  secondary?: "direct" | "diplomatic" | "analytical" | "expressive"
  effectiveApproaches: string[]
  ineffectiveApproaches: string[]
  preferredChannels: ("email" | "phone" | "video" | "in-person" | "chat")[]
}

export interface MotivationDriver {
  type: "achievement" | "autonomy" | "mastery" | "purpose" | "recognition" | "security"
  strength: number // 0-100
  description: string
  triggers: string[]
}

export interface WorkingStyle {
  environment: "collaborative" | "independent" | "mixed"
  pace: "fast" | "moderate" | "deliberate"
  decisionMaking: "quick" | "analytical" | "consultative"
  feedbackPreference: "frequent" | "periodic" | "minimal"
  stressResponse: string[]
}

export interface PsychologicalInsight {
  id: string
  category: "strength" | "opportunity" | "growth" | "blind_spot"
  title: string
  description: string
  actionableAdvice: string[]
  confidence: number // 0-100
  generatedAt: string
}

export interface ProfileAnalysis {
  profileId: string
  analysisType: "personality" | "communication" | "motivation" | "working_style" | "relationship"
  insights: PsychologicalInsight[]
  recommendations: string[]
  generatedAt: string
}

export interface Profile {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  phone?: string
  avatar?: string

  // Core psychological data
  personalityTraits: PersonalityTrait[]
  communicationStyle: CommunicationStyle
  motivationDrivers: MotivationDriver[]
  workingStyle: WorkingStyle

  // AI-generated insights
  psychologicalInsights: PsychologicalInsight[]

  // Quick reference data
  quickInsights?: string[]
  meetingPrep?: string[]
  communicationTips?: string[]

  // Relationship context
  relationshipHistory?: {
    lastInteraction?: string
    interactionFrequency: "daily" | "weekly" | "monthly" | "rarely"
    relationshipQuality: "excellent" | "good" | "neutral" | "challenging"
    notes?: string
  }

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  tags?: string[]
  isActive: boolean
}

export interface ProfileStats {
  totalProfiles: number
  totalInsights: number
  averagePersonalityScore: number
  departmentBreakdown: Record<string, number>
  communicationStyleBreakdown: Record<string, number>
  recentActivity: {
    profilesCreated: number
    insightsGenerated: number
    lastWeek: boolean
  }
}
