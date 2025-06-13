export interface OnboardingData {
  industry: string
  team_type: string
  team_size: string
  use_case: string
}

export interface TeamInvite {
  email: string
  role?: string
  invited_at: string
  status: "pending" | "accepted" | "declined"
}

export interface OnboardingStep1Data {
  company: string
  role: string
  industry: string
  team_type: string
  team_size: string
  use_case: string
}
