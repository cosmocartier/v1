import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { StrategicContext, AIMode, Task, TeamMember, Memory } from "@/lib/types"

export const runtime = "edge"

function getSystemPrompt(
  aiMode: AIMode,
  strategicContext: StrategicContext | null,
  tasks: Task[],
  teamMembers: TeamMember[],
) {
  const commonInstructions = `
You are an AI assistant. Your responses must be concise and professional.
You can trigger actions for the user. The available actions are:
- Create Task: [ACTION:Create Task:{"title":"...", "description":"...", "priority":"Medium", "dueDate":"YYYY-MM-DD", "assigneeId":"USER_ID_OPTIONAL", "strategicItemId":"STRATEGIC_ITEM_ID_OPTIONAL", "strategicItemType":"initiative_or_operation_OPTIONAL"}]
- Update Task Status: [ACTION:Update Task Status:{"taskId":"TASK_ID", "status":"Completed"}]
- Assign Task: [ACTION:Assign Task:{"taskId":"TASK_ID", "assigneeId":"USER_ID"}]
- Set Task Due Date: [ACTION:Set Task Due Date:{"taskId":"TASK_ID", "dueDate":"YYYY-MM-DD"}]
- Set Task Priority: [ACTION:Set Task Priority:{"taskId":"TASK_ID", "priority":"High"}]

**CRITICAL INSTRUCTION FOR DISPLAYING EXISTING TASKS:**
- When your response is primarily about one or more EXISTING tasks, you MUST embed a task card for each relevant EXISTING task.
- Use this exact format: \`[TASK_CARD:{"taskId":"THE_EXISTING_TASK_ID"}]\`
- **DO NOT** use the TASK_CARD tag for tasks you are creating with the CREATE_TASK action. The system handles that.

Example of referencing an EXISTING task:
User: "What's the status of task task-123?"
AI: "The task 'Review Q3 budget' (ID: task-123) is currently 'In Progress'. [TASK_CARD:{"taskId":"task-123"}]"
`

  let contextInfo = `\n---CONTEXT---\nCurrent Date: ${new Date().toISOString().split("T")[0]}\n`
  if (teamMembers.length > 0) {
    contextInfo += "Available Team Members (for assignment, use their ID):\n"
    teamMembers.forEach((tm) => (contextInfo += `- ${tm.name} (ID: ${tm.id})\n`))
  } else {
    contextInfo += "No team members available in current context.\n"
  }

  if (tasks.length > 0) {
    contextInfo += "Relevant Existing Tasks (first 5-10 for brevity, use their ID for actions):\n"
    tasks.slice(0, 10).forEach((task) => {
      const assigneeName = task.assigneeId ? teamMembers.find((tm) => tm.id === task.assigneeId)?.name : "Unassigned"
      contextInfo += `- "${task.title}" (ID: ${task.id}, Status: ${task.status}, Priority: ${task.priority}, Due: ${task.dueDate || "N/A"}, Assignee: ${assigneeName})\n`
    })
  } else {
    contextInfo += "No relevant existing tasks in the current context.\n"
  }
  contextInfo += "---END CONTEXT---\n"

  if (aiMode === "pro" && strategicContext) {
    return `
${commonInstructions}
You are in PRO MODE (Strategic Co-Pilot). Your role is to assist with strategic planning for the ${strategicContext.type} "${strategicContext.title}".
When creating tasks, you MUST link them to this context by setting "strategicItemId" to "${strategicContext.id}" and "strategicItemType" to "${strategicContext.type}".
${contextInfo}
`
  }

  // DAILY AI MODE - Enhanced for autonomous task creation
  return `
${commonInstructions}
You are in DAILY AI MODE. Your role is to assist with everyday tasks.
Be friendly, efficient, and concise.

**AUTONOMOUS TASK CREATION:**
If the user asks you to create a task, reminder, or to-do item (e.g., "remind me to...", "create a task to...", "I need to do X by Y"), you MUST autonomously create it using the 'Create Task' action.
- Infer the task title, description, priority, and due date from the user's request.
- For priority: Default to "Medium". If urgent/ASAP use "High". If low priority use "Low".
- For due dates: Today is ${new Date().toISOString().split("T")[0]}. If user says "tomorrow", use ${new Date(Date.now() + 86400000).toISOString().split("T")[0]}.
- Do NOT ask for confirmation. Create the task directly.
- Do NOT link tasks to strategic items in Daily AI Mode.

Example: User says "create a task to call John tomorrow"
You respond: "I'll create that task for you. [ACTION:Create Task:{"title":"Call John", "description":"Follow up call with John", "priority":"Medium", "dueDate":"${new Date(Date.now() + 86400000).toISOString().split("T")[0]}"}]"

${contextInfo}
`
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }

    const body = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string; id?: string; name?: string }>
      aiMode: AIMode
      strategicContext?: StrategicContext | null
      allTasks?: Task[]
      allTeamMembers?: TeamMember[]
      memories?: Memory[]
    }

    const { messages: clientMessages, aiMode, strategicContext, allTasks = [], allTeamMembers = [] } = body

    const relevantTasksForAIPrompt =
      aiMode === "pro" && strategicContext && strategicContext.id
        ? allTasks.filter(
            (task) =>
              task.strategicItemId === strategicContext.id || (!task.strategicItemId && !task.strategicItemType),
          )
        : allTasks.filter((task) => !task.strategicItemId && !task.strategicItemType)

    const systemPromptContent = getSystemPrompt(
      aiMode,
      strategicContext || null,
      relevantTasksForAIPrompt,
      allTeamMembers,
    )

    // Process messages for AI SDK
    const messages = [
      { role: "system" as const, content: systemPromptContent },
      ...clientMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ]

    const result = await streamText({
      model: openai("gpt-4-turbo-preview"),
      messages,
      temperature: aiMode === "pro" ? 0.4 : 0.6,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
