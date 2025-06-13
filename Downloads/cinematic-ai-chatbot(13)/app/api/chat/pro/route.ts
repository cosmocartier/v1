import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Task, TeamMember, Memory } from "@/lib/types"
import { getAgentById } from "@/lib/agents/agent-registry"
import { PromptProcessor } from "@/lib/agents/prompt-processor"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }

    const body = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string; id?: string; name?: string }>
      agentId?: string
      strategicItems?: any[]
      allTasks?: Task[]
      allTeamMembers?: TeamMember[]
      memories?: Memory[]
      agentInitialized?: boolean
      contextInitialized?: boolean
      hasUserInteracted?: boolean
    }

    const {
      messages: clientMessages,
      agentId,
      strategicItems = [],
      allTasks = [],
      allTeamMembers = [],
      memories = [],
      agentInitialized = false,
      contextInitialized = false,
      hasUserInteracted = false,
    } = body

    console.log("API Request:", {
      agentId,
      agentInitialized,
      contextInitialized,
      hasUserInteracted,
      strategicItemsCount: strategicItems.length,
      messagesCount: clientMessages.length,
    })

    // Get the selected agent
    const agent = agentId ? getAgentById(agentId) : null

    if (!agent) {
      throw new Error("No agent selected for Pro Mode")
    }

    // Only check if agent is initialized - remove the hasUserInteracted check
    // since the user IS interacting by sending this request
    if (!agentInitialized) {
      throw new Error("Agent not properly initialized")
    }

    // Check if we have actual user messages to process
    const userMessages = clientMessages.filter((m) => m.role === "user")
    if (userMessages.length === 0) {
      throw new Error("No user messages to process")
    }

    // Process the agent's prompt with context
    const systemPromptContent = PromptProcessor.processPrompt(agent, {
      strategicItems,
      tasks: allTasks,
      teamMembers: allTeamMembers,
      additionalData: {
        memories: memories,
        currentDate: new Date().toISOString().split("T")[0],
        contextInitialized,
      },
    })

    // Add agent-specific instructions with context awareness
    const enhancedSystemPrompt = `
${systemPromptContent}

AGENT CONFIGURATION:
- Agent: ${agent.name}
- Specialization: ${agent.description}
- Context Integration: ${agent.contextIntegration}
- Capabilities: ${agent.capabilities.join(", ")}

CONTEXT STATUS:
- Strategic Items Available: ${strategicItems.length}
- Context Initialized: ${contextInitialized}
- Tasks Available: ${allTasks.length}
- Team Members Available: ${allTeamMembers.length}
- Memories Available: ${memories.length}

RESPONSE GUIDELINES:
- Stay in character as ${agent.name}
- Focus on your specialization: ${agent.description}
- Leverage the provided strategic context when relevant
- Provide actionable insights within your domain of expertise
- Use the available actions when appropriate to help the user
- Reference specific context items when they're relevant to the conversation

AVAILABLE ACTIONS:
- Create Task: [ACTION:Create Task:{"title":"...", "description":"...", "priority":"Medium", "dueDate":"YYYY-MM-DD", "assigneeId":"USER_ID_OPTIONAL", "strategicItemId":"ITEM_ID_OPTIONAL", "strategicItemType":"TYPE_OPTIONAL"}]
- Update Task Status: [ACTION:Update Task Status:{"taskId":"TASK_ID", "status":"Completed"}]
- Assign Task: [ACTION:Assign Task:{"taskId":"TASK_ID", "assigneeId":"USER_ID"}]
- Set Task Due Date: [ACTION:Set Task Due Date:{"taskId":"TASK_ID", "dueDate":"YYYY-MM-DD"}]
- Set Task Priority: [ACTION:Set Task Priority:{"taskId":"TASK_ID", "priority":"High"}]

When referencing existing tasks, use: [TASK_CARD:{"taskId":"THE_EXISTING_TASK_ID"}]

CONTEXT ITEMS AVAILABLE:
${strategicItems.map((item) => `- ${item.type}: ${item.title} (ID: ${item.id})`).join("\n")}
`

    // Process messages for AI SDK - filter out system messages that aren't meant for the AI
    const messages = [
      { role: "system" as const, content: enhancedSystemPrompt },
      ...clientMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ]

    console.log("Generating AI response with:", {
      agentName: agent.name,
      systemPromptLength: enhancedSystemPrompt.length,
      messageCount: messages.length,
    })

    const result = await streamText({
      model: openai("gpt-4-turbo-preview"),
      messages,
      temperature: agent.temperature || 0.4,
      maxTokens: agent.maxTokens || 2000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[PRO_CHAT_API_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

    // Handle specific initialization errors gracefully
    if (errorMessage.includes("not properly initialized")) {
      return new Response(JSON.stringify({ error: "Agent not ready", details: errorMessage }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
