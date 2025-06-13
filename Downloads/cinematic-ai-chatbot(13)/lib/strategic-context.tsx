"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useAuth } from "./auth-context"
import { StorageManager } from "./utils/storage-manager"
import { PredictionEngine, type OperationPrediction } from "./ai-predictions"
import type {
  Task,
  Initiative as InitiativeType,
  Operation as OperationType,
  Activity as ActivityType,
  KPI as KPIType,
  TeamMember as TeamMemberType,
  Milestone as MilestoneType,
  Risk as RiskType,
} from "./types"

// Enhanced Types for Live Data
export interface KPI extends KPIType {}

export interface TeamMember extends TeamMemberType {}

export interface Activity extends ActivityType {}

export interface Milestone extends MilestoneType {
  id: string
  title: string
  description?: string
  dueDate: string
  status: "not-started" | "in-progress" | "completed" | "delayed"
  progress: number
  assigneeId?: string
  createdAt: string
  completedAt?: string
}

export interface Risk extends RiskType {
  id: string
  title: string
  description?: string
  impact: "low" | "medium" | "high"
  probability: "low" | "medium" | "high"
  status: "active" | "monitoring" | "mitigated" | "closed"
  mitigationPlan?: string
  ownerId?: string
  createdAt: string
  updatedAt: string
}

// Extended Initiative and Operation interfaces
export interface Initiative extends InitiativeType {
  id: string
  title: string
  desiredOutcome: string
  successMetric: string
  owner: string
  priority: "Low" | "Medium" | "High" | "Critical"
  dueDate: string
  description?: string
  strategicAlignment?: string
  visibility: "Public" | "Private" | "Team"
  milestones: Milestone[]
  kpis: KPI[]
  teamMembers: TeamMember[]
  createdAt: string
  updatedAt: string
  progress: number
  status: "Not Started" | "In Progress" | "At Risk" | "On Hold" | "Completed"
}

export interface StatusHistoryEntry {
  status: string
  timestamp: string
  duration?: number
}

export interface ProgressHistoryEntry {
  progress: number
  timestamp: string
  note?: string
}

export interface Operation extends OperationType {
  id: string
  title: string
  initiativeIds: string[]
  deliverable: string
  owner: string
  status: "Not Started" | "In Progress" | "Blocked" | "Completed" | "On Hold"
  priority: "Low" | "Medium" | "High" | "Critical"
  dueDate: string
  description?: string
  dependencies?: string[]
  risks: Risk[]
  resources?: string[]
  teamMembers: TeamMember[]
  createdAt: string
  updatedAt: string
  progress: number
  startDate?: string
  completedDate?: string
  statusHistory: StatusHistoryEntry[]
  progressHistory: ProgressHistoryEntry[]
  estimatedHours?: number
  actualHours?: number
  complexity?: "Low" | "Medium" | "High"
  prediction?: OperationPrediction
}

interface StrategicContextType {
  // State
  initiatives: Initiative[]
  operations: Operation[]
  activities: Activity[]
  tasks: Task[]
  isLoading: boolean
  predictionEngine: PredictionEngine

  // Initiative methods
  createInitiative: (
    initiativeData: Omit<
      Initiative,
      "id" | "createdAt" | "updatedAt" | "progress" | "milestones" | "kpis" | "teamMembers" | "status"
    >,
  ) => Promise<Initiative>
  updateInitiative: (id: string, updates: Partial<Initiative>) => Promise<Initiative>
  deleteInitiative: (id: string) => Promise<void>
  getInitiativeById: (id: string) => Initiative | undefined

  // Operation methods
  createOperation: (
    operationData: Omit<
      Operation,
      "id" | "createdAt" | "updatedAt" | "statusHistory" | "progressHistory" | "risks" | "teamMembers"
    >,
  ) => Promise<Operation>
  updateOperation: (id: string, updates: Partial<Operation>) => Promise<Operation>
  deleteOperation: (id: string) => Promise<void>
  getOperationById: (id: string) => Operation | undefined
  getOperationsForInitiative: (initiativeId: string) => Operation[]

  // Team methods
  getTeamMemberById: (memberId: string) => TeamMember | undefined
  addTeamMember: (
    itemId: string,
    itemType: "initiative" | "operation",
    member: Omit<TeamMember, "id" | "joinedAt" | "lastActive">,
  ) => Promise<void>
  updateTeamMemberStatus: (memberId: string, status: TeamMember["status"]) => Promise<void>

  // Task methods
  createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "status">) => Promise<Task>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void>
  getTaskById: (taskId: string) => Task | undefined
  getTasksForItem: (itemId: string, itemType: "initiative" | "operation") => Task[]
  getTasksByAssignee: (assigneeId: string) => Task[]

  // KPI methods
  updateKPI: (
    itemId: string,
    itemType: "initiative" | "operation",
    kpiId: string,
    updates: Partial<KPI>,
  ) => Promise<void>
  addKPI: (itemId: string, itemType: "initiative" | "operation", kpi: Omit<KPI, "id" | "updatedAt">) => Promise<void>

  // Milestone methods
  updateMilestone: (initiativeId: string, milestoneId: string, updates: Partial<Milestone>) => Promise<void>
  addMilestone: (initiativeId: string, milestone: Omit<Milestone, "id" | "createdAt">) => Promise<void>
  deleteMilestone: (initiativeId: string, milestoneId: string) => Promise<void>

  // Risk methods
  updateRisk: (operationId: string, riskId: string, updates: Partial<Risk>) => Promise<void>
  addRisk: (operationId: string, risk: Omit<Risk, "id" | "createdAt" | "updatedAt">) => Promise<void>

  // Activity methods
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<void>
  getActivitiesForItem: (itemId: string, itemType: "initiative" | "operation") => Activity[]

  // Prediction methods
  generatePrediction: (operationId: string) => Promise<OperationPrediction | null>
  updatePredictions: () => Promise<void>

  // Utility methods
  calculateInitiativeProgress: (initiativeId: string) => number
  getTeamCollaborationScore: (itemId: string, itemType: "initiative" | "operation") => number
  getTaskCompletionRate: (itemId: string, itemType: "initiative" | "operation") => number
}

const StrategicContext = createContext<StrategicContextType | undefined>(undefined)

export function StrategicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [predictionEngine] = useState(() => new PredictionEngine())
  const storage = StorageManager.getInstance()

  // Load data from storage on mount
  useEffect(() => {
    const load = async () => {
      if (!user) return

      const savedInitiatives = await storage.getItem<any[]>(`initiatives_${user.id}`)
      const savedOperations = await storage.getItem<any[]>(`operations_${user.id}`)
      const savedActivities = await storage.getItem<any[]>(`activities_${user.id}`)
      const savedTasks = await storage.getItem<any[]>(`tasks_${user.id}`)

      if (savedInitiatives) {
        try {
          const normalizedInitiatives = savedInitiatives.map((init: any) => ({
            ...init,
            milestones: init.milestones || [],
            kpis: init.kpis || [],
            teamMembers: init.teamMembers || [],
            status: init.status || "In Progress",
          }))
          setInitiatives(normalizedInitiatives)
        } catch (error) {
          console.error("Error parsing initiatives:", error)
          setInitiatives([])
        }
      }

      if (savedOperations) {
        try {
          const normalizedOperations = savedOperations.map((op: any) => ({
            ...op,
            statusHistory: op.statusHistory || [{ status: op.status, timestamp: op.createdAt }],
            progressHistory: op.progressHistory || [{ progress: op.progress || 0, timestamp: op.createdAt }],
            risks: op.risks || [],
            teamMembers: op.teamMembers || [],
          }))
          setOperations(normalizedOperations)
        } catch (error) {
          console.error("Error parsing operations:", error)
          setOperations([])
        }
      }

      if (savedActivities) {
        try {
          setActivities(savedActivities)
        } catch (error) {
          console.error("Error parsing activities:", error)
          setActivities([])
        }
      }

      if (savedTasks) {
        try {
          setTasks(savedTasks)
        } catch (error) {
          console.error("Error parsing tasks:", error)
          setTasks([])
        }
      }
    }

    load()
  }, [user])

  // Save to storage whenever data changes
  useEffect(() => {
    const save = async () => {
      if (user) {
        const success = await storage.setItem(`initiatives_${user.id}`, initiatives)
        if (!success) {
          await storage.performMaintenance("local")
        }
      }
    }
    save()
  }, [initiatives, user])

  useEffect(() => {
    const save = async () => {
      if (user) {
        const success = await storage.setItem(`operations_${user.id}`, operations)
        if (!success) {
          await storage.performMaintenance("local")
        }
      }
    }
    save()
  }, [operations, user])

  useEffect(() => {
    const save = async () => {
      if (user) {
        const success = await storage.setItem(`activities_${user.id}`, activities)
        if (!success) {
          await storage.performMaintenance("local")
        }
      }
    }
    save()
  }, [activities, user])

  useEffect(() => {
    const save = async () => {
      if (user) {
        const success = await storage.setItem(`tasks_${user.id}`, tasks)
        if (!success) {
          await storage.performMaintenance("local")
        }
      }
    }
    save()
  }, [tasks, user])

  // Train prediction engine when operations change
  useEffect(() => {
    if (operations.length > 0) {
      predictionEngine.trainModel(operations)
    }
  }, [operations, predictionEngine])

  const logActivity = useCallback(async (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev])
    return newActivity
  }, [])

  // Initiative methods
  const createInitiative = useCallback(
    async (
      initiativeData: Omit<
        Initiative,
        "id" | "createdAt" | "updatedAt" | "progress" | "milestones" | "kpis" | "teamMembers" | "status"
      >,
    ): Promise<Initiative> => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        const now = new Date().toISOString()
        const id = `init-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Process milestones if they exist
        const processedMilestones: Milestone[] = Array.isArray(initiativeData.milestones)
          ? initiativeData.milestones.map((milestone) => {
              // If milestone is already a Milestone object
              if (typeof milestone === "object" && milestone.id) {
                return milestone as Milestone
              }
              // If milestone is a string (title only)
              return {
                id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: typeof milestone === "string" ? milestone : "Untitled Milestone",
                status: "not-started" as const,
                progress: 0,
                dueDate: initiativeData.dueDate,
                createdAt: now,
              }
            })
          : []

        const newInitiative: Initiative = {
          ...initiativeData,
          id,
          createdAt: now,
          updatedAt: now,
          progress: 0,
          status: "Not Started",
          milestones: processedMilestones,
          kpis: [],
          teamMembers: [],
        }

        setInitiatives((prev) => [...prev, newInitiative])

        await logActivity({
          type: "update",
          title: `Initiative "${newInitiative.title}" created`,
          userId: user?.id || "system",
          userName: user?.name || "System",
          itemId: newInitiative.id,
          itemType: "initiative",
        })

        return newInitiative
      } catch (error) {
        console.error("Error creating initiative:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user, logActivity],
  )

  const updateInitiative = useCallback(
    async (id: string, updates: Partial<Initiative>): Promise<Initiative> => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        return new Promise<Initiative>((resolve, reject) => {
          setInitiatives((prev) => {
            const initiative = prev.find((i) => i.id === id)
            if (!initiative) {
              reject(new Error(`Initiative with ID ${id} not found`))
              return prev
            }

            const updatedInitiative = {
              ...initiative,
              ...updates,
              updatedAt: new Date().toISOString(),
            }

            // Log status changes
            if (updates.status && updates.status !== initiative.status) {
              logActivity({
                type: "status_change",
                title: `Status changed from "${initiative.status}" to "${updates.status}"`,
                userId: user?.id || "system",
                userName: user?.name || "System",
                itemId: id,
                itemType: "initiative",
                metadata: { oldStatus: initiative.status, newStatus: updates.status },
              })
            }

            resolve(updatedInitiative)
            return prev.map((i) => (i.id === id ? updatedInitiative : i))
          })
        })
      } catch (error) {
        console.error("Error updating initiative:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [user, logActivity],
  )

  const deleteInitiative = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const initiative = initiatives.find((i) => i.id === id)
        if (initiative) {
          await logActivity({
            type: "update",
            title: `Initiative "${initiative.title}" deleted`,
            userId: user?.id || "system",
            userName: user?.name || "System",
            itemId: id,
            itemType: "initiative",
          })
        }

        setOperations((prev) => prev.filter((op) => !op.initiativeIds.includes(id)))
        setInitiatives((prev) => prev.filter((i) => i.id !== id))
      } catch (error) {
        console.error("Error deleting initiative:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [initiatives, user, logActivity],
  )

  const getInitiativeById = useCallback(
    (id: string): Initiative | undefined => {
      return initiatives.find((i) => i.id === id)
    },
    [initiatives],
  )

  // Operation methods
  const createOperation = useCallback(
    async (
      operationData: Omit<
        Operation,
        "id" | "createdAt" | "updatedAt" | "statusHistory" | "progressHistory" | "risks" | "teamMembers"
      >,
    ): Promise<Operation> => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        const now = new Date().toISOString()
        const newOperation: Operation = {
          ...operationData,
          id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
          statusHistory: [{ status: operationData.status, timestamp: now }],
          progressHistory: [{ progress: operationData.progress || 0, timestamp: now }],
          risks: [],
          teamMembers: [],
        }

        const prediction = await predictionEngine.predict(newOperation, operations)
        if (prediction) {
          newOperation.prediction = prediction
        }

        setOperations((prev) => [...prev, newOperation])

        await logActivity({
          type: "update",
          title: `Operation "${newOperation.title}" created`,
          userId: user?.id || "system",
          userName: user?.name || "System",
          itemId: newOperation.id,
          itemType: "operation",
        })

        // Update initiative progress for linked initiatives
        for (const initiativeId of operationData.initiativeIds) {
          const progress = calculateInitiativeProgress(initiativeId)
          await updateInitiative(initiativeId, { progress })
        }

        return newOperation
      } catch (error) {
        console.error("Error creating operation:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [operations, predictionEngine, user, logActivity],
  )

  const updateOperation = useCallback(
    async (id: string, updates: Partial<Operation>): Promise<Operation> => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        return new Promise<Operation>((resolve, reject) => {
          setOperations((prev) => {
            const operation = prev.find((op) => op.id === id)
            if (!operation) {
              reject(new Error(`Operation with ID ${id} not found`))
              return prev
            }

            const now = new Date().toISOString()

            const statusHistory = [...operation.statusHistory]
            if (updates.status && updates.status !== operation.status) {
              const lastEntry = statusHistory[statusHistory.length - 1]
              if (lastEntry) {
                const duration = Math.round(
                  (new Date(now).getTime() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60 * 24),
                )
                lastEntry.duration = duration
              }
              statusHistory.push({ status: updates.status, timestamp: now })

              logActivity({
                type: "status_change",
                title: `Status changed from "${operation.status}" to "${updates.status}"`,
                userId: user?.id || "system",
                userName: user?.name || "System",
                itemId: id,
                itemType: "operation",
                metadata: { oldStatus: operation.status, newStatus: updates.status },
              })
            }

            const progressHistory = [...operation.progressHistory]
            if (updates.progress !== undefined && updates.progress !== operation.progress) {
              progressHistory.push({ progress: updates.progress, timestamp: now })
            }

            let completedDate = operation.completedDate
            if (updates.status === "Completed" && operation.status !== "Completed") {
              completedDate = now
            }

            const updatedOperation = {
              ...operation,
              ...updates,
              updatedAt: now,
              statusHistory,
              progressHistory,
              completedDate,
            }

            // Update predictions
            predictionEngine.predict(updatedOperation, prev).then((prediction) => {
              if (prediction) {
                updatedOperation.prediction = prediction
              }
            })

            // Update initiative progress for linked initiatives
            operation.initiativeIds.forEach(async (initiativeId) => {
              const progress = calculateInitiativeProgress(initiativeId)
              await updateInitiative(initiativeId, { progress })
            })

            resolve(updatedOperation)
            return prev.map((op) => (op.id === id ? updatedOperation : op))
          })
        })
      } catch (error) {
        console.error("Error updating operation:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [predictionEngine, user, logActivity],
  )

  const deleteOperation = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        const operation = operations.find((op) => op.id === id)
        if (operation) {
          await logActivity({
            type: "update",
            title: `Operation "${operation.title}" deleted`,
            userId: user?.id || "system",
            userName: user?.name || "System",
            itemId: id,
            itemType: "operation",
          })

          setOperations((prev) => prev.filter((op) => op.id !== id))

          // Update initiative progress for linked initiatives
          for (const initiativeId of operation.initiativeIds) {
            const progress = calculateInitiativeProgress(initiativeId)
            await updateInitiative(initiativeId, { progress })
          }
        }
      } catch (error) {
        console.error("Error deleting operation:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [operations, user, logActivity],
  )

  const getOperationById = useCallback(
    (id: string): Operation | undefined => {
      return operations.find((op) => op.id === id)
    },
    [operations],
  )

  const getOperationsForInitiative = useCallback(
    (initiativeId: string): Operation[] => {
      return operations.filter((op) => op.initiativeIds.includes(initiativeId))
    },
    [operations],
  )

  // KPI methods
  const updateKPI = useCallback(
    async (
      itemId: string,
      itemType: "initiative" | "operation",
      kpiId: string,
      updates: Partial<KPI>,
    ): Promise<void> => {
      const now = new Date().toISOString()

      if (itemType === "initiative") {
        setInitiatives((prev) =>
          prev.map((init) => {
            if (init.id === itemId) {
              return {
                ...init,
                kpis: init.kpis.map((kpi) => (kpi.id === kpiId ? { ...kpi, ...updates, updatedAt: now } : kpi)),
                updatedAt: now,
              }
            }
            return init
          }),
        )
      }

      await logActivity({
        type: "update",
        title: `KPI "${updates.name || "metric"}" updated`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId,
        itemType,
      })
    },
    [user, logActivity],
  )

  const addKPI = useCallback(
    async (itemId: string, itemType: "initiative" | "operation", kpi: Omit<KPI, "id" | "updatedAt">): Promise<void> => {
      const newKPI: KPI = {
        ...kpi,
        id: `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date().toISOString(),
      }

      if (itemType === "initiative") {
        setInitiatives((prev) =>
          prev.map((init) =>
            init.id === itemId ? { ...init, kpis: [...init.kpis, newKPI], updatedAt: new Date().toISOString() } : init,
          ),
        )
      }

      await logActivity({
        type: "update",
        title: `New KPI "${kpi.name}" added`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId,
        itemType,
      })
    },
    [user, logActivity],
  )

  // Team methods
  const addTeamMember = useCallback(
    async (
      itemId: string,
      itemType: "initiative" | "operation",
      member: Omit<TeamMember, "id" | "joinedAt" | "lastActive">,
    ): Promise<void> => {
      const now = new Date().toISOString()
      const newMember: TeamMember = {
        ...member,
        id: `tm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        joinedAt: now,
        lastActive: now,
      }

      if (itemType === "initiative") {
        setInitiatives((prev) =>
          prev.map((init) =>
            init.id === itemId ? { ...init, teamMembers: [...init.teamMembers, newMember], updatedAt: now } : init,
          ),
        )
      } else {
        setOperations((prev) =>
          prev.map((op) =>
            op.id === itemId ? { ...op, teamMembers: [...op.teamMembers, newMember], updatedAt: now } : op,
          ),
        )
      }

      await logActivity({
        type: "update",
        title: `${member.name} added to team`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId,
        itemType,
      })
    },
    [user, logActivity],
  )

  const updateTeamMemberStatus = useCallback(async (memberId: string, status: TeamMember["status"]): Promise<void> => {
    const now = new Date().toISOString()

    setInitiatives((prev) =>
      prev.map((init) => ({
        ...init,
        teamMembers: init.teamMembers.map((member) =>
          member.id === memberId ? { ...member, status, lastActive: now } : member,
        ),
      })),
    )

    setOperations((prev) =>
      prev.map((op) => ({
        ...op,
        teamMembers: op.teamMembers.map((member) =>
          member.id === memberId ? { ...member, status, lastActive: now } : member,
        ),
      })),
    )
  }, [])

  // Activity methods
  const addActivity = useCallback(
    async (activity: Omit<Activity, "id" | "timestamp">): Promise<void> => {
      await logActivity(activity)
    },
    [logActivity],
  )

  const getActivitiesForItem = useCallback(
    (itemId: string, itemType: "initiative" | "operation"): Activity[] => {
      return activities
        .filter((activity) => activity.itemId === itemId && activity.itemType === itemType)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    [activities],
  )

  // Milestone methods
  const updateMilestone = useCallback(
    async (initiativeId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void> => {
      const now = new Date().toISOString()

      setInitiatives((prev) =>
        prev.map((init) => {
          if (init.id === initiativeId) {
            return {
              ...init,
              milestones: init.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? {
                      ...milestone,
                      ...updates,
                      completedAt: updates.status === "completed" ? now : milestone.completedAt,
                    }
                  : milestone,
              ),
              updatedAt: now,
            }
          }
          return init
        }),
      )

      await logActivity({
        type: "milestone",
        title: `Milestone updated: ${updates.title || "milestone"}`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId: initiativeId,
        itemType: "initiative",
      })
    },
    [user, logActivity],
  )

  const addMilestone = useCallback(
    async (initiativeId: string, milestone: Omit<Milestone, "id" | "createdAt">): Promise<void> => {
      const newMilestone: Milestone = {
        ...milestone,
        id: `ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }

      setInitiatives((prev) =>
        prev.map((init) =>
          init.id === initiativeId
            ? { ...init, milestones: [...init.milestones, newMilestone], updatedAt: new Date().toISOString() }
            : init,
        ),
      )

      await logActivity({
        type: "milestone",
        title: `New milestone added: ${milestone.title}`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId: initiativeId,
        itemType: "initiative",
      })
    },
    [user, logActivity],
  )

  const deleteMilestone = useCallback(
    async (initiativeId: string, milestoneId: string): Promise<void> => {
      const initiative = initiatives.find((i) => i.id === initiativeId)
      const milestone = initiative?.milestones.find((m) => m.id === milestoneId)

      if (milestone) {
        setInitiatives((prev) =>
          prev.map((init) =>
            init.id === initiativeId
              ? {
                  ...init,
                  milestones: init.milestones.filter((m) => m.id !== milestoneId),
                  updatedAt: new Date().toISOString(),
                }
              : init,
          ),
        )

        await logActivity({
          type: "milestone",
          title: `Milestone deleted: ${milestone.title}`,
          userId: user?.id || "system",
          userName: user?.name || "System",
          itemId: initiativeId,
          itemType: "initiative",
        })
      }
    },
    [initiatives, user, logActivity],
  )

  // Risk methods
  const updateRisk = useCallback(
    async (operationId: string, riskId: string, updates: Partial<Risk>): Promise<void> => {
      const now = new Date().toISOString()

      setOperations((prev) =>
        prev.map((op) => {
          if (op.id === operationId) {
            return {
              ...op,
              risks: op.risks.map((risk) => (risk.id === riskId ? { ...risk, ...updates, updatedAt: now } : risk)),
              updatedAt: now,
            }
          }
          return op
        }),
      )

      await logActivity({
        type: "risk",
        title: `Risk updated: ${updates.title || "risk"}`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId: operationId,
        itemType: "operation",
      })
    },
    [user, logActivity],
  )

  const addRisk = useCallback(
    async (operationId: string, risk: Omit<Risk, "id" | "createdAt" | "updatedAt">): Promise<void> => {
      const now = new Date().toISOString()
      const newRisk: Risk = {
        ...risk,
        id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      }

      setOperations((prev) =>
        prev.map((op) => (op.id === operationId ? { ...op, risks: [...op.risks, newRisk], updatedAt: now } : op)),
      )

      await logActivity({
        type: "risk",
        title: `New risk identified: ${risk.title}`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId: operationId,
        itemType: "operation",
      })
    },
    [user, logActivity],
  )

  // Prediction methods
  const generatePrediction = useCallback(
    async (operationId: string): Promise<OperationPrediction | null> => {
      const operation = getOperationById(operationId)
      if (!operation) return null
      return await predictionEngine.predict(operation, operations)
    },
    [getOperationById, predictionEngine, operations],
  )

  const updatePredictions = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    const updatedOperations = await Promise.all(
      operations.map(async (operation) => {
        if (operation.status !== "Completed") {
          const prediction = await predictionEngine.predict(operation, operations)
          return { ...operation, prediction }
        }
        return operation
      }),
    )
    setOperations(updatedOperations)
    setIsLoading(false)
  }, [operations, predictionEngine])

  // Utility methods
  const calculateInitiativeProgress = useCallback(
    (initiativeId: string): number => {
      const linkedOperations = getOperationsForInitiative(initiativeId)
      const initiative = getInitiativeById(initiativeId)

      if (!initiative) return 0

      // Calculate progress based on milestones and operations
      const milestoneProgress =
        initiative.milestones.reduce((sum, milestone) => sum + milestone.progress, 0) / initiative.milestones.length ||
        0
      const operationProgress =
        linkedOperations.length > 0
          ? linkedOperations.reduce((sum, op) => sum + op.progress, 0) / linkedOperations.length
          : 0

      // Weight milestones more heavily than operations
      return Math.round(milestoneProgress * 0.7 + operationProgress * 0.3)
    },
    [getOperationsForInitiative, getInitiativeById],
  )

  const getTeamCollaborationScore = useCallback(
    (itemId: string, itemType: "initiative" | "operation"): number => {
      const activities = getActivitiesForItem(itemId, itemType)
      const recentActivities = activities.filter(
        (activity) => new Date(activity.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      )

      // Simple collaboration score based on activity frequency and diversity
      const uniqueUsers = new Set(recentActivities.map((a) => a.userId)).size
      const activityTypes = new Set(recentActivities.map((a) => a.type)).size

      return Math.min(100, uniqueUsers * 20 + activityTypes * 15 + recentActivities.length * 2)
    },
    [getActivitiesForItem],
  )

  const getTaskCompletionRate = useCallback(
    (itemId: string, itemType: "initiative" | "operation"): number => {
      if (itemType === "initiative") {
        const initiative = getInitiativeById(itemId)
        if (!initiative) return 0

        const completedMilestones = initiative.milestones.filter((m) => m.status === "completed").length
        return initiative.milestones.length > 0
          ? Math.round((completedMilestones / initiative.milestones.length) * 100)
          : 0
      } else {
        const operation = getOperationById(itemId)
        return operation?.progress || 0
      }
    },
    [getInitiativeById, getOperationById],
  )

  const getTeamMemberById = useCallback(
    (memberId: string): TeamMember | undefined => {
      for (const init of initiatives) {
        const member = init.teamMembers.find((tm) => tm.id === memberId)
        if (member) return member
      }
      for (const op of operations) {
        const member = op.teamMembers.find((tm) => tm.id === memberId)
        if (member) return member
      }
      return undefined
    },
    [initiatives, operations],
  )

  const createTask = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "status">): Promise<Task> => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const now = new Date().toISOString()
      const assignee = taskData.assigneeId ? getTeamMemberById(taskData.assigneeId) : undefined

      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "To Do",
        assigneeName: assignee?.name,
        createdAt: now,
        updatedAt: now,
        creatorId: user?.id,
      }

      setTasks((prev) => [...prev, newTask])
      await logActivity({
        type: "update",
        title: `Task created: "${newTask.title}"`,
        userId: user?.id || "system",
        userName: user?.name || "System",
        itemId: newTask.strategicItemId || newTask.id,
        itemType: newTask.strategicItemType || "task",
      })
      setIsLoading(false)
      return newTask
    },
    [user, getTeamMemberById, logActivity],
  )

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>): Promise<Task> => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 300))

      let updatedTask: Task | undefined
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const newAssigneeId = updates.assigneeId !== undefined ? updates.assigneeId : task.assigneeId
            const assignee = newAssigneeId ? getTeamMemberById(newAssigneeId) : undefined

            updatedTask = {
              ...task,
              ...updates,
              assigneeName: updates.assigneeId !== undefined ? assignee?.name : task.assigneeName,
              updatedAt: new Date().toISOString(),
            }
            if (updates.status === "Completed" && task.status !== "Completed") {
              updatedTask.completedAt = new Date().toISOString()
            }
            return updatedTask
          }
          return task
        }),
      )
      setIsLoading(false)
      if (!updatedTask) throw new Error("Task not found for update")
      return updatedTask
    },
    [getTeamMemberById],
  )

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }, [])

  const getTaskById = useCallback(
    (taskId: string): Task | undefined => {
      return tasks.find((task) => task.id === taskId)
    },
    [tasks],
  )

  const getTasksForItem = useCallback(
    (itemId: string, itemType: "initiative" | "operation"): Task[] => {
      return tasks.filter((t) => t.strategicItemId === itemId && t.strategicItemType === itemType)
    },
    [tasks],
  )

  const getTasksByAssignee = useCallback(
    (assigneeId: string): Task[] => {
      return tasks.filter((t) => t.assigneeId === assigneeId)
    },
    [tasks],
  )

  const value: StrategicContextType = {
    // State
    initiatives,
    operations,
    activities,
    tasks,
    isLoading,
    predictionEngine,

    // Initiative methods
    createInitiative,
    updateInitiative,
    deleteInitiative,
    getInitiativeById,

    // Operation methods
    createOperation,
    updateOperation,
    deleteOperation,
    getOperationById,
    getOperationsForInitiative,

    // Team methods
    getTeamMemberById,
    addTeamMember,
    updateTeamMemberStatus,

    // Task methods
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksForItem,
    getTasksByAssignee,

    // KPI methods
    updateKPI,
    addKPI,

    // Milestone methods
    updateMilestone,
    addMilestone,
    deleteMilestone,

    // Risk methods
    updateRisk,
    addRisk,

    // Activity methods
    addActivity,
    getActivitiesForItem,

    // Prediction methods
    generatePrediction,
    updatePredictions,

    // Utility methods
    calculateInitiativeProgress,
    getTeamCollaborationScore,
    getTaskCompletionRate,
  }

  return <StrategicContext.Provider value={value}>{children}</StrategicContext.Provider>
}

export function useStrategic() {
  const context = useContext(StrategicContext)
  if (context === undefined) {
    throw new Error("useStrategic must be used within a StrategicProvider")
  }
  return context
}
