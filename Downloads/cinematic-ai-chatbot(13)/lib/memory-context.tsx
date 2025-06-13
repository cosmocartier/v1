"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import type { Memory, MemoryAttachment, MemorySearchFilters, MemoryStats } from "./memory-types"

interface MemoryContextType {
  // State
  memories: Memory[]
  isLoading: boolean

  // Memory CRUD operations
  createMemory: (
    memory: Omit<Memory, "id" | "createdAt" | "updatedAt" | "createdBy" | "createdByName">,
  ) => Promise<Memory>
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<Memory>
  deleteMemory: (id: string) => Promise<void>
  getMemoryById: (id: string) => Memory | undefined

  // Memory retrieval
  getMemoriesForItem: (itemId: string, itemType: Memory["itemType"]) => Memory[]
  searchMemories: (filters: MemorySearchFilters) => Memory[]
  getRecentMemories: (limit?: number) => Memory[]
  getRelatedMemories: (memoryId: string) => Memory[]

  // Memory statistics
  getMemoryStats: (itemId?: string, itemType?: Memory["itemType"]) => MemoryStats
  getMemoryTags: (itemId?: string, itemType?: Memory["itemType"]) => string[]

  // Memory relationships
  linkMemories: (memoryId1: string, memoryId2: string) => Promise<void>
  unlinkMemories: (memoryId1: string, memoryId2: string) => Promise<void>

  // Attachments
  addAttachment: (memoryId: string, attachment: Omit<MemoryAttachment, "id">) => Promise<void>
  removeAttachment: (memoryId: string, attachmentId: string) => Promise<void>

  // Bulk operations
  bulkDeleteMemories: (memoryIds: string[]) => Promise<void>
  bulkUpdateMemories: (memoryIds: string[], updates: Partial<Memory>) => Promise<void>

  // Export/Import
  exportMemories: (itemId?: string, itemType?: Memory["itemType"]) => string
  importMemories: (data: string) => Promise<number>
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined)

export function MemoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load memories from localStorage on mount
  useEffect(() => {
    if (user) {
      try {
        const savedMemories = localStorage.getItem(`memories_${user.id}`)
        if (savedMemories) {
          const parsedMemories = JSON.parse(savedMemories)
          setMemories(parsedMemories)
        }
      } catch (error) {
        console.error("Error loading memories:", error)
        setMemories([])
      }
    } else {
      setMemories([])
    }
  }, [user])

  // Save memories to localStorage whenever they change
  useEffect(() => {
    if (user && memories.length >= 0) {
      try {
        localStorage.setItem(`memories_${user.id}`, JSON.stringify(memories))
      } catch (error) {
        console.error("Error saving memories:", error)
      }
    }
  }, [memories, user])

  // Memory CRUD operations
  const createMemory = async (
    memoryData: Omit<Memory, "id" | "createdAt" | "updatedAt" | "createdBy" | "createdByName">,
  ): Promise<Memory> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newMemory: Memory = {
      ...memoryData,
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id || "unknown",
      createdByName: user?.name || "Unknown User",
    }

    setMemories((prev) => [newMemory, ...prev])
    setIsLoading(false)

    return newMemory
  }

  const updateMemory = async (id: string, updates: Partial<Memory>): Promise<Memory> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const updatedMemory = {
      ...memories.find((m) => m.id === id)!,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    setMemories((prev) => prev.map((m) => (m.id === id ? updatedMemory : m)))
    setIsLoading(false)

    return updatedMemory
  }

  const deleteMemory = async (id: string): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Remove this memory from any related memories
    setMemories((prev) =>
      prev
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          relatedMemories: m.relatedMemories?.filter((relatedId) => relatedId !== id),
        })),
    )

    setIsLoading(false)
  }

  const getMemoryById = (id: string): Memory | undefined => {
    return memories.find((m) => m.id === id)
  }

  // Memory retrieval
  const getMemoriesForItem = (itemId: string, itemType: Memory["itemType"]): Memory[] => {
    return memories
      .filter((m) => m.itemId === itemId && m.itemType === itemType)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const searchMemories = (filters: MemorySearchFilters): Memory[] => {
    let filtered = [...memories]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.content.toLowerCase().includes(query) ||
          m.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((m) => m.type === filters.type)
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((m) => filters.tags!.some((tag) => m.tags.includes(tag)))
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter((m) => m.priority === filters.priority)
    }

    // Visibility filter
    if (filters.visibility) {
      filtered = filtered.filter((m) => m.visibility === filters.visibility)
    }

    // Item filter
    if (filters.itemId) {
      filtered = filtered.filter((m) => m.itemId === filters.itemId)
    }

    if (filters.itemType) {
      filtered = filtered.filter((m) => m.itemType === filters.itemType)
    }

    // Created by filter
    if (filters.createdBy) {
      filtered = filtered.filter((m) => m.createdBy === filters.createdBy)
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date()
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
        quarter: 90,
        year: 365,
      }

      const daysBack = ranges[filters.dateRange]
      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

      filtered = filtered.filter((m) => new Date(m.createdAt) >= cutoffDate)
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const getRecentMemories = (limit = 10): Memory[] => {
    return memories.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, limit)
  }

  const getRelatedMemories = (memoryId: string): Memory[] => {
    const memory = getMemoryById(memoryId)
    if (!memory || !memory.relatedMemories) return []

    return memory.relatedMemories.map((id) => getMemoryById(id)).filter((m) => m !== undefined) as Memory[]
  }

  // Memory statistics
  const getMemoryStats = (itemId?: string, itemType?: Memory["itemType"]): MemoryStats => {
    let targetMemories = memories

    if (itemId && itemType) {
      targetMemories = getMemoriesForItem(itemId, itemType)
    }

    const byType = targetMemories.reduce(
      (acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1
        return acc
      },
      {} as Record<Memory["type"], number>,
    )

    const byPriority = targetMemories.reduce(
      (acc, m) => {
        acc[m.priority] = (acc[m.priority] || 0) + 1
        return acc
      },
      {} as Record<Memory["priority"], number>,
    )

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentCount = targetMemories.filter((m) => new Date(m.createdAt) >= weekAgo).length

    const tagCounts = targetMemories.reduce(
      (acc, m) => {
        m.tags.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    return {
      total: targetMemories.length,
      byType,
      byPriority,
      recentCount,
      topTags,
    }
  }

  const getMemoryTags = (itemId?: string, itemType?: Memory["itemType"]): string[] => {
    let targetMemories = memories

    if (itemId && itemType) {
      targetMemories = getMemoriesForItem(itemId, itemType)
    }

    const allTags = targetMemories.flatMap((m) => m.tags)
    return [...new Set(allTags)].sort()
  }

  // Memory relationships
  const linkMemories = async (memoryId1: string, memoryId2: string): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))

    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === memoryId1) {
          return {
            ...m,
            relatedMemories: [...(m.relatedMemories || []), memoryId2],
            updatedAt: new Date().toISOString(),
          }
        }
        if (m.id === memoryId2) {
          return {
            ...m,
            relatedMemories: [...(m.relatedMemories || []), memoryId1],
            updatedAt: new Date().toISOString(),
          }
        }
        return m
      }),
    )

    setIsLoading(false)
  }

  const unlinkMemories = async (memoryId1: string, memoryId2: string): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))

    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === memoryId1) {
          return {
            ...m,
            relatedMemories: m.relatedMemories?.filter((id) => id !== memoryId2),
            updatedAt: new Date().toISOString(),
          }
        }
        if (m.id === memoryId2) {
          return {
            ...m,
            relatedMemories: m.relatedMemories?.filter((id) => id !== memoryId1),
            updatedAt: new Date().toISOString(),
          }
        }
        return m
      }),
    )

    setIsLoading(false)
  }

  // Attachments
  const addAttachment = async (memoryId: string, attachment: Omit<MemoryAttachment, "id">): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newAttachment: MemoryAttachment = {
      ...attachment,
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    setMemories((prev) =>
      prev.map((m) =>
        m.id === memoryId
          ? {
              ...m,
              attachments: [...(m.attachments || []), newAttachment],
              updatedAt: new Date().toISOString(),
            }
          : m,
      ),
    )

    setIsLoading(false)
  }

  const removeAttachment = async (memoryId: string, attachmentId: string): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))

    setMemories((prev) =>
      prev.map((m) =>
        m.id === memoryId
          ? {
              ...m,
              attachments: m.attachments?.filter((a) => a.id !== attachmentId),
              updatedAt: new Date().toISOString(),
            }
          : m,
      ),
    )

    setIsLoading(false)
  }

  // Bulk operations
  const bulkDeleteMemories = async (memoryIds: string[]): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    setMemories((prev) =>
      prev
        .filter((m) => !memoryIds.includes(m.id))
        .map((m) => ({
          ...m,
          relatedMemories: m.relatedMemories?.filter((id) => !memoryIds.includes(id)),
        })),
    )

    setIsLoading(false)
  }

  const bulkUpdateMemories = async (memoryIds: string[], updates: Partial<Memory>): Promise<void> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const now = new Date().toISOString()
    setMemories((prev) => prev.map((m) => (memoryIds.includes(m.id) ? { ...m, ...updates, updatedAt: now } : m)))

    setIsLoading(false)
  }

  // Export/Import
  const exportMemories = (itemId?: string, itemType?: Memory["itemType"]): string => {
    let targetMemories = memories

    if (itemId && itemType) {
      targetMemories = getMemoriesForItem(itemId, itemType)
    }

    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        exportedBy: user?.name || "Unknown",
        itemId,
        itemType,
        memories: targetMemories,
      },
      null,
      2,
    )
  }

  const importMemories = async (data: string): Promise<number> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    try {
      const parsed = JSON.parse(data)
      const importedMemories = parsed.memories as Memory[]

      // Generate new IDs to avoid conflicts
      const processedMemories = importedMemories.map((m) => ({
        ...m,
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdBy: user?.id || "unknown",
        createdByName: user?.name || "Unknown User",
        updatedAt: new Date().toISOString(),
      }))

      setMemories((prev) => [...processedMemories, ...prev])
      setIsLoading(false)

      return processedMemories.length
    } catch (error) {
      setIsLoading(false)
      throw new Error("Invalid import data format")
    }
  }

  const value: MemoryContextType = {
    memories,
    isLoading,
    createMemory,
    updateMemory,
    deleteMemory,
    getMemoryById,
    getMemoriesForItem,
    searchMemories,
    getRecentMemories,
    getRelatedMemories,
    getMemoryStats,
    getMemoryTags,
    linkMemories,
    unlinkMemories,
    addAttachment,
    removeAttachment,
    bulkDeleteMemories,
    bulkUpdateMemories,
    exportMemories,
    importMemories,
  }

  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
}

export function useMemory() {
  const context = useContext(MemoryContext)
  if (context === undefined) {
    throw new Error("useMemory must be used within a MemoryProvider")
  }
  return context
}
