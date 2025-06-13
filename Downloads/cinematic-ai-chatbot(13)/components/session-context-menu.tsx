"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Edit3, Tag, Palette, Plus, X, Save, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useSession, type ChatSession, type SessionVariable } from "@/lib/session-context"
import { cn } from "@/lib/utils"

interface SessionContextMenuProps {
  session: ChatSession
  onClose: () => void
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
  "#16a34a", // green-600
  "#0ea5e9", // sky-500
]

export function SessionContextMenu({ session, onClose }: SessionContextMenuProps) {
  const { updateSessionMetadata, deleteSession } = useSession()

  const [customName, setCustomName] = useState(session.customName || "")
  const [objective, setObjective] = useState(session.objective || "")
  const [colorCode, setColorCode] = useState(session.colorCode)
  const [tags, setTags] = useState<string[]>(session.tags || [])
  const [variables, setVariables] = useState<SessionVariable[]>(session.variables || [])
  const [newTag, setNewTag] = useState("")
  const [newVariable, setNewVariable] = useState({ name: "", value: "", type: "text" as const })

  const handleSave = () => {
    updateSessionMetadata(session.id, {
      customName,
      objective,
      colorCode,
      tags,
      variables,
    })
    onClose()
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      deleteSession(session.id)
      onClose()
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addVariable = () => {
    if (newVariable.name.trim() && newVariable.value.trim()) {
      const variable: SessionVariable = {
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newVariable.name.trim(),
        value: newVariable.value.trim(),
        type: newVariable.type,
      }
      setVariables([...variables, variable])
      setNewVariable({ name: "", value: "", type: "text" })
    }
  }

  const removeVariable = (variableId: string) => {
    setVariables(variables.filter((variable) => variable.id !== variableId))
  }

  const updateVariable = (variableId: string, updates: Partial<SessionVariable>) => {
    setVariables(variables.map((variable) => (variable.id === variableId ? { ...variable, ...updates } : variable)))
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorCode }} />
            <h2 className="text-lg font-semibold">Session Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Basic Information
              </h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="customName">Custom Name</Label>
                  <Input
                    id="customName"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter a custom name for this session"
                  />
                </div>

                <div>
                  <Label htmlFor="objective">Objective</Label>
                  <Textarea
                    id="objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Describe the main objective of this session"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Color Code */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color Code
              </h3>

              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColorCode(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      colorCode === color ? "border-foreground scale-110" : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Variables */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Variables
              </h3>

              <div className="space-y-3">
                {variables.map((variable) => (
                  <div key={variable.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={variable.name}
                        onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                        placeholder="Variable name"
                        className="text-sm"
                      />
                      <Input
                        value={variable.value}
                        onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                        placeholder="Variable value"
                        className="text-sm"
                      />
                    </div>
                    <Button onClick={() => removeVariable(variable.id)} size="icon" variant="ghost" className="h-8 w-8">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  placeholder="Variable name"
                  className="flex-1"
                />
                <Input
                  value={newVariable.value}
                  onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                  placeholder="Variable value"
                  className="flex-1"
                />
                <Button onClick={addVariable} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button onClick={handleDelete} variant="destructive" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Session
          </Button>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
