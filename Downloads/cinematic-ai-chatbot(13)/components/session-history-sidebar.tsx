"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Filter,
  ChevronDown,
  History,
  MoreVertical,
  Sparkles,
  Brain,
  Zap,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { SessionContextMenu } from "@/components/session-context-menu"
import { useSession, type ChatSession, type SessionFilters, type AIMode } from "@/lib/session-context"
import { cn } from "@/lib/utils"

interface SessionHistorySidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNewSession: (mode?: AIMode) => void
  mode?: AIMode | "all"
}

const colorOptions = [
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

export function SessionHistorySidebar({
  isCollapsed,
  onToggleCollapse,
  onNewSession,
  mode = "all",
}: SessionHistorySidebarProps) {
  const { sessions, currentSession, loadSession, deleteSession, searchSessions, filterSessions } = useSession()

  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [contextMenuSession, setContextMenuSession] = useState<ChatSession | null>(null)
  const [filters, setFilters] = useState<SessionFilters>({
    dateRange: "all",
  })

  // Get all unique tags and objectives for filter options
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    sessions.forEach((session) => {
      session.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [sessions])

  const allObjectives = useMemo(() => {
    const objectiveSet = new Set<string>()
    sessions.forEach((session) => {
      if (session.objective) objectiveSet.add(session.objective)
    })
    return Array.from(objectiveSet)
  }, [sessions])

  const filteredSessions = useMemo(() => {
    let filtered = searchQuery ? searchSessions(searchQuery) : sessions
    filtered = filterSessions(filters)

    // Filter by mode if specified
    if (mode !== "all") {
      filtered = filtered.filter((session) => session.mode === mode)
    }

    return filtered
  }, [sessions, searchQuery, filters, searchSessions, filterSessions, mode])

  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: ChatSession[] } = {}
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    filteredSessions.forEach((session) => {
      const sessionDate = new Date(session.updatedAt)
      let groupKey: string

      if (sessionDate >= today) {
        groupKey = "Today"
      } else if (sessionDate >= yesterday) {
        groupKey = "Yesterday"
      } else if (sessionDate >= weekAgo) {
        groupKey = "This Week"
      } else {
        groupKey = "Older"
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(session)
    })

    return groups
  }, [filteredSessions])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const handleSessionSelect = (session: ChatSession) => {
    loadSession(session.id)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(sessionId)
    }
  }

  const handleContextMenu = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setContextMenuSession(session)
  }

  const updateFilters = (newFilters: Partial<SessionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({ dateRange: "all" })
    setSearchQuery("")
  }

  const hasActiveFilters = () => {
    return (
      searchQuery ||
      filters.objective ||
      filters.name ||
      filters.colorCode ||
      (filters.tags && filters.tags.length > 0) ||
      filters.dateRange !== "all"
    )
  }

  const getModeIcon = (sessionMode?: AIMode) => {
    switch (sessionMode) {
      case "daily":
        return <Zap className="h-3 w-3 text-blue-400" />
      case "strategic":
        return <Target className="h-3 w-3 text-purple-400" />
      default:
        return <Sparkles className="h-3 w-3 text-me-400" />
    }
  }

  const getModeLabel = (sessionMode?: AIMode) => {
    switch (sessionMode) {
      case "daily":
        return "Daily"
      case "strategic":
        return "Strategic"
      default:
        return "Legacy"
    }
  }

  return (
    <>
      <div className="h-full flex flex-col relative">
        {/* Cinematic Header */}
        <div className="relative border-b border-border/50 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-me-500/10 via-primary/5 to-me-600/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-me-500 to-primary rounded-lg blur-lg opacity-30" />
                <div className="relative bg-gradient-to-r from-me-500 to-primary p-2 rounded-lg">
                  <History className="h-5 w-5 text-white" />
                </div>
              </div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-me-400 to-primary bg-clip-text text-transparent">
                {mode === "daily" ? "Daily Sessions" : mode === "strategic" ? "Strategic Sessions" : "Session History"}
              </h2>
            </div>

            {/* New Session Button */}
            <Button
              onClick={() => onNewSession(mode === "all" ? "daily" : mode)}
              className="w-full mb-6 bg-gradient-to-r from-me-500 to-primary hover:from-me-600 hover:to-primary/90 text-white border-0 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {mode === "daily" ? "New Daily Session" : mode === "strategic" ? "New Strategic Session" : "New Session"}
            </Button>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gradient-to-br from-background/80 to-card/80 border-border/50 focus:border-me-500/50 rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 bg-gradient-to-r from-background/80 to-card/80 border-border/50 hover:border-me-500/50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showFilters && "rotate-180")} />
              </Button>
              {hasActiveFilters() && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 space-y-4"
                >
                  {/* Date Range Filter */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Date Range</Label>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {[
                        { key: "all", label: "All" },
                        { key: "today", label: "Today" },
                        { key: "week", label: "Week" },
                        { key: "month", label: "Month" },
                      ].map((option) => (
                        <Button
                          key={option.key}
                          variant={filters.dateRange === option.key ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilters({ dateRange: option.key as any })}
                          className="text-xs h-7"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Objective Filter */}
                  {allObjectives.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Objective</Label>
                      <Input
                        placeholder="Filter by objective"
                        value={filters.objective || ""}
                        onChange={(e) => updateFilters({ objective: e.target.value || undefined })}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  )}

                  {/* Tags Filter */}
                  {allTags.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allTags.slice(0, 6).map((tag) => (
                          <Button
                            key={tag}
                            variant={filters.tags?.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const currentTags = filters.tags || []
                              const newTags = currentTags.includes(tag)
                                ? currentTags.filter((t) => t !== tag)
                                : [...currentTags, tag]
                              updateFilters({ tags: newTags.length > 0 ? newTags : undefined })
                            }}
                            className="text-xs h-6 px-2"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Filter */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Color</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateFilters({ colorCode: filters.colorCode === color ? undefined : color })}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            filters.colorCode === color
                              ? "border-foreground scale-110"
                              : "border-transparent hover:scale-105",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Session List */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {Object.keys(groupedSessions).length === 0 ? (
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-me-500 to-primary rounded-full blur-xl opacity-20" />
                  <div className="relative bg-gradient-to-r from-me-500/20 to-primary/20 p-4 rounded-full mx-auto w-fit">
                    <Brain className="w-8 h-8 text-me-400" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-2">No sessions found</p>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters() ? "Try adjusting your filters" : "Start a new session to begin"}
                </p>
              </div>
            ) : (
              Object.entries(groupedSessions).map(([groupName, groupSessions]) => (
                <div key={groupName}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-me-400" />
                    {groupName}
                  </h3>
                  <div className="space-y-2">
                    {groupSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "group relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                          "hover:bg-gradient-to-br hover:from-me-500/10 hover:to-primary/10 border border-transparent hover:border-me-500/20",
                          currentSession?.id === session.id &&
                            "bg-gradient-to-br from-me-500/10 to-primary/10 border-me-500/20",
                        )}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className="w-3 h-3 rounded-full mt-1 flex-shrink-0 shadow-lg"
                              style={{ backgroundColor: session.colorCode }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {session.customName || session.summary}
                                </h4>
                                {getModeIcon(session.mode)}
                              </div>
                              {session.objective && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{session.objective}</p>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  {getModeLabel(session.mode)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{session.messageCount} messages</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(session.updatedAt)}</span>
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(session.updatedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleContextMenu(session, e)}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {session.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {session.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {session.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs px-2 py-0">
                                +{session.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-6 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            {filteredSessions.length} of {sessions.length} sessions
            {mode !== "all" && <span className="ml-2">({mode} mode)</span>}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenuSession && (
          <SessionContextMenu session={contextMenuSession} onClose={() => setContextMenuSession(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
