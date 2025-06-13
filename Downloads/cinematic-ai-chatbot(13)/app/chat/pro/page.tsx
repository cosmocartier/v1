"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useChat, type Message } from "ai/react"
import { useSession } from "@/lib/session-context"
import { useAuth } from "@/lib/auth-context"
import { useStrategic } from "@/lib/strategic-context"
import { useMemory } from "@/lib/memory-context"
import { SessionHistorySidebar } from "@/components/session-history-sidebar"
import { StrategicMultiSelector } from "@/components/strategic-multi-selector"
import { ContextPanel } from "@/components/context-panel"
import { AgentSelector } from "@/components/agents/agent-selector"
import { ChatActionHandler } from "@/components/chat-action-handler"
import { TaskCard } from "@/components/task-card"
import { CreateTaskModal } from "@/components/create-task-modal"
import { CinematicLoader } from "@/components/animations/cinematic-loader"
import { SuggestedPrompts } from "@/components/chat/suggested-prompts"
import { MarkdownRenderer } from "@/components/chat/markdown-renderer"
import { createContextMemory } from "@/lib/context-memory-creator"
import type { ChatAction, Task, TeamMember, AIAgent } from "@/lib/types"
import { getAgentById } from "@/lib/agents/agent-registry"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  ArrowLeft,
  Menu,
  X,
  User,
  Bot,
  Plus,
  Loader2,
  Brain,
  Sparkles,
  FileText,
  Layers,
  Target,
  Calendar,
  CheckCircle2,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const MemoizedSessionHistorySidebar = React.memo(SessionHistorySidebar)
const MemoizedContextPanel = React.memo(ContextPanel)
const MemoizedStrategicMultiSelector = React.memo(StrategicMultiSelector)
const MemoizedAgentSelector = React.memo(AgentSelector)
const MemoizedTaskCard = React.memo(TaskCard)
const MemoizedSuggestedPrompts = React.memo(SuggestedPrompts)
const MemoizedMarkdownRenderer = React.memo(MarkdownRenderer)

export default function ProChatPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentSession, updateSessionMetadata, createNewSession } = useSession()
  const {
    getInitiativeById,
    getOperationById,
    getTaskById,
    tasks: allTasksFromContext,
    initiatives,
    operations,
    createTask,
    updateTask,
  } = useStrategic()
  const { getMemoriesForItem, createMemory } = useMemory()
  const { toast } = useToast()

  // Agent and context state
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [agentInitialized, setAgentInitialized] = useState(false)
  const [activeStrategicItems, setActiveStrategicItems] = useState<any[]>([])
  const [contextInitialized, setContextInitialized] = useState(false)

  // UI state
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [showStrategicSelector, setShowStrategicSelector] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contextPanelOpen, setContextPanelOpen] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const [isContextLoading, setIsContextLoading] = useState(false)
  const [showSuggestedPrompts, setShowSuggestedPrompts] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const teamMembers = useMemo(() => {
    const members = new Map<string, TeamMember>()
    initiatives.forEach((init) => init.teamMembers?.forEach((tm) => members.set(tm.id, tm)))
    operations.forEach((op) => op.teamMembers?.forEach((tm) => members.set(tm.id, tm)))
    return Array.from(members.values())
  }, [initiatives, operations])

  const strategicItemsForModal = useMemo(() => {
    const items: Array<{ id: string; title: string; type: "Initiative" | "Operation" }> = []
    initiatives.forEach((i) => items.push({ id: i.id, title: i.title, type: "Initiative" }))
    operations.forEach((o) => items.push({ id: o.id, title: o.title, type: "Operation" }))
    return items
  }, [initiatives, operations])

  // Get all memories related to the active strategic items
  const contextMemories = useMemo(() => {
    const memories: any[] = []
    activeStrategicItems.forEach((item) => {
      const itemMemories = getMemoriesForItem(item.id, item.type)
      memories.push(...itemMemories)
    })
    return memories
  }, [activeStrategicItems, getMemoriesForItem])

  // Check if session has existing messages to determine if user has interacted
  useEffect(() => {
    if (currentSession?.messages && currentSession.messages.length > 0) {
      const userMessages = currentSession.messages.filter((msg) => msg.role === "user")
      setHasUserInteracted(userMessages.length > 0)
    }
  }, [currentSession])

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: "/api/chat/pro",
    initialMessages: currentSession?.messages || [],
    id: currentSession?.id,
    body: {
      agentId: selectedAgent?.id,
      strategicItems: activeStrategicItems,
      memories: contextMemories,
      allTasks: allTasksFromContext,
      allTeamMembers: teamMembers,
      agentInitialized,
      contextInitialized,
      hasUserInteracted,
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

  // Load agent from session and initialize silently
  useEffect(() => {
    if (currentSession?.agentId && !selectedAgent) {
      const agent = getAgentById(currentSession.agentId)
      if (agent) {
        setSelectedAgent(agent)
        setAgentInitialized(true)
        console.log(`Agent ${agent.name} loaded silently from session`)
      }
    }
  }, [currentSession, selectedAgent])

  // Load strategic context from session and initialize silently
  useEffect(() => {
    if (currentSession?.contextItems && activeStrategicItems.length === 0) {
      try {
        const contextItems = JSON.parse(currentSession.contextItems)
        if (Array.isArray(contextItems) && contextItems.length > 0) {
          setActiveStrategicItems(contextItems)
          setContextPanelOpen(true)
          setContextInitialized(true)
          console.log(`Context loaded silently: ${contextItems.length} items`)
        }
      } catch (e) {
        console.error("Error parsing context items:", e)
      }
    }
  }, [currentSession, activeStrategicItems])

  // Show suggested prompts when agent and context are ready
  useEffect(() => {
    if (selectedAgent && agentInitialized && !hasUserInteracted) {
      setShowSuggestedPrompts(true)
    } else {
      setShowSuggestedPrompts(false)
    }
  }, [selectedAgent, agentInitialized, hasUserInteracted, activeStrategicItems])

  const handleAgentSelected = useCallback(
    (agent: AIAgent) => {
      console.log(`Agent selected: ${agent.name}`)

      // Set agent state without triggering any AI response
      setSelectedAgent(agent)
      setAgentInitialized(true)
      setShowAgentSelector(false)

      // Update session metadata silently
      if (currentSession) {
        updateSessionMetadata(currentSession.id, {
          agentId: agent.id,
          mode: "pro",
        })
      }

      // Show success toast to confirm selection
      toast({
        title: "Agent Selected",
        description: `${agent.name} is ready to assist you.`,
        duration: 2000,
      })

      console.log(`Agent ${agent.name} initialized and ready for user input`)
    },
    [currentSession, updateSessionMetadata, toast],
  )

  const handleStrategicItemsSelected = useCallback(
    async (items: any[]) => {
      console.log(`Context selection: ${items.length} items`)

      if (items.length === 0) {
        setActiveStrategicItems([])
        setContextPanelOpen(false)
        setContextInitialized(false)
        if (currentSession) {
          updateSessionMetadata(currentSession.id, {
            contextItems: JSON.stringify([]),
          })
        }
        return
      }

      setIsContextLoading(true)

      try {
        // Create a memory with the context silently
        if (user) {
          await createContextMemory(createMemory, items, selectedAgent, user.id)
          console.log("Context memory created successfully")
        }

        // Update state and session metadata silently
        setActiveStrategicItems(items)
        setContextPanelOpen(true)
        setContextInitialized(true)

        if (currentSession) {
          updateSessionMetadata(currentSession.id, {
            contextItems: JSON.stringify(items),
          })
        }

        console.log(`Context initialized: ${items.length} items ready`)
      } catch (error) {
        console.error("Error creating context memory:", error)
        setIsContextLoading(false)
        toast({
          variant: "destructive",
          title: "Context Error",
          description: "Failed to create context memory. Please try again.",
        })
      }
    },
    [currentSession, updateSessionMetadata, createMemory, selectedAgent, user, toast],
  )

  const handleContextLoadingComplete = useCallback(() => {
    setIsContextLoading(false)

    // Show success toast for context loading
    const contextTypes = [...new Set(activeStrategicItems.map((item) => item.type))]
    toast({
      title: "Context Loaded",
      description: `${activeStrategicItems.length} items (${contextTypes.join(", ")}) are now available to the agent.`,
      duration: 3000,
    })

    console.log("Context loading completed, agent ready with full context")
  }, [activeStrategicItems, toast])

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
          savedTask = await createTask(newTaskData)
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

  const handlePromptClick = useCallback(
    (prompt: string) => {
      // Set the input value to the prompt
      handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>)

      // Focus the textarea
      const textarea = document.querySelector("textarea")
      if (textarea) {
        textarea.focus()
      }
    },
    [handleInputChange],
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
          const textContent = remainingContent.substring(lastIndex, match.index)
          elements.push(<MemoizedMarkdownRenderer key={`md-${messageId}-${lastIndex}`} content={textContent} />)
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
        const textContent = remainingContent.substring(lastIndex)
        elements.push(<MemoizedMarkdownRenderer key={`md-${messageId}-${lastIndex}`} content={textContent} />)
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
      if (!selectedAgent) {
        toast({
          variant: "destructive",
          title: "No Agent Selected",
          description: "Please select an AI agent before starting the conversation.",
        })
        return
      }

      // Mark that user has interacted and hide suggested prompts
      setHasUserInteracted(true)
      setShowSuggestedPrompts(false)

      console.log("User initiated conversation with:", selectedAgent.name)
      handleSubmit(e)
    },
    [input, isLoading, selectedAgent, handleSubmit, toast],
  )

  const handleNewSessionClick = useCallback(async () => {
    const newSessionId = createNewSession()
    setMessages([])
    setSelectedAgent(null)
    setAgentInitialized(false)
    setActiveStrategicItems([])
    setContextInitialized(false)
    setHasUserInteracted(false)
    router.push(`/chat/pro?session=${newSessionId}`)
  }, [createNewSession, setMessages, router])

  const canSendMessage = selectedAgent && agentInitialized && input.trim() && !isLoading

  // Agent status indicator
  const getAgentStatus = () => {
    if (!selectedAgent) return { text: "No agent selected", color: "text-muted-foreground", icon: null }
    if (!agentInitialized) return { text: "Initializing...", color: "text-yellow-500", icon: Loader2 }
    if (!hasUserInteracted) return { text: "Ready for input", color: "text-green-500", icon: CheckCircle }
    return { text: "Active", color: "text-blue-500", icon: CheckCircle }
  }

  const agentStatus = getAgentStatus()

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
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium">Pro Mode</span>
              {selectedAgent && (
                <Badge variant="secondary" className="text-xs">
                  {selectedAgent.name}
                </Badge>
              )}
              {activeStrategicItems.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activeStrategicItems.length} context items
                </Badge>
              )}
              {/* Agent Status Indicator */}
              <div className="flex items-center gap-1">
                {agentStatus.icon && (
                  <agentStatus.icon
                    className={cn("h-3 w-3", agentStatus.color, agentStatus.icon === Loader2 && "animate-spin")}
                  />
                )}
                <span className={cn("text-xs", agentStatus.color)}>{agentStatus.text}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAgentSelector(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Brain className="h-4 w-4 mr-2" />
              {selectedAgent ? "Change Agent" : "Select Agent"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStrategicSelector(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Context
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
                  mode="pro"
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
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold mb-2">Pro Mode Chat</h2>
                      <p className="text-muted-foreground max-w-md mb-4">
                        {selectedAgent && agentInitialized
                          ? `${selectedAgent.name} is ready and waiting for your input`
                          : "Select an AI agent to begin your strategic conversation"}
                      </p>
                      {!selectedAgent && (
                        <Button onClick={() => setShowAgentSelector(true)} className="mb-4">
                          <Brain className="h-4 w-4 mr-2" />
                          Select AI Agent
                        </Button>
                      )}
                      {selectedAgent && agentInitialized && activeStrategicItems.length === 0 && (
                        <Button onClick={() => setShowStrategicSelector(true)} className="mb-4" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Add Strategic Context (Optional)
                        </Button>
                      )}
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
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white font-bold text-sm"
                            style={{ backgroundColor: selectedAgent?.color || "#8b5cf6" }}
                          >
                            {selectedAgent?.name.charAt(0) || <Bot className="h-4 w-4" />}
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

            {/* Suggested Prompts */}
            <AnimatePresence>
              {showSuggestedPrompts && selectedAgent && agentInitialized && !hasUserInteracted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3 border-t border-border bg-card/30"
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="text-xs text-muted-foreground mb-2 text-center">
                      {selectedAgent.name} is ready. Try one of these prompts to get started:
                    </div>
                    <MemoizedSuggestedPrompts
                      onPromptClick={handlePromptClick}
                      strategicItems={activeStrategicItems}
                      agent={selectedAgent}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
              <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder={
                      selectedAgent && agentInitialized
                        ? `Message ${selectedAgent.name}...`
                        : "Select an AI agent first..."
                    }
                    className="min-h-[52px] max-h-[120px] resize-none pr-12 bg-background border-input rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={isLoading || !selectedAgent || !agentInitialized}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !isLoading && canSendMessage) {
                        e.preventDefault()
                        handleSubmit(e as any)
                        setHasUserInteracted(true)
                        setShowSuggestedPrompts(false)
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!canSendMessage}
                    className="absolute right-2 bottom-2 h-8 w-8 p-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </div>
          </main>

          {/* Context Panel */}
          <AnimatePresence>
            {activeStrategicItems.length > 0 && contextPanelOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="border-l border-border bg-card/30 backdrop-blur-sm hidden xl:block"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium mb-1">Strategic Context</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activeStrategicItems.length} items providing context
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Context Initialized</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowStrategicSelector(true)}>
                    <FileText className="h-3.5 w-3.5 mr-2" />
                    Manage Context
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="p-4 space-y-4">
                    {activeStrategicItems.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="border rounded-lg p-3 bg-card/50">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === "initiative" && <Layers className="h-4 w-4 text-blue-500" />}
                          {item.type === "operation" && <Target className="h-4 w-4 text-green-500" />}
                          {item.type === "milestone" && <Calendar className="h-4 w-4 text-amber-500" />}
                          {item.type === "task" && <CheckCircle2 className="h-4 w-4 text-purple-500" />}
                          {item.type === "memory" && <FileText className="h-4 w-4 text-rose-500" />}
                          <span className="font-medium truncate">{item.title}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </Badge>
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Modals and Loaders */}
        <MemoizedAgentSelector
          open={showAgentSelector}
          onClose={() => setShowAgentSelector(false)}
          onSelect={handleAgentSelected}
          selectedAgentId={selectedAgent?.id}
        />

        <MemoizedStrategicMultiSelector
          isOpen={showStrategicSelector}
          onClose={() => setShowStrategicSelector(false)}
          onItemsSelected={handleStrategicItemsSelected}
          initialSelectedItems={activeStrategicItems}
          agentId={selectedAgent?.id}
        />

        <CinematicLoader
          isLoading={isContextLoading}
          onComplete={handleContextLoadingComplete}
          agentName={selectedAgent?.name}
        />

        {isCreateTaskModalOpen && (
          <CreateTaskModal
            isOpen={isCreateTaskModalOpen}
            onClose={() => setIsCreateTaskModalOpen(false)}
            onSave={handleSaveTaskFromModal}
            teamMembers={teamMembers}
            strategicItems={strategicItemsForModal}
            userId={user?.id || ""}
            defaultStrategicItemId={activeStrategicItems[0]?.id}
            defaultStrategicItemType={activeStrategicItems[0]?.type}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
