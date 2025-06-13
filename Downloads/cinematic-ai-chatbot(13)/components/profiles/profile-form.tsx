"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, User, MessageCircle, Target, Briefcase } from "lucide-react"
import type { Profile, PersonalityTrait, MotivationDriver } from "@/lib/profile-types"

interface ProfileFormProps {
  profile?: Profile
  onSave: (profileData: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy" | "psychologicalInsights">) => void
  onCancel: () => void
  isLoading?: boolean
}

const personalityTraitOptions = [
  { name: "Analytical", category: "cognitive" as const, description: "Logical and systematic thinking" },
  { name: "Creative", category: "cognitive" as const, description: "Innovative and imaginative" },
  { name: "Detail-Oriented", category: "cognitive" as const, description: "Attention to specifics" },
  { name: "Big Picture", category: "cognitive" as const, description: "Strategic and visionary" },
  { name: "Empathetic", category: "emotional" as const, description: "Understanding others' emotions" },
  { name: "Resilient", category: "emotional" as const, description: "Bouncing back from setbacks" },
  { name: "Optimistic", category: "emotional" as const, description: "Positive outlook" },
  { name: "Assertive", category: "behavioral" as const, description: "Confident and direct" },
  { name: "Collaborative", category: "social" as const, description: "Works well with others" },
  { name: "Leadership", category: "social" as const, description: "Guides and influences others" },
]

const motivationDriverOptions = [
  { type: "achievement" as const, description: "Driven by accomplishing goals" },
  { type: "autonomy" as const, description: "Values independence and self-direction" },
  { type: "mastery" as const, description: "Seeks to improve and excel" },
  { type: "purpose" as const, description: "Motivated by meaningful work" },
  { type: "recognition" as const, description: "Values acknowledgment and praise" },
  { type: "security" as const, description: "Seeks stability and certainty" },
]

export function ProfileForm({ profile, onSave, onCancel, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    role: profile?.role || "",
    department: profile?.department || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    avatar: profile?.avatar || "",
    personalityTraits: profile?.personalityTraits || [],
    communicationStyle: profile?.communicationStyle || {
      primary: "direct" as const,
      effectiveApproaches: [],
      ineffectiveApproaches: [],
      preferredChannels: [],
    },
    motivationDrivers: profile?.motivationDrivers || [],
    workingStyle: profile?.workingStyle || {
      environment: "mixed" as const,
      pace: "moderate" as const,
      decisionMaking: "analytical" as const,
      feedbackPreference: "periodic" as const,
      stressResponse: [],
    },
    quickInsights: profile?.quickInsights || [],
    meetingPrep: profile?.meetingPrep || [],
    communicationTips: profile?.communicationTips || [],
    relationshipHistory: profile?.relationshipHistory || {
      interactionFrequency: "weekly" as const,
      relationshipQuality: "good" as const,
    },
    tags: profile?.tags || [],
    isActive: profile?.isActive ?? true,
  })

  const [newTag, setNewTag] = useState("")
  const [newInsight, setNewInsight] = useState("")
  const [newTip, setNewTip] = useState("")
  const [newPrepItem, setNewPrepItem] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addPersonalityTrait = (traitOption: (typeof personalityTraitOptions)[0]) => {
    const existingTrait = formData.personalityTraits.find((t) => t.name === traitOption.name)
    if (existingTrait) return

    const newTrait: PersonalityTrait = {
      name: traitOption.name,
      category: traitOption.category,
      score: 50,
      description: traitOption.description,
    }

    setFormData((prev) => ({
      ...prev,
      personalityTraits: [...prev.personalityTraits, newTrait],
    }))
  }

  const updatePersonalityTrait = (index: number, score: number) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: prev.personalityTraits.map((trait, i) => (i === index ? { ...trait, score } : trait)),
    }))
  }

  const removePersonalityTrait = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: prev.personalityTraits.filter((_, i) => i !== index),
    }))
  }

  const addMotivationDriver = (driverOption: (typeof motivationDriverOptions)[0]) => {
    const existingDriver = formData.motivationDrivers.find((d) => d.type === driverOption.type)
    if (existingDriver) return

    const newDriver: MotivationDriver = {
      type: driverOption.type,
      strength: 50,
      description: driverOption.description,
      triggers: [],
    }

    setFormData((prev) => ({
      ...prev,
      motivationDrivers: [...prev.motivationDrivers, newDriver],
    }))
  }

  const updateMotivationDriver = (index: number, strength: number) => {
    setFormData((prev) => ({
      ...prev,
      motivationDrivers: prev.motivationDrivers.map((driver, i) => (i === index ? { ...driver, strength } : driver)),
    }))
  }

  const removeMotivationDriver = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      motivationDrivers: prev.motivationDrivers.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const addQuickInsight = () => {
    if (newInsight.trim()) {
      setFormData((prev) => ({
        ...prev,
        quickInsights: [...prev.quickInsights, newInsight.trim()],
      }))
      setNewInsight("")
    }
  }

  const addCommunicationTip = () => {
    if (newTip.trim()) {
      setFormData((prev) => ({
        ...prev,
        communicationTips: [...prev.communicationTips, newTip.trim()],
      }))
      setNewTip("")
    }
  }

  const addMeetingPrepItem = () => {
    if (newPrepItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        meetingPrep: [...prev.meetingPrep, newPrepItem.trim()],
      }))
      setNewPrepItem("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Personality
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="working" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Working Style
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personality Traits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {formData.personalityTraits.map((trait, index) => (
                  <div key={trait.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{trait.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{trait.score}%</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removePersonalityTrait(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Slider
                        value={[trait.score]}
                        onValueChange={([value]) => updatePersonalityTrait(index, value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{trait.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Add Personality Traits</Label>
                <div className="flex flex-wrap gap-2">
                  {personalityTraitOptions
                    .filter((option) => !formData.personalityTraits.some((t) => t.name === option.name))
                    .map((option) => (
                      <Button
                        key={option.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPersonalityTrait(option)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {option.name}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Motivation Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {formData.motivationDrivers.map((driver, index) => (
                  <div key={driver.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{driver.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{driver.strength}%</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMotivationDriver(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Slider
                        value={[driver.strength]}
                        onValueChange={([value]) => updateMotivationDriver(index, value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{driver.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Add Motivation Drivers</Label>
                <div className="flex flex-wrap gap-2">
                  {motivationDriverOptions
                    .filter((option) => !formData.motivationDrivers.some((d) => d.type === option.type))
                    .map((option) => (
                      <Button
                        key={option.type}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addMotivationDriver(option)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {option.type}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Communication Style</Label>
                <Select
                  value={formData.communicationStyle.primary}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      communicationStyle: { ...prev.communicationStyle, primary: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="diplomatic">Diplomatic</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="expressive">Expressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Communication Tips</Label>
                <div className="space-y-2">
                  {formData.communicationTips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm">{tip}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            communicationTips: prev.communicationTips.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    placeholder="Add communication tip..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCommunicationTip())}
                  />
                  <Button type="button" onClick={addCommunicationTip} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="working" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Style & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Environment</Label>
                  <Select
                    value={formData.workingStyle.environment}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingStyle: { ...prev.workingStyle, environment: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collaborative">Collaborative</SelectItem>
                      <SelectItem value="independent">Independent</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Work Pace</Label>
                  <Select
                    value={formData.workingStyle.pace}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingStyle: { ...prev.workingStyle, pace: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="deliberate">Deliberate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quick Insights</Label>
                <div className="space-y-2">
                  {formData.quickInsights.map((insight, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm">{insight}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            quickInsights: prev.quickInsights.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInsight}
                    onChange={(e) => setNewInsight(e.target.value)}
                    placeholder="Add quick insight..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addQuickInsight())}
                  />
                  <Button type="button" onClick={addQuickInsight} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meeting Preparation Notes</Label>
                <div className="space-y-2">
                  {formData.meetingPrep.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            meetingPrep: prev.meetingPrep.filter((_, i) => i !== index),
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newPrepItem}
                    onChange={(e) => setNewPrepItem(e.target.value)}
                    placeholder="Add meeting prep item..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMeetingPrepItem())}
                  />
                  <Button type="button" onClick={addMeetingPrepItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
        </Button>
      </div>
    </form>
  )
}
