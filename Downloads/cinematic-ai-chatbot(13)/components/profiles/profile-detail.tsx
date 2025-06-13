"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Phone,
  Building2,
  MessageCircle,
  TrendingUp,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
  Edit,
  BarChart3,
} from "lucide-react"
import type { Profile, PsychologicalInsight } from "@/lib/profile-types"

interface ProfileDetailProps {
  profile: Profile
  onEdit: (profile: Profile) => void
  onGenerateInsights: (profile: Profile) => void
  onClose: () => void
}

export function ProfileDetail({ profile, onEdit, onGenerateInsights, onClose }: ProfileDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getInsightIcon = (category: PsychologicalInsight["category"]) => {
    switch (category) {
      case "strength":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "opportunity":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "growth":
        return <Target className="h-4 w-4 text-yellow-500" />
      case "blind_spot":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getInsightColor = (category: PsychologicalInsight["category"]) => {
    switch (category) {
      case "strength":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "opportunity":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "growth":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "blind_spot":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  const groupedInsights = profile.psychologicalInsights.reduce(
    (acc, insight) => {
      if (!acc[insight.category]) {
        acc[insight.category] = []
      }
      acc[insight.category].push(insight)
      return acc
    },
    {} as Record<string, PsychologicalInsight[]>,
  )

  const averagePersonalityScore =
    profile.personalityTraits.length > 0
      ? Math.round(
          profile.personalityTraits.reduce((sum, trait) => sum + trait.score, 0) / profile.personalityTraits.length,
        )
      : 0

  const topMotivationDriver =
    profile.motivationDrivers.length > 0
      ? profile.motivationDrivers.reduce((prev, current) => (prev.strength > current.strength ? prev : current))
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-lg text-muted-foreground">{profile.role}</p>
            {profile.department && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 mr-1" />
                {profile.department}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {profile.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.email}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {profile.phone}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(profile)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => onGenerateInsights(profile)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      {/* Tags */}
      {profile.tags && profile.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="motivation">Motivation</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Personality Score</span>
                  <span className="font-bold">{averagePersonalityScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Insights</span>
                  <span className="font-bold">{profile.psychologicalInsights.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Communication Style</span>
                  <Badge variant="outline">{profile.communicationStyle.primary}</Badge>
                </div>
                {topMotivationDriver && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Top Motivation</span>
                    <Badge variant="outline">{topMotivationDriver.type}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Insights */}
            {profile.quickInsights && profile.quickInsights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Quick Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profile.quickInsights.slice(0, 3).map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Meeting Prep */}
            {profile.meetingPrep && profile.meetingPrep.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Meeting Prep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profile.meetingPrep.slice(0, 3).map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Working Style Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Working Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Environment</div>
                  <div className="font-medium capitalize">{profile.workingStyle.environment}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Pace</div>
                  <div className="font-medium capitalize">{profile.workingStyle.pace}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Decision Making</div>
                  <div className="font-medium capitalize">{profile.workingStyle.decisionMaking}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Feedback</div>
                  <div className="font-medium capitalize">{profile.workingStyle.feedbackPreference}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality Traits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.personalityTraits.map((trait) => (
                <div key={trait.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{trait.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {trait.category}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{trait.score}%</span>
                  </div>
                  <Progress value={trait.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{trait.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Primary Style:</span>
                <Badge variant="secondary" className="capitalize">
                  {profile.communicationStyle.primary}
                </Badge>
              </div>

              {profile.communicationTips && profile.communicationTips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Communication Tips</h4>
                  <ul className="space-y-1">
                    {profile.communicationTips.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Motivation Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.motivationDrivers.map((driver) => (
                <div key={driver.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{driver.type}</span>
                    <span className="text-sm text-muted-foreground">{driver.strength}%</span>
                  </div>
                  <Progress value={driver.strength} className="h-2" />
                  <p className="text-xs text-muted-foreground">{driver.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {Object.entries(groupedInsights).map(([category, insights]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getInsightIcon(category as PsychologicalInsight["category"])}
                  {category.replace("_", " ")}s ({insights.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-lg border ${getInsightColor(insight.category)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{insight.description}</p>
                    {insight.actionableAdvice.length > 0 && (
                      <div className="space-y-1">
                        <h5 className="text-xs font-medium uppercase tracking-wide">Actionable Advice</h5>
                        <ul className="space-y-1">
                          {insight.actionableAdvice.map((advice, index) => (
                            <li key={index} className="text-xs">
                              • {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {profile.psychologicalInsights.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No AI Insights Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate psychological insights to better understand this person's behavior and preferences.
                </p>
                <Button onClick={() => onGenerateInsights(profile)}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
