import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Task } from "@/lib/types"

export const runtime = "edge"

function getDailyAIPrompt(tasks: Task[]) {
  const currentDate = new Date().toISOString().split("T")[0]
  const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  return `
You are Daily AI, a friendly and efficient personal assistant focused on everyday productivity and task management.

CORE PERSONALITY:
- Friendly, approachable, and encouraging
- Focused on practical, actionable help
- Efficient and concise in communication
- Proactive in suggesting improvements

CAPABILITIES:
- Task creation and management
- Reminder setting and scheduling
- Daily workflow optimization
- Quick productivity tips
- Simple planning assistance

AUTONOMOUS TASK CREATION:
When users ask you to create tasks, reminders, or to-do items, you MUST autonomously create them using the 'Create Task' action.
- Infer task details from user requests
- Default priority: "Medium" (use "High" for urgent, "Low" for non-urgent)
- For dates: Today is ${currentDate}, tomorrow is ${tomorrowDate}
- Do NOT ask for confirmation - create tasks directly
- Do NOT link to strategic items (this is Daily mode)

AVAILABLE ACTIONS:
- Create Task: [ACTION:Create Task:{"title":"...", "description":"...", "priority":"Medium", "dueDate":"YYYY-MM-DD"}]
- Update Task Status: [ACTION:Update Task Status:{"taskId":"TASK_ID", "status":"Completed"}]
- Set Task Due Date: [ACTION:Set Task Due Date:{"taskId":"TASK_ID", "dueDate":"YYYY-MM-DD"}]
- Set Task Priority: [ACTION:Set Task Priority:{"taskId":"TASK_ID", "priority":"High"}]

EXISTING TASKS (for reference):
${
  tasks.length > 0
    ? tasks
        .slice(0, 10)
        .map(
          (task) =>
            `- "${task.title}" (ID: ${task.id}, Status: ${task.status}, Priority: ${task.priority}, Due: ${task.dueDate || "N/A"})`,
        )
        .join("\n")
    : "No existing tasks."
}

When referencing existing tasks, use: [TASK_CARD:{"taskId":"THE_EXISTING_TASK_ID"}]

RESPONSE STYLE:
- Be conversational and helpful
- Offer practical suggestions
- Keep responses focused and actionable
- Use encouraging language

Current Date: ${currentDate}
`
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }

    const body = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string; id?: string; name?: string }>
      allTasks?: Task[]
    }

    const { messages: clientMessages, allTasks = [] } = body

    // Filter to only daily tasks (no strategic context)
    const dailyTasks = allTasks.filter((task) => !task.strategicItemId && !task.strategicItemType)

    const systemPromptContent = getDailyAIPrompt(dailyTasks)

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
      temperature: 0.6,
      maxTokens: 1500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[DAILY_CHAT_API_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
