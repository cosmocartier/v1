"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Mail,
  Phone,
  Building2,
  MessageCircle,
  TrendingUp,
  Eye,
  MoreHorizontal,
  Calendar,
  Target,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Profile } from "@/lib/profile-types"

interface ProfileCardProps {
  profile: Profile
  onView: (profile: Profile) => void
  onEdit: (profile: Profile) => void
  onDelete: (profile: Profile) => void
  onGenerateInsights: (profile: Profile) => void
}

export function ProfileCard({ profile, onView, onEdit, onDelete, onGenerateInsights }: ProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getTopPersonalityTrait = () => {
    if (profile.personalityTraits.length === 0) return null
    return profile.personalityTraits.reduce((prev, current) => (prev.score > current.score ? prev : current))
  }

  const getInsightCounts = () => {
    const counts = {
      strength: 0,
      opportunity: 0,
      growth: 0,
      blind_spot: 0,
    }

    profile.psychologicalInsights.forEach((insight) => {
      counts[insight.category]++
    })

    return counts
  }

  const topTrait = getTopPersonalityTrait()
  const insightCounts = getInsightCounts()
  const totalInsights = profile.psychologicalInsights.length

  return (
    <Card
      className="group relative overflow-hidden border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(profile)}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-bold text-lg leading-none">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
              {profile.department && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3 mr-1" />
                  {profile.department}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onView(profile)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(profile)
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onGenerateInsights(profile)
                }}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Insights
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(profile)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Target className="h-4 w-4 mr-2" />
                Delete Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="flex flex-wrap gap-2 text-xs">
          {profile.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[120px]">{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-3 w-3 mr-1" />
              {profile.phone}
            </div>
          )}
        </div>

        {/* Top Personality Trait */}
        {topTrait && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Top Trait: {topTrait.name}</span>
              <span className="text-muted-foreground">{topTrait.score}%</span>
            </div>
            <Progress value={topTrait.score} className="h-2" />
          </div>
        )}

        {/* Communication Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">Communication</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {profile.communicationStyle.primary}
          </Badge>
        </div>

        {/* Insights Summary */}
        {totalInsights > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">AI Insights</span>
              <span className="text-muted-foreground">{totalInsights} total</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <div className="text-center">
                <div className="text-xs font-bold text-green-500">{insightCounts.strength}</div>
                <div className="text-[10px] text-muted-foreground">Strengths</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-blue-500">{insightCounts.opportunity}</div>
                <div className="text-[10px] text-muted-foreground">Opps</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-yellow-500">{insightCounts.growth}</div>
                <div className="text-[10px] text-muted-foreground">Growth</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-red-500">{insightCounts.blind_spot}</div>
                <div className="text-[10px] text-muted-foreground">Blind</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onView(profile)
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onGenerateInsights(profile)
            }}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Analyze
          </Button>
        </div>

        {/* Last Updated */}
        <div className="flex items-center text-xs text-muted-foreground pt-1 border-t">
          <Calendar className="h-3 w-3 mr-1" />
          Updated {new Date(profile.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>

      {/* Hover Effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none transition-opacity duration-300" />
      )}
    </Card>
  )
}
