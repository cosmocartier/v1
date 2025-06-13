import type { Initiative, Operation, Task } from "./strategic-context"

export interface GraphNode {
  id: string
  title: string
  type: "initiative" | "operation" | "milestone" | "task"
  color: string
  size: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  progress?: number
  status?: string
  priority?: string
  description?: string
  dueDate?: string
  assignee?: string
  parentId?: string
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: "contains" | "depends" | "relates"
  strength?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface GraphSettings {
  // Visual settings
  textFadeThreshold: number
  nodeSize: number
  lineThickness: number

  // Physics settings
  centerForce: number
  repelForce: number
  linkForce: number
  linkDistance: number

  // Filter settings
  showInitiatives: boolean
  showOperations: boolean
  showMilestones: boolean
  showTasks: boolean
}

export const defaultGraphSettings: GraphSettings = {
  textFadeThreshold: 10,
  nodeSize: 1,
  lineThickness: 2,
  centerForce: -100,
  repelForce: -300,
  linkForce: 0.5,
  linkDistance: 100,
  showInitiatives: true,
  showOperations: true,
  showMilestones: true,
  showTasks: true,
}

export class GraphDataProcessor {
  private getNodeColor(type: string): string {
    switch (type) {
      case "initiative":
        return "#8b5cf6" // Strong purple
      case "operation":
        return "#3b82f6" // Medium blue
      case "milestone":
        return "#10b981" // Light green
      case "task":
        return "#64748b" // Subtle gray
      default:
        return "#9ca3af"
    }
  }

  private getNodeSize(type: string, baseSize: number): number {
    const multiplier = baseSize
    switch (type) {
      case "initiative":
        return 25 * multiplier
      case "operation":
        return 20 * multiplier
      case "milestone":
        return 15 * multiplier
      case "task":
        return 10 * multiplier
      default:
        return 12 * multiplier
    }
  }

  processData(
    initiatives: Initiative[],
    operations: Operation[],
    milestones: any[], // Using any[] since milestones come from initiatives
    tasks: Task[],
    settings: GraphSettings,
  ): GraphData {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []

    // Process initiatives
    initiatives.forEach((initiative) => {
      nodes.push({
        id: initiative.id,
        title: initiative.title,
        type: "initiative",
        color: this.getNodeColor("initiative"),
        size: this.getNodeSize("initiative", settings.nodeSize),
        progress: initiative.progress,
        status: initiative.status,
        priority: initiative.priority,
        description: initiative.description,
        dueDate: initiative.dueDate,
        assignee: initiative.owner,
      })

      // Process milestones for this initiative
      initiative.milestones?.forEach((milestone) => {
        nodes.push({
          id: milestone.id,
          title: milestone.title,
          type: "milestone",
          color: this.getNodeColor("milestone"),
          size: this.getNodeSize("milestone", settings.nodeSize),
          progress: milestone.progress,
          status: milestone.status,
          description: milestone.description,
          dueDate: milestone.dueDate,
          assignee: milestone.assigneeId,
          parentId: initiative.id,
        })

        // Link milestone to initiative
        links.push({
          source: initiative.id,
          target: milestone.id,
          type: "contains",
        })
      })
    })

    // Process operations
    operations.forEach((operation) => {
      nodes.push({
        id: operation.id,
        title: operation.title,
        type: "operation",
        color: this.getNodeColor("operation"),
        size: this.getNodeSize("operation", settings.nodeSize),
        progress: operation.progress,
        status: operation.status,
        priority: operation.priority,
        description: operation.description,
        dueDate: operation.dueDate,
        assignee: operation.owner,
      })

      // Link operations to their initiatives
      operation.initiativeIds?.forEach((initiativeId) => {
        links.push({
          source: initiativeId,
          target: operation.id,
          type: "contains",
        })
      })
    })

    // Process tasks
    tasks.forEach((task) => {
      nodes.push({
        id: task.id,
        title: task.title,
        type: "task",
        color: this.getNodeColor("task"),
        size: this.getNodeSize("task", settings.nodeSize),
        progress: task.status === "Completed" ? 100 : task.status === "In Progress" ? 50 : 0,
        status: task.status,
        priority: task.priority,
        description: task.description,
        dueDate: task.dueDate,
        assignee: task.assigneeName,
        parentId: task.strategicItemId,
      })

      // Link tasks to their parent items (initiatives or operations)
      if (task.strategicItemId) {
        links.push({
          source: task.strategicItemId,
          target: task.id,
          type: "contains",
        })
      }
    })

    // Add dependency links for milestones
    initiatives.forEach((initiative) => {
      initiative.milestones?.forEach((milestone, index) => {
        if (index > 0) {
          const previousMilestone = initiative.milestones[index - 1]
          links.push({
            source: previousMilestone.id,
            target: milestone.id,
            type: "depends",
          })
        }
      })
    })

    return { nodes, links }
  }

  filterData(data: GraphData, settings: GraphSettings): GraphData {
    const filteredNodes = data.nodes.filter((node) => {
      switch (node.type) {
        case "initiative":
          return settings.showInitiatives
        case "operation":
          return settings.showOperations
        case "milestone":
          return settings.showMilestones
        case "task":
          return settings.showTasks
        default:
          return true
      }
    })

    const nodeIds = new Set(filteredNodes.map((node) => node.id))
    const filteredLinks = data.links.filter((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id
      const targetId = typeof link.target === "string" ? link.target : link.target.id
      return nodeIds.has(sourceId) && nodeIds.has(targetId)
    })

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    }
  }
}
