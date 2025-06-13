"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useChat, type Message } from "ai/react"
import { useSession } from "@/lib/session-context"
import { useAuth } from "@/lib/auth-context"
import { useStrategic } from "@/lib/strategic-context"
import { SessionHistorySidebar } from "@/components/session-history-sidebar"
import { ChatActionHandler } from "@/components/chat-action-handler"
import { TaskCard } from "@/components/task-card"
import { CreateTaskModal } from "@/components/create-task-modal"
import type { ChatAction, Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Send, ArrowLeft, Menu, X, User, Bot, Plus, Loader2, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const MemoizedSessionHistorySidebar = React.memo(SessionHistorySidebar)
const MemoizedTaskCard = React.memo(TaskCard)

export default function DailyChatPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentSession, updateSessionMetadata, createNewSession } = useSession()
  const { getTaskById, tasks: allTasksFromContext, createTask, updateTask } = useStrategic()
  const { toast } = useToast()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: "/api/chat/daily",
    initialMessages: currentSession?.messages || [],
    id: currentSession?.id,
    body: {
      mode: "daily",
      allTasks: allTasksFromContext.filter((task) => !task.strategicItemId), // Only non-strategic tasks
    },
    onFinish: (message) => {
      console.log("AI Raw Response (onFinish):", message.content)
      if (currentSession) {
        updateSessionMetadata(currentSession.id, {
          lastMessage: message.content.substring(0, 100),
          lastUpdated: new Date().toISOString(),
        })
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Chat Error", description: error.message })
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleActionSuccess = useCallback(
    (message?: string, result?: any, action?: ChatAction) => {
      toast({ title: "Success", description: message || "Action completed successfully." })
      if (result && result.id && result.title && action?.actionType === "CREATE_TASK") {
        const task = result as Task
        const taskCardSystemMessage: Message = {
          id: `task-card-sys-${task.id}-${Date.now()}`,
          role: "system" as const,
          content: `[TASK_CARD:{"taskId":"${task.id}"}]`,
        }
        setMessages((prevMessages) => [...prevMessages, taskCardSystemMessage])
      }
    },
    [toast, setMessages],
  )

  const handleActionError = useCallback(
    (error: string) => {
      toast({ variant: "destructive", title: "Error", description: error })
    },
    [toast],
  )

  const handleNewTaskCreated = useCallback(
    (newTask: Task) => {
      const taskCardSystemMessage: Message = {
        id: `task-card-ui-${newTask.id}-${Date.now()}`,
        role: "system" as const,
        content: `Task "${newTask.title}" created. [TASK_CARD:{"taskId":"${newTask.id}"}]`,
      }
      setMessages((prevMessages) => [...prevMessages, taskCardSystemMessage])
    },
    [setMessages],
  )

  const handleSaveTaskFromModal = useCallback(
    async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt"> | Task) => {
      try {
        let savedTask: Task
        if ("id" in taskData && taskData.id) {
          savedTask = await updateTask(taskData.id, taskData as Partial<Task>)
          toast({ title: "Task Updated", description: `"${savedTask.title}" has been updated.` })
        } else {
          const newTaskData = taskData as Omit<Task, "id" | "createdAt" | "updatedAt">
          // Ensure daily tasks don't have strategic context
          const dailyTaskData = {
            ...newTaskData,
            strategicItemId: undefined,
            strategicItemType: undefined,
          }
          savedTask = await createTask(dailyTaskData)
          toast({ title: "Task Created", description: `"${savedTask.title}" has been created.` })
          handleNewTaskCreated(savedTask)
        }
      } catch (error) {
        console.error("Failed to save task from modal:", error)
        toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message })
      }
    },
    [createTask, updateTask, toast, handleNewTaskCreated],
  )

  const renderMessageContent = useCallback(
    (content: string, role: Message["role"], messageId?: string) => {
      const elements: React.ReactNode[] = []
      const remainingContent = content

      const tagRegex = /(\[TASK_CARD:({.*?})\]|\[ACTION:([^:]+):({.*?})\])/g
      let lastIndex = 0
      let match

      while ((match = tagRegex.exec(remainingContent)) !== null) {
        if (match.index > lastIndex) {
          elements.push(remainingContent.substring(lastIndex, match.index))
        }

        const fullTag = match[0]
        if (fullTag.startsWith("[TASK_CARD:")) {
          try {
            const taskData = JSON.parse(match[2] as string)
            const task = getTaskById(taskData.taskId)
            if (task) {
              elements.push(<MemoizedTaskCard key={`msg-${messageId}-task-${task.id}-${match.index}`} task={task} />)
            } else {
              elements.push(
                <span
                  key={`msg-${messageId}-task-notfound-${match.index}`}
                  className="text-xs text-muted-foreground italic"
                >
                  (Task not found)
                </span>,
              )
            }
          } catch (e) {
            elements.push(
              <span key={`msg-${messageId}-task-error-${match.index}`} className="text-xs text-destructive italic">
                (Error rendering task)
              </span>,
            )
          }
        } else if (fullTag.startsWith("[ACTION:")) {
          try {
            const actionLabel = match[3] as string
            const actionPayload = JSON.parse(match[4] as string)

            const chatAction: ChatAction = {
              actionType: determineActionTypeFromLabel(actionLabel),
              payload: actionPayload,
            }

            elements.push(
              <ChatActionHandler
                key={`msg-${messageId}-action-${match.index}`}
                action={chatAction}
                actionLabel={actionLabel}
                onSuccess={(msg, res) => handleActionSuccess(msg, res, chatAction)}
                onError={handleActionError}
              />,
            )
          } catch (e) {
            console.error("Error parsing action:", e)
            elements.push(
              <span key={`msg-${messageId}-action-error-${match.index}`} className="text-xs text-destructive italic">
                (Error rendering action)
              </span>,
            )
          }
        }
        lastIndex = match.index + fullTag.length
      }

      if (lastIndex < remainingContent.length) {
        elements.push(remainingContent.substring(lastIndex))
      }

      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {elements.map((el, idx) => (
            <React.Fragment key={idx}>{el}</React.Fragment>
          ))}
        </div>
      )
    },
    [getTaskById, handleActionSuccess, handleActionError],
  )

  function determineActionTypeFromLabel(label: string): string | undefined {
    const labelLower = label.toLowerCase()
    if (labelLower.includes("create task")) return "CREATE_TASK"
    if (labelLower.includes("update") && labelLower.includes("status")) return "UPDATE_TASK_STATUS"
    if (labelLower.includes("assign")) return "ASSIGN_TASK"
    if (labelLower.includes("due date")) return "SET_TASK_DUE_DATE"
    if (labelLower.includes("priority")) return "SET_TASK_PRIORITY"
    return undefined
  }

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      handleSubmit(e)
    },
    [input, isLoading, handleSubmit],
  )

  const handleNewSessionClick = useCallback(async () => {
    const newSessionId = createNewSession()
    setMessages([])
    router.push(`/chat/daily?session=${newSessionId}`)
  }, [createNewSession, setMessages, router])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium">Daily AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/chat/pro")}
              className="text-muted-foreground hover:text-foreground"
            >
              Switch to Pro Mode
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Task
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Session History Sidebar */}
          <AnimatePresence>
            {(sidebarOpen || isLargeScreen) && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn("border-r border-border bg-card/30 backdrop-blur-sm", isLargeScreen ? "block" : "hidden")}
              >
                <SessionHistorySidebar
                  isCollapsed={false}
                  onToggleCollapse={() => setSidebarOpen(false)}
                  onNewSession={handleNewSessionClick}
                  mode="daily"
                />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto px-4 py-6">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="mb-6">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                        <Sun className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">Daily AI Assistant</h2>
                      <p className="text-muted-foreground max-w-md">
                        How can I help you manage your tasks and daily workflow? I can create tasks, set reminders, and
                        assist with everyday productivity.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {messages.map((message) =>
                    message.role === "system" ? (
                      <div key={message.id} className="flex justify-center">
                        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                          {renderMessageContent(message.content, message.role, message.id)}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={message.id}
                        className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "assistant" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-4 py-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 text-foreground",
                          )}
                        >
                          {renderMessageContent(message.content, message.role, message.id)}
                        </div>

                        {message.role === "user" && (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
              <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Message Daily AI..."
                    className="min-h-[52px] max-h-[120px] resize-none pr-12 bg-background border-input rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>

        {/* Modals */}
        {isCreateTaskModalOpen && (
          <CreateTaskModal
            isOpen={isCreateTaskModalOpen}
            onClose={() => setIsCreateTaskModalOpen(false)}
            onSave={handleSaveTaskFromModal}
            teamMembers={[]} // Daily mode doesn't use team members
            strategicItems={[]} // Daily mode doesn't use strategic items
            userId={user?.id || ""}
            // No strategic context for daily mode
          />
        )}
      </div>
    </TooltipProvider>
  )
}
