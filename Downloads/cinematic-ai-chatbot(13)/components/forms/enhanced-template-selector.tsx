"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  Check,
  FileText,
  Search,
  Bookmark,
  BookmarkCheck,
  Settings,
  Wand2,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  enhancedInitiativeTemplates,
  generateInitiativeFromTemplate,
  type EnhancedInitiativeTemplate,
} from "@/lib/enhanced-initiative-templates"
import { useBookmarks } from "@/lib/bookmarks-context"
import { useToast } from "@/hooks/use-toast"
import { useStrategic } from "@/lib/strategic-context"

interface EnhancedTemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (initiative: any) => void
}

interface CustomizationState {
  variables: Record<string, string>
  startDate: Date
  selectedOptions: Record<string, boolean>
  teamAssignments: Record<string, string>
}

export function EnhancedTemplateSelector({ open, onOpenChange, onSuccess }: EnhancedTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedInitiativeTemplate | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [showCustomization, setShowCustomization] = useState(false)
  const [customization, setCustomization] = useState<CustomizationState>({
    variables: {},
    startDate: new Date(),
    selectedOptions: {},
    teamAssignments: {},
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const { bookmarkedTemplates, isBookmarked, toggleBookmark } = useBookmarks()
  const { createInitiative, createOperation, createTask } = useStrategic()
  const { toast } = useToast()

  const filteredTemplates = useMemo(() => {
    return enhancedInitiativeTemplates.filter((template) => {
      // Bookmarks filter
      if (activeCategory === "bookmarked") {
        if (!bookmarkedTemplates.includes(template.id)) {
          return false
        }
      }

      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory =
        activeCategory === "all" || activeCategory === "bookmarked" || template.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory, bookmarkedTemplates])

  const templateCategories = Array.from(new Set(enhancedInitiativeTemplates.map((t) => t.category)))

  const handleSelectTemplate = (template: EnhancedInitiativeTemplate) => {
    setSelectedTemplate(template)

    // Initialize customization state
    const initialVariables: Record<string, string> = {}
    template.template.customizationOptions.adjustableParameters.forEach((param) => {
      initialVariables[param.name] = param.defaultValue?.toString() || ""
    })

    const initialOptions: Record<string, boolean> = {}
    template.template.customizationOptions.optionalSections.forEach((section) => {
      initialOptions[section.name] = section.enabled
    })

    const initialTeamAssignments: Record<string, string> = {}
    template.template.teamRoles.forEach((role) => {
      initialTeamAssignments[role.role] = role.name
    })

    setCustomization({
      variables: initialVariables,
      startDate: new Date(),
      selectedOptions: initialOptions,
      teamAssignments: initialTeamAssignments,
    })
  }

  const handleCustomizationChange = (type: keyof CustomizationState, key: string, value: any) => {
    setCustomization((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }))
  }

  const handleGenerateInitiative = async () => {
    if (!selectedTemplate) return

    try {
      setIsGenerating(true)

      // Generate initiative structure from template
      const { initiative, operations, tasks } = generateInitiativeFromTemplate(selectedTemplate, customization)

      // Create the initiative
      const createdInitiative = await createInitiative(initiative)

      // Create operations and link to initiative
      const createdOperations = await Promise.all(
        operations.map(async (operation) => {
          const operationWithInitiative = {
            ...operation,
            initiativeIds: [createdInitiative.id],
          }
          return await createOperation(operationWithInitiative)
        }),
      )

      // Create tasks and link to operations
      await Promise.all(
        tasks.map(async (task, index) => {
          const operationIndex = Math.floor(index / (tasks.length / operations.length))
          const linkedOperation = createdOperations[operationIndex]

          const taskWithLinks = {
            ...task,
            strategicItemId: linkedOperation?.id || createdInitiative.id,
            strategicItemType: linkedOperation ? ("operation" as const) : ("initiative" as const),
          }

          return await createTask(taskWithLinks)
        }),
      )

      toast({
        title: "Initiative Generated Successfully!",
        description: `"${createdInitiative.title}" has been created with ${operations.length} operations, ${createdInitiative.milestones.length} milestones, and ${tasks.length} tasks.`,
      })

      onOpenChange(false)
      if (onSuccess) onSuccess(createdInitiative)
    } catch (error) {
      console.error("Error generating initiative:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate initiative from template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleBookmark = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation()
    toggleBookmark(templateId)

    const template = enhancedInitiativeTemplates.find((t) => t.id === templateId)
    if (!template) return

    const action = isBookmarked(templateId) ? "removed from" : "added to"
    toast({
      title: `Template ${action} bookmarks`,
      description: `"${template.name}" has been ${action} your bookmarks.`,
      duration: 3000,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Enhanced Initiative Templates
          </DialogTitle>
        </DialogHeader>

        {!showCustomization ? (
          <>
            {/* Template Selection Interface */}
            <div className="flex items-center space-x-2 my-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search enhanced templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Tabs
              defaultValue="all"
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="flex-1 flex flex-col"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Templates</TabsTrigger>
                <TabsTrigger value="bookmarked" className="flex items-center gap-1">
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  Bookmarked
                </TabsTrigger>
                {templateCategories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="flex-1 mt-0">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {template.name}
                                {selectedTemplate?.id === template.id && <Check className="h-4 w-4 text-primary" />}
                              </CardTitle>
                              <CardDescription className="mt-1">{template.description}</CardDescription>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => handleToggleBookmark(e, template.id)}
                                  >
                                    {isBookmarked(template.id) ? (
                                      <BookmarkCheck className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Bookmark className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isBookmarked(template.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant="secondary">{template.complexity}</Badge>
                            <Badge variant="outline">{template.timeframe}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{template.template.estimatedDuration} days</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{template.template.teamRoles.length} roles</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{template.template.milestones.length} milestones</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{template.template.estimatedBudget}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">What's Included:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• {template.template.operations.length} pre-defined operations</li>
                              <li>• {template.template.milestones.length} strategic milestones</li>
                              <li>
                                • {template.template.operations.reduce((sum, op) => sum + op.tasks.length, 0)} detailed
                                tasks
                              </li>
                              <li>• {template.template.kpis.length} KPI tracking metrics</li>
                              <li>• Complete team role definitions</li>
                              <li>• Risk management framework</li>
                            </ul>
                          </div>
                        </CardContent>

                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectTemplate(template)
                              setShowCustomization(true)
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Customize & Generate
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCustomization(true)} disabled={!selectedTemplate}>
                Customize Template
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Customization Interface */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Customize: {selectedTemplate?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Tailor this template to your specific needs and requirements
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowCustomization(false)}>
                Back to Templates
              </Button>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Setup Guide */}
                {selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Setup Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Overview</h4>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.template.setupGuide.overview}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Key Considerations</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedTemplate.template.setupGuide.keyConsiderations.map((consideration, index) => (
                            <li key={index}>• {consideration}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Success Factors</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {selectedTemplate.template.setupGuide.successFactors.map((factor, index) => (
                            <li key={index}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Variable Customization */}
                {selectedTemplate && selectedTemplate.template.customizationOptions.adjustableParameters.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Template Variables</CardTitle>
                      <CardDescription>
                        Customize key parameters that will be applied throughout the initiative
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.template.customizationOptions.adjustableParameters.map((param) => (
                        <div key={param.name} className="space-y-2">
                          <Label htmlFor={param.name}>{param.description}</Label>
                          {param.type === "text" && (
                            <Input
                              id={param.name}
                              value={customization.variables[param.name] || param.defaultValue}
                              onChange={(e) => handleCustomizationChange("variables", param.name, e.target.value)}
                              placeholder={param.defaultValue?.toString()}
                            />
                          )}
                          {param.type === "number" && (
                            <Input
                              id={param.name}
                              type="number"
                              value={customization.variables[param.name] || param.defaultValue}
                              onChange={(e) => handleCustomizationChange("variables", param.name, e.target.value)}
                            />
                          )}
                          {param.type === "select" && param.options && (
                            <Select
                              value={customization.variables[param.name] || param.defaultValue}
                              onValueChange={(value) => handleCustomizationChange("variables", param.name, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Timeline Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Timeline Configuration</CardTitle>
                    <CardDescription>Set the start date for your initiative</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Initiative Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={customization.startDate.toISOString().split("T")[0]}
                        onChange={(e) =>
                          setCustomization((prev) => ({
                            ...prev,
                            startDate: new Date(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Team Assignments */}
                {selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Team Assignments</CardTitle>
                      <CardDescription>Assign team members to key roles in this initiative</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.template.teamRoles.map((role) => (
                        <div key={role.role} className="space-y-2">
                          <Label htmlFor={role.role}>{role.role}</Label>
                          <Input
                            id={role.role}
                            value={customization.teamAssignments[role.role] || role.name}
                            onChange={(e) => handleCustomizationChange("teamAssignments", role.role, e.target.value)}
                            placeholder={role.name}
                          />
                          <p className="text-xs text-muted-foreground">
                            Responsibilities: {role.responsibilities.join(", ")}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Optional Sections */}
                {selectedTemplate && selectedTemplate.template.customizationOptions.optionalSections.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Optional Sections</CardTitle>
                      <CardDescription>Choose which optional components to include in your initiative</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedTemplate.template.customizationOptions.optionalSections.map((section) => (
                        <div key={section.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={section.name}
                            checked={customization.selectedOptions[section.name] ?? section.enabled}
                            onCheckedChange={(checked) =>
                              handleCustomizationChange("selectedOptions", section.name, checked)
                            }
                          />
                          <div className="space-y-1">
                            <Label htmlFor={section.name} className="font-medium">
                              {section.name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </Label>
                            <p className="text-xs text-muted-foreground">{section.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCustomization(false)}>
                Back
              </Button>
              <Button onClick={handleGenerateInitiative} disabled={isGenerating} className="min-w-[140px]">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Initiative
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
