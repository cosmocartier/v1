"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  parts?: Array<{ type: string; text: string }>
}

export interface SessionVariable {
  id: string
  name: string
  value: string
  type: "text" | "number" | "boolean" | "date"
}

export type AIMode = "daily" | "strategic"

export interface ChatSession {
  id: string
  title: string
  summary: string
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
  mode?: AIMode
  agentId?: string
}

interface SessionContextType {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  isLoading: boolean
  createNewSession: (mode?: AIMode) => string
  loadSession: (sessionId: string) => void
  updateSession: (sessionId: string, messages: ChatMessage[]) => void
  updateSessionMetadata: (sessionId: string, metadata: Partial<ChatSession>) => void
  deleteSession: (sessionId: string) => void
  searchSessions: (query: string) => ChatSession[]
  filterSessions: (filters: SessionFilters) => ChatSession[]
  generateSessionSummary: (messages: ChatMessage[]) => string
}

export interface SessionFilters {
  objective?: string
  name?: string
  tags?: string[]
  colorCode?: string
  dateRange?: "today" | "week" | "month" | "all"
  variables?: { name: string; value: string }[]
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const defaultColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // slate
  "#dc2626", // red-600
]

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (user) {
      try {
        const savedSessions = localStorage.getItem(`me-sessions-${user.id}`)
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            variables: session.variables || [],
            tags: session.tags || [],
            colorCode: session.colorCode || defaultColors[Math.floor(Math.random() * defaultColors.length)],
            messages:
              session.messages?.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })) || [],
            activeStrategicItemId: session.activeStrategicItemId,
            activeStrategicItemType: session.activeStrategicItemType,
          }))
          setSessions(parsedSessions)

          // Auto-load the most recent session if no current session
          if (parsedSessions.length > 0 && !currentSession) {
            setCurrentSession(parsedSessions[0])
          }
        }
      } catch (error) {
        console.error("Error loading sessions:", error)
        setSessions([])
      }
    } else {
      setSessions([])
      setCurrentSession(null)
    }
    setIsLoading(false)
  }, [user])

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`me-sessions-${user.id}`, JSON.stringify(sessions))
      } catch (error) {
        console.error("Error saving sessions:", error)
      }
    }
  }, [sessions, user])

  const generateSessionSummary = useCallback((messages: ChatMessage[]): string => {
    if (messages.length === 0) return "New strategic session"

    const userMessages = messages.filter((msg) => msg.role === "user")
    if (userMessages.length === 0) return "New strategic session"

    const firstMessage = userMessages[0].content

    // Extract key topics and create a summary
    const keywords = [
      "market entry",
      "revenue optimization",
      "competitive advantage",
      "digital transformation",
      "team scaling",
      "risk mitigation",
      "strategy",
      "analysis",
      "planning",
      "optimization",
    ]

    const foundKeywords = keywords.filter((keyword) => firstMessage.toLowerCase().includes(keyword))

    if (foundKeywords.length > 0) {
      return `${foundKeywords[0].charAt(0).toUpperCase() + foundKeywords[0].slice(1)} discussion`
    }

    // Fallback to first 50 characters
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + "..." : firstMessage
  }, [])

  const createNewSession = useCallback((mode: AIMode = "daily"): string => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Session ${new Date().toLocaleDateString()}`,
      summary: mode === "daily" ? "New daily session" : "New strategic session",
      mode: mode,
      agentId: undefined,
      objective: "",
      customName: "",
      variables: [],
      tags: [],
      colorCode: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      messages: [],
      category: "General",
      activeStrategicItemId: undefined,
      activeStrategicItemType: undefined,
    }

    setSessions((prev) => [newSession, ...prev])
    setCurrentSession(newSession)
    return newSession.id
  }, [])

  const loadSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        setCurrentSession(session)
      }
    },
    [sessions],
  )

  const updateSession = useCallback(
    (sessionId: string, messages: ChatMessage[]) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === sessionId) {
            const updatedSession = {
              ...session,
              messages: [...messages],
              messageCount: messages.length,
              updatedAt: new Date(),
              summary: generateSessionSummary(messages),
            }

            // Update current session if it's the one being updated
            setCurrentSession((current) => {
              if (current?.id === sessionId) {
                return updatedSession
              }
              return current
            })

            return updatedSession
          }
          return session
        }),
      )
    },
    [generateSessionSummary],
  )

  const updateSessionMetadata = useCallback((sessionId: string, metadata: Partial<ChatSession>) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            ...metadata,
            updatedAt: new Date(),
          }

          // Update current session if it's the one being updated
          setCurrentSession((current) => {
            if (current?.id === sessionId) {
              return updatedSession
            }
            return current
          })

          return updatedSession
        }
        return session
      }),
    )
  }, [])

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId)

      // If we're deleting the current session, switch to another one or clear
      setCurrentSession((current) => {
        if (current?.id === sessionId) {
          return filtered.length > 0 ? filtered[0] : null
        }
        return current
      })

      return filtered
    })
  }, [])

  const searchSessions = useCallback(
    (query: string): ChatSession[] => {
      if (!query.trim()) return sessions

      const lowercaseQuery = query.toLowerCase()
      return sessions.filter(
        (session) =>
          session.title.toLowerCase().includes(lowercaseQuery) ||
          session.summary.toLowerCase().includes(lowercaseQuery) ||
          session.objective?.toLowerCase().includes(lowercaseQuery) ||
          session.customName?.toLowerCase().includes(lowercaseQuery) ||
          session.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
          session.variables.some(
            (variable) =>
              variable.name.toLowerCase().includes(lowercaseQuery) ||
              variable.value.toLowerCase().includes(lowercaseQuery),
          ) ||
          session.messages.some((msg) => msg.content.toLowerCase().includes(lowercaseQuery)),
      )
    },
    [sessions],
  )

  const filterSessions = useCallback(
    (filters: SessionFilters): ChatSession[] => {
      let filtered = [...sessions]

      // Filter by objective
      if (filters.objective) {
        filtered = filtered.filter((session) =>
          session.objective?.toLowerCase().includes(filters.objective!.toLowerCase()),
        )
      }

      // Filter by name
      if (filters.name) {
        filtered = filtered.filter(
          (session) =>
            session.customName?.toLowerCase().includes(filters.name!.toLowerCase()) ||
            session.title.toLowerCase().includes(filters.name!.toLowerCase()),
        )
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((session) => filters.tags!.some((tag) => session.tags.includes(tag)))
      }

      // Filter by color code
      if (filters.colorCode) {
        filtered = filtered.filter((session) => session.colorCode === filters.colorCode)
      }

      // Filter by variables
      if (filters.variables && filters.variables.length > 0) {
        filtered = filtered.filter((session) =>
          filters.variables!.some((filterVar) =>
            session.variables.some(
              (sessionVar) =>
                sessionVar.name.toLowerCase().includes(filterVar.name.toLowerCase()) &&
                sessionVar.value.toLowerCase().includes(filterVar.value.toLowerCase()),
            ),
          ),
        )
      }

      // Filter by date range
      if (filters.dateRange && filters.dateRange !== "all") {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        switch (filters.dateRange) {
          case "today":
            filtered = filtered.filter((session) => session.updatedAt >= today)
            break
          case "week":
            filtered = filtered.filter((session) => session.updatedAt >= weekAgo)
            break
          case "month":
            filtered = filtered.filter((session) => session.updatedAt >= monthAgo)
            break
        }
      }

      return filtered
    },
    [sessions],
  )

  return (
    <SessionContext.Provider
      value={{
        sessions,
        currentSession,
        isLoading,
        createNewSession,
        loadSession,
        updateSession,
        updateSessionMetadata,
        deleteSession,
        searchSessions,
        filterSessions,
        generateSessionSummary,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
