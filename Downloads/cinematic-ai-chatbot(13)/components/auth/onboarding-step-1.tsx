"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Building, Briefcase, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { SignUpData } from "@/lib/types/auth"

interface OnboardingStep1Props {
  onComplete: (data: any) => void
  userData: SignUpData
}

const industries = [
  "Technology",
  "FinTech",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media",
  "Real Estate",
  "Other",
]

const teamTypes = [
  "Marketing",
  "HR & Legal",
  "Product & Design",
  "Creative Production",
  "Engineering",
  "Customer Service",
  "Operations",
  "Finance",
  "IT & Support",
  "Manufacturing",
  "Sales & Account Mgmt.",
  "Other / Personal",
]

const teamSizes = ["Just me", "2-10 people", "11-50 people", "51-200 people", "200+ people"]

const useCases = [
  "Project Management",
  "Strategic Planning",
  "Team Collaboration",
  "Data Analysis",
  "Process Optimization",
  "Innovation Management",
]

export function OnboardingStep1({ onComplete, userData }: OnboardingStep1Props) {
  const [formData, setFormData] = useState({
    company: userData.company || "",
    role: userData.role || "",
    industry: "",
    team_type: "",
    team_size: "",
    use_case: "",
  })

  const [selectedTeamType, setSelectedTeamType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interactive Sentence Builder */}
          <div className="space-y-4 text-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span>I work at</span>
              <div className="relative min-w-[200px]">
                <Input
                  placeholder="Organization"
                  value={formData.company}
                  onChange={(e) => updateFormData("company", e.target.value)}
                  className="inline-block border-0 border-b-2 border-muted-foreground/30 rounded-none bg-transparent px-2 py-1 focus:border-primary"
                />
              </div>
              <span>.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span>We're in the</span>
              <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                <SelectTrigger className="inline-flex w-auto min-w-[150px] border-0 border-b-2 border-muted-foreground/30 rounded-none bg-transparent">
                  <SelectValue placeholder="Industry type" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>industry.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span>I am on</span>
              <Select
                value={formData.team_type}
                onValueChange={(value) => {
                  updateFormData("team_type", value)
                  setSelectedTeamType(value)
                }}
              >
                <SelectTrigger className="inline-flex w-auto min-w-[150px] border-0 border-b-2 border-muted-foreground/30 rounded-none bg-transparent">
                  <SelectValue placeholder="Team type" />
                </SelectTrigger>
                <SelectContent>
                  {teamTypes.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>team.</span>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Your Role
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  id="role"
                  placeholder="e.g., Product Manager"
                  value={formData.role}
                  onChange={(e) => updateFormData("role", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size" className="text-sm font-medium">
                Team Size
              </Label>
              <Select value={formData.team_size} onValueChange={(value) => updateFormData("team_size", value)}>
                <SelectTrigger>
                  <Users className="size-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="use_case" className="text-sm font-medium">
              Primary Use Case
            </Label>
            <Select value={formData.use_case} onValueChange={(value) => updateFormData("use_case", value)}>
              <SelectTrigger>
                <Target className="size-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="What will you primarily use ME Platform for?" />
              </SelectTrigger>
              <SelectContent>
                {useCases.map((useCase) => (
                  <SelectItem key={useCase} value={useCase}>
                    {useCase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-me-500 to-me-600 hover:from-me-600 hover:to-me-700"
            size="lg"
          >
            Continue
          </Button>
        </form>
      </div>

      {/* Profile Preview */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sticky top-8 space-y-4"
        >
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(userData.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{userData.full_name}</h3>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
            </div>

            {formData.company && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="size-4 text-muted-foreground" />
                  <span>{formData.company}</span>
                </div>
              </div>
            )}

            {selectedTeamType && (
              <div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedTeamType}
                </Badge>
              </div>
            )}

            {formData.industry && <div className="text-sm text-muted-foreground">{formData.industry} Industry</div>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
