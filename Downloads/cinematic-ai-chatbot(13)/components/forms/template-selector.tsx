"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Check, ChevronRight, FileText, Search, Filter, X, Bookmark, BookmarkCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  initiativeTemplates,
  templateCategories,
  templateDepartments,
  templateBusinessSizes,
  templateIndustries,
  templateComplexities,
  templateTimeframes,
  templateTags,
} from "@/lib/initiative-templates"
import { useBookmarks } from "@/lib/bookmarks-context"
import { useToast } from "@/hooks/use-toast"
import type { InitiativeTemplate } from "@/lib/initiative-templates"
import type { Initiative } from "@/lib/strategic-context"

interface TemplateSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: Omit<Initiative, "id" | "createdAt" | "updatedAt" | "progress">) => void
}

interface FilterState {
  categories: string[]
  subcategories: string[]
  departments: string[]
  businessSizes: string[]
  industries: string[]
  complexities: string[]
  timeframes: string[]
  tags: string[]
}

export function TemplateSelector({ open, onOpenChange, onSelectTemplate }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<InitiativeTemplate | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    departments: [],
    businessSizes: [],
    industries: [],
    complexities: [],
    timeframes: [],
    tags: [],
  })
  const { bookmarkedTemplates, isBookmarked, toggleBookmark } = useBookmarks()
  const { toast } = useToast()

  const filteredTemplates = useMemo(() => {
    return initiativeTemplates.filter((template) => {
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
        template.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.department.some((dept) => dept.toLowerCase().includes(searchQuery.toLowerCase())) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter (from tabs)
      const matchesCategory =
        activeCategory === "all" || activeCategory === "bookmarked" || template.category === activeCategory

      // Advanced filters
      const matchesFilters =
        (filters.categories.length === 0 || filters.categories.includes(template.category)) &&
        (filters.subcategories.length === 0 || filters.subcategories.includes(template.subcategory)) &&
        (filters.departments.length === 0 || filters.departments.some((dept) => template.department.includes(dept))) &&
        (filters.businessSizes.length === 0 ||
          filters.businessSizes.some((size) => template.businessSize.includes(size))) &&
        (filters.industries.length === 0 ||
          filters.industries.some((industry) => template.industry.includes(industry))) &&
        (filters.complexities.length === 0 || filters.complexities.includes(template.complexity)) &&
        (filters.timeframes.length === 0 || filters.timeframes.includes(template.timeframe)) &&
        (filters.tags.length === 0 || filters.tags.some((tag) => template.tags.includes(tag)))

      return matchesSearch && matchesCategory && matchesFilters
    })
  }, [searchQuery, activeCategory, filters, bookmarkedTemplates])

  // Sort templates to show bookmarked ones first
  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      const aIsBookmarked = isBookmarked(a.id)
      const bIsBookmarked = isBookmarked(b.id)

      if (aIsBookmarked && !bIsBookmarked) return -1
      if (!aIsBookmarked && bIsBookmarked) return 1
      return 0
    })
  }, [filteredTemplates, isBookmarked])

  const activeFiltersCount = Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0)

  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked ? [...prev[filterType], value] : prev[filterType].filter((item) => item !== value),
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      subcategories: [],
      departments: [],
      businessSizes: [],
      industries: [],
      complexities: [],
      timeframes: [],
      tags: [],
    })
    setActiveCategory("all")
    setSearchQuery("")
  }

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.template)
      onOpenChange(false)
    }
  }

  const handleToggleBookmark = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation()
    toggleBookmark(templateId)

    const template = initiativeTemplates.find((t) => t.id === templateId)
    if (!template) return

    const action = isBookmarked(templateId) ? "removed from" : "added to"
    toast({
      title: `Template ${action} bookmarks`,
      description: `"${template.name}" has been ${action} your bookmarks.`,
      duration: 3000,
    })
  }

  const FilterSection = ({
    title,
    items,
    filterKey,
  }: { title: string; items: string[]; filterKey: keyof FilterState }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`${filterKey}-${item}`}
              checked={filters[filterKey].includes(item)}
              onCheckedChange={(checked) => handleFilterChange(filterKey, item, checked as boolean)}
            />
            <Label htmlFor={`${filterKey}-${item}`} className="text-sm">
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select an Initiative Template</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter Templates</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
                <Separator />
                <ScrollArea className="h-96">
                  <div className="space-y-4 pr-4">
                    <FilterSection title="Department" items={templateDepartments} filterKey="departments" />
                    <Separator />
                    <FilterSection title="Business Size" items={templateBusinessSizes} filterKey="businessSizes" />
                    <Separator />
                    <FilterSection title="Industry" items={templateIndustries} filterKey="industries" />
                    <Separator />
                    <FilterSection title="Complexity" items={templateComplexities} filterKey="complexities" />
                    <Separator />
                    <FilterSection title="Timeframe" items={templateTimeframes} filterKey="timeframes" />
                    <Separator />
                    <FilterSection title="Tags" items={templateTags.slice(0, 20)} filterKey="tags" />
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(filters).map(([filterType, values]) =>
              values.map((value) => (
                <Badge key={`${filterType}-${value}`} variant="secondary" className="text-xs">
                  {value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleFilterChange(filterType as keyof FilterState, value, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )),
            )}
          </div>
        )}

        <Tabs
          defaultValue="all"
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-1">
              <BookmarkCheck className="h-3.5 w-3.5" />
              <span>Bookmarked</span>
              {bookmarkedTemplates.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {bookmarkedTemplates.length}
                </Badge>
              )}
            </TabsTrigger>
            {templateCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="flex-1 mt-0">
            <div className="mb-4 text-sm text-muted-foreground">
              {activeCategory === "bookmarked"
                ? bookmarkedTemplates.length > 0
                  ? `Showing ${sortedTemplates.length} bookmarked templates`
                  : "You haven't bookmarked any templates yet"
                : `Showing ${sortedTemplates.length} of ${initiativeTemplates.length} templates`}
            </div>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTemplates.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                    {activeCategory === "bookmarked" ? (
                      <>
                        <BookmarkCheck className="h-12 w-12 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">No bookmarked templates</h3>
                        <p className="text-muted-foreground">Bookmark your favorite templates for quick access</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveCategory("all")}>
                          Browse All Templates
                        </Button>
                      </>
                    ) : (
                      <>
                        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">No templates found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                        {activeFiltersCount > 0 && (
                          <Button variant="outline" size="sm" className="mt-2" onClick={clearAllFilters}>
                            Clear All Filters
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  sortedTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex items-center gap-2">
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
                            {selectedTemplate?.id === template.id && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </div>
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.complexity}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div>{template.subcategory}</div>
                            <div>{template.timeframe}</div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTemplate(template)
                          }}
                        >
                          Preview <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {selectedTemplate && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Template Preview</h3>
              <div className="flex gap-2">
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant="secondary">{selectedTemplate.complexity}</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={(e) => handleToggleBookmark(e, selectedTemplate.id)}
                      >
                        {isBookmarked(selectedTemplate.id) ? (
                          <BookmarkCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {isBookmarked(selectedTemplate.id) ? "Bookmarked" : "Bookmark"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isBookmarked(selectedTemplate.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Title</p>
                <p className="text-muted-foreground">{selectedTemplate.template.title}</p>
              </div>
              <div>
                <p className="font-medium">Desired Outcome</p>
                <p className="text-muted-foreground">{selectedTemplate.template.desiredOutcome}</p>
              </div>
              <div>
                <p className="font-medium">Success Metric</p>
                <p className="text-muted-foreground">{selectedTemplate.template.successMetric}</p>
              </div>
              <div>
                <p className="font-medium">Departments</p>
                <p className="text-muted-foreground">{selectedTemplate.department.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelectTemplate} disabled={!selectedTemplate}>
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
