"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useAuth } from "./auth-context"
import type { Profile, ProfileAnalysis, PsychologicalInsight } from "./profile-types"

interface ProfileContextType {
  // State
  profiles: Profile[]
  isLoading: boolean

  // Profile methods
  createProfile: (
    profileData: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy" | "psychologicalInsights">,
  ) => Promise<Profile>
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<Profile>
  deleteProfile: (id: string) => Promise<void>
  getProfileById: (id: string) => Profile | undefined

  // Analysis methods
  generateAnalysis: (profileId: string, analysisType: ProfileAnalysis["analysisType"]) => Promise<ProfileAnalysis>
  updateInsights: (profileId: string, insights: PsychologicalInsight[]) => Promise<void>

  // Search and filter
  searchProfiles: (query: string) => Profile[]
  getProfilesByDepartment: (department: string) => Profile[]
  getProfilesByRole: (role: string) => Profile[]

  // Quick actions
  getMeetingPrep: (profileId: string) => string[]
  getCommunicationTips: (profileId: string) => string[]
  getQuickInsights: (profileId: string) => string[]
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load profiles from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedProfiles = localStorage.getItem(`profiles_${user.id}`)
      if (savedProfiles) {
        try {
          setProfiles(JSON.parse(savedProfiles))
        } catch (error) {
          console.error("Error parsing profiles:", error)
          setProfiles([])
        }
      }
    }
  }, [user])

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`profiles_${user.id}`, JSON.stringify(profiles))
      } catch (error) {
        console.error("Error saving profiles to localStorage:", error)
      }
    }
  }, [profiles, user])

  const createProfile = useCallback(
    async (
      profileData: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy" | "psychologicalInsights">,
    ): Promise<Profile> => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const now = new Date().toISOString()
      const newProfile: Profile = {
        ...profileData,
        id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        createdBy: user?.id || "system",
        psychologicalInsights: [],
      }

      // Generate initial AI insights
      const initialInsights = await generateInitialInsights(newProfile)
      newProfile.psychologicalInsights = initialInsights

      setProfiles((prev) => [...prev, newProfile])
      setIsLoading(false)
      return newProfile
    },
    [user],
  )

  const updateProfile = useCallback(async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    let updatedProfile: Profile | undefined
    setProfiles((prev) =>
      prev.map((profile) => {
        if (profile.id === id) {
          updatedProfile = {
            ...profile,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          return updatedProfile
        }
        return profile
      }),
    )

    setIsLoading(false)
    if (!updatedProfile) throw new Error("Profile not found")
    return updatedProfile
  }, [])

  const deleteProfile = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    setProfiles((prev) => prev.filter((profile) => profile.id !== id))
    setIsLoading(false)
  }, [])

  const getProfileById = useCallback(
    (id: string): Profile | undefined => {
      return profiles.find((profile) => profile.id === id)
    },
    [profiles],
  )

  const generateAnalysis = useCallback(
    async (profileId: string, analysisType: ProfileAnalysis["analysisType"]): Promise<ProfileAnalysis> => {
      const profile = getProfileById(profileId)
      if (!profile) throw new Error("Profile not found")

      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const analysis: ProfileAnalysis = {
        profileId,
        analysisType,
        insights: await generateInsightsForType(profile, analysisType),
        recommendations: generateRecommendations(profile, analysisType),
        generatedAt: new Date().toISOString(),
      }

      setIsLoading(false)
      return analysis
    },
    [getProfileById],
  )

  const updateInsights = useCallback(
    async (profileId: string, insights: PsychologicalInsight[]): Promise<void> => {
      await updateProfile(profileId, { psychologicalInsights: insights })
    },
    [updateProfile],
  )

  const searchProfiles = useCallback(
    (query: string): Profile[] => {
      const lowercaseQuery = query.toLowerCase()
      return profiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(lowercaseQuery) ||
          profile.role.toLowerCase().includes(lowercaseQuery) ||
          profile.department?.toLowerCase().includes(lowercaseQuery),
      )
    },
    [profiles],
  )

  const getProfilesByDepartment = useCallback(
    (department: string): Profile[] => {
      return profiles.filter((profile) => profile.department === department)
    },
    [profiles],
  )

  const getProfilesByRole = useCallback(
    (role: string): Profile[] => {
      return profiles.filter((profile) => profile.role === role)
    },
    [profiles],
  )

  const getMeetingPrep = useCallback(
    (profileId: string): string[] => {
      const profile = getProfileById(profileId)
      if (!profile) return []
      return profile.meetingPrep || []
    },
    [getProfileById],
  )

  const getCommunicationTips = useCallback(
    (profileId: string): string[] => {
      const profile = getProfileById(profileId)
      if (!profile) return []
      return profile.communicationTips || []
    },
    [getProfileById],
  )

  const getQuickInsights = useCallback(
    (profileId: string): string[] => {
      const profile = getProfileById(profileId)
      if (!profile) return []
      return profile.quickInsights || []
    },
    [getProfileById],
  )

  const value: ProfileContextType = {
    profiles,
    isLoading,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileById,
    generateAnalysis,
    updateInsights,
    searchProfiles,
    getProfilesByDepartment,
    getProfilesByRole,
    getMeetingPrep,
    getCommunicationTips,
    getQuickInsights,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfiles() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfileProvider")
  }
  return context
}

// Helper functions for AI analysis
async function generateInitialInsights(profile: Profile): Promise<PsychologicalInsight[]> {
  // Simulate AI analysis based on profile data
  const insights: PsychologicalInsight[] = []

  // Analyze personality traits
  if (profile.personalityTraits.length > 0) {
    const dominantTrait = profile.personalityTraits.reduce((prev, current) =>
      prev.score > current.score ? prev : current,
    )

    insights.push({
      id: `insight-${Date.now()}-1`,
      category: "strength",
      title: `Strong ${dominantTrait.name}`,
      description: `Shows high ${dominantTrait.name.toLowerCase()} with a score of ${dominantTrait.score}/100`,
      actionableAdvice: [
        `Leverage their ${dominantTrait.name.toLowerCase()} in team settings`,
        `Provide opportunities that align with this strength`,
      ],
      confidence: 85,
      generatedAt: new Date().toISOString(),
    })
  }

  // Analyze communication style
  insights.push({
    id: `insight-${Date.now()}-2`,
    category: "opportunity",
    title: `${profile.communicationStyle.primary} Communication Style`,
    description: `Prefers ${profile.communicationStyle.primary} communication approach`,
    actionableAdvice: profile.communicationStyle.effectiveApproaches,
    confidence: 90,
    generatedAt: new Date().toISOString(),
  })

  return insights
}

async function generateInsightsForType(
  profile: Profile,
  analysisType: ProfileAnalysis["analysisType"],
): Promise<PsychologicalInsight[]> {
  // Generate specific insights based on analysis type
  const insights: PsychologicalInsight[] = []

  switch (analysisType) {
    case "personality":
      // Generate personality-focused insights
      break
    case "communication":
      // Generate communication-focused insights
      break
    case "motivation":
      // Generate motivation-focused insights
      break
    case "working_style":
      // Generate working style insights
      break
    case "relationship":
      // Generate relationship insights
      break
  }

  return insights
}

function generateRecommendations(profile: Profile, analysisType: ProfileAnalysis["analysisType"]): string[] {
  const recommendations: string[] = []

  switch (analysisType) {
    case "communication":
      recommendations.push(
        `Use ${profile.communicationStyle.primary} approach in conversations`,
        "Focus on their preferred communication channels",
        "Avoid communication styles they find ineffective",
      )
      break
    case "motivation":
      profile.motivationDrivers.forEach((driver) => {
        if (driver.strength > 70) {
          recommendations.push(`Leverage their strong ${driver.type} motivation`)
        }
      })
      break
  }

  return recommendations
}
