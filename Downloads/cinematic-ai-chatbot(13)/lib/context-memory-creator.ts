import type { Memory } from "./memory-types"
import type { AIAgent } from "./agents/agent-types"

interface ContextItem {
  id: string
  type: string
  title: string
  description?: string
}

export async function createContextMemory(
  createMemoryFn: (
    memory: Omit<Memory, "id" | "createdAt" | "updatedAt" | "createdBy" | "createdByName">,
  ) => Promise<Memory>,
  contextItems: ContextItem[],
  agent?: AIAgent,
  userId?: string,
) {
  if (!contextItems.length) return null

  // Group items by type
  const groupedItems = contextItems.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = []
      }
      acc[item.type].push(item)
      return acc
    },
    {} as Record<string, ContextItem[]>,
  )

  // Create a summary of the context
  const contextSummary = Object.entries(groupedItems)
    .map(([type, items]) => {
      return `${type.charAt(0).toUpperCase() + type.slice(1)}s (${items.length}): ${items.map((i) => i.title).join(", ")}`
    })
    .join("\n")

  // Create a detailed content with all items
  const detailedContent = Object.entries(groupedItems)
    .map(([type, items]) => {
      const typeHeader = `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`
      const itemsContent = items
        .map((item) => {
          return `### ${item.title}\n${item.description || "No description provided."}\n`
        })
        .join("\n")
      return typeHeader + itemsContent
    })
    .join("\n")

  // Create the memory
  const agentInfo = agent ? `with ${agent.name} (${agent.category})` : ""
  const memory: Omit<Memory, "id" | "createdAt" | "updatedAt" | "createdBy" | "createdByName"> = {
    title: `Chat Context ${agentInfo} - ${new Date().toLocaleDateString()}`,
    content: `# Chat Context Summary\n\nThis memory contains the context used for a chat session ${agentInfo} on ${new Date().toLocaleString()}.\n\n## Summary\n\n${contextSummary}\n\n## Detailed Context\n\n${detailedContent}`,
    type: "reference",
    tags: ["chat-context", "auto-generated", ...(agent ? [agent.id, agent.category] : [])],
    priority: "Medium",
    visibility: "private",
    itemId: contextItems[0].id, // Use the first item as the primary reference
    itemType: contextItems[0].type as any,
    relatedMemories: [],
    attachments: [],
  }

  return await createMemoryFn(memory)
}
