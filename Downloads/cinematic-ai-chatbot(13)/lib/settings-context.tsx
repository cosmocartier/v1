"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ApplicationSettings, SettingsContextType } from "./settings-types"

// Default settings
const defaultSettings: ApplicationSettings = {
  ai: {
    tone: "professional",
    verbosity: "balanced",
    creativity: 50,
    responseStyle: "explanatory",
    expertise: "intermediate",
    language: "en",
    useEmojis: true,
    includeExamples: true,
    provideSources: true,
  },
  notifications: {
    email: {
      enabled: true,
      frequency: "daily",
      types: {
        taskDeadlines: true,
        milestoneUpdates: true,
        systemAlerts: true,
        weeklyDigest: true,
        teamUpdates: true,
      },
    },
    push: {
      enabled: true,
      types: {
        urgentAlerts: true,
        taskReminders: true,
        mentions: true,
        systemUpdates: false,
      },
    },
    inApp: {
      enabled: true,
      sound: true,
      soundType: "default",
      showBadges: true,
      autoMarkRead: false,
    },
  },
  appearance: {
    theme: "system",
    colorScheme: "blue",
    fontSize: "medium",
    compactMode: false,
    animations: true,
    reducedMotion: false,
    highContrast: false,
    sidebarCollapsed: false,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    crashReporting: true,
    performanceMonitoring: true,
    shareUsageData: false,
    personalizedAds: false,
    cookieConsent: true,
  },
  integrations: {
    calendar: {
      enabled: false,
      provider: "none",
      syncFrequency: "daily",
    },
    slack: {
      enabled: false,
      webhook: "",
      channels: [],
    },
    email: {
      provider: "gmail",
    },
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 120, // 2 hours in minutes
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
    loginNotifications: true,
    deviceManagement: false,
    apiKeyRotation: "quarterly",
  },
  general: {
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    currency: "USD",
    language: "en",
    autoSave: true,
    autoSaveInterval: 30, // seconds
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ApplicationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("appSettings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
        // If loading fails, use default settings
        setSettings(defaultSettings)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Save settings to localStorage when they change
  const saveSettings = async (newSettings: ApplicationSettings) => {
    try {
      localStorage.setItem("appSettings", JSON.stringify(newSettings))
      setHasUnsavedChanges(false)
      return true
    } catch (error) {
      console.error("Failed to save settings:", error)
      return false
    }
  }

  // Update a specific section of settings
  const updateSettings = async (
    section: keyof ApplicationSettings,
    updates: Partial<ApplicationSettings[keyof ApplicationSettings]>,
  ) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          ...updates,
        },
      }

      setHasUnsavedChanges(true)

      // Clear previous timeout if it exists
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }

      // Set a new timeout to save settings after a delay
      const timeout = setTimeout(() => {
        saveSettings(newSettings)
      }, 1000) // 1 second delay

      setSaveTimeout(timeout)

      return newSettings
    })
  }

  // Reset settings to default
  const resetSettings = async (section?: keyof ApplicationSettings) => {
    if (section) {
      setSettings((prev) => {
        const newSettings = {
          ...prev,
          [section]: defaultSettings[section],
        }
        saveSettings(newSettings)
        return newSettings
      })
    } else {
      setSettings(defaultSettings)
      saveSettings(defaultSettings)
    }
  }

  // Export settings as JSON string
  const exportSettings = () => {
    return JSON.stringify(settings, null, 2)
  }

  // Import settings from JSON string
  const importSettings = async (settingsJson: string) => {
    try {
      const parsedSettings = JSON.parse(settingsJson)
      setSettings(parsedSettings)
      await saveSettings(parsedSettings)
      return true
    } catch (error) {
      console.error("Failed to import settings:", error)
      return false
    }
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [saveTimeout])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportSettings,
        importSettings,
        isLoading,
        hasUnsavedChanges,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
