export interface AISettings {
  tone: "professional" | "casual" | "friendly" | "formal" | "creative"
  verbosity: "concise" | "balanced" | "detailed" | "comprehensive"
  creativity: number // 0-100
  responseStyle: "direct" | "explanatory" | "conversational" | "technical"
  expertise: "beginner" | "intermediate" | "advanced" | "expert"
  language: string
  useEmojis: boolean
  includeExamples: boolean
  provideSources: boolean
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    frequency: "immediate" | "hourly" | "daily" | "weekly"
    types: {
      taskDeadlines: boolean
      milestoneUpdates: boolean
      systemAlerts: boolean
      weeklyDigest: boolean
      teamUpdates: boolean
    }
  }
  push: {
    enabled: boolean
    types: {
      urgentAlerts: boolean
      taskReminders: boolean
      mentions: boolean
      systemUpdates: boolean
    }
  }
  inApp: {
    enabled: boolean
    sound: boolean
    soundType: "default" | "high" | "critical"
    showBadges: boolean
    autoMarkRead: boolean
  }
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  colorScheme: "blue" | "green" | "purple" | "orange" | "red"
  fontSize: "small" | "medium" | "large"
  compactMode: boolean
  animations: boolean
  reducedMotion: boolean
  highContrast: boolean
  sidebarCollapsed: boolean
}

export interface PrivacySettings {
  dataCollection: boolean
  analytics: boolean
  crashReporting: boolean
  performanceMonitoring: boolean
  shareUsageData: boolean
  personalizedAds: boolean
  cookieConsent: boolean
}

export interface IntegrationSettings {
  calendar: {
    enabled: boolean
    provider: "google" | "outlook" | "apple" | "none"
    syncFrequency: "realtime" | "hourly" | "daily"
  }
  slack: {
    enabled: boolean
    webhook: string
    channels: string[]
  }
  email: {
    provider: "gmail" | "outlook" | "custom"
  }
}

export interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number // minutes
  passwordRequirements: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
  }
  loginNotifications: boolean
  deviceManagement: boolean
  apiKeyRotation: "monthly" | "quarterly" | "yearly" | "never"
}

export interface GeneralSettings {
  timezone: string
  dateFormat: string
  timeFormat: "12h" | "24h"
  currency: string
  language: string
  autoSave: boolean
  autoSaveInterval: number // seconds
}

export interface ApplicationSettings {
  ai: AISettings
  notifications: NotificationSettings
  appearance: AppearanceSettings
  privacy: PrivacySettings
  integrations: IntegrationSettings
  security: SecuritySettings
  general: GeneralSettings
}

export interface SettingsContextType {
  settings: ApplicationSettings
  updateSettings: (
    section: keyof ApplicationSettings,
    updates: Partial<ApplicationSettings[keyof ApplicationSettings]>,
  ) => Promise<void>
  resetSettings: (section?: keyof ApplicationSettings) => Promise<void>
  exportSettings: () => string
  importSettings: (settingsJson: string) => Promise<boolean>
  isLoading: boolean
  hasUnsavedChanges: boolean
}
