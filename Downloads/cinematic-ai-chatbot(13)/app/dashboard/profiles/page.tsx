"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Plus, Search, Filter, Grid3X3, List, X } from "lucide-react"
import { ProfileCard } from "@/components/profiles/profile-card"
import { ProfileForm } from "@/components/profiles/profile-form"
import { ProfileDetail } from "@/components/profiles/profile-detail"
import { useProfiles } from "@/lib/profile-context"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/profile-types"
import { cn } from "@/lib/utils"

export default function ProfilesPage() {
  const { profiles, createProfile, updateProfile, deleteProfile, generateAnalysis, isLoading } = useProfiles()
  const { toast } = useToast()

  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Modal State
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Get unique departments for filtering
  const departments = Array.from(new Set(profiles.map((p) => p.department).filter(Boolean)))

  // Filter profiles
  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.department && profile.department.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesDepartment = selectedDepartment === "all" || profile.department === selectedDepartment

    return matchesSearch && matchesDepartment
  })

  // Calculate stats
  const stats = {
    total: profiles.length,
    withInsights: profiles.filter((p) => p.psychologicalInsights.length > 0).length,
    avgPersonalityScore:
      profiles.length > 0
        ? Math.round(
            profiles.reduce((sum, p) => {
              const avgScore =
                p.personalityTraits.length > 0
                  ? p.personalityTraits.reduce((s, t) => s + t.score, 0) / p.personalityTraits.length
                  : 0
              return sum + avgScore
            }, 0) / profiles.length,
          )
        : 0,
    departments: departments.length,
  }

  const handleCreateProfile = async (
    profileData: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy" | "psychologicalInsights">,
  ) => {
    try {
      await createProfile(profileData)
      setShowCreateForm(false)
      toast({
        title: "Profile Created",
        description: `Profile for ${profileData.name} has been created successfully.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create profile. Please try again.",
      })
    }
  }

  const handleUpdateProfile = async (
    profileData: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy" | "psychologicalInsights">,
  ) => {
    if (!selectedProfile) return

    try {
      await updateProfile(selectedProfile.id, profileData)
      setShowEditForm(false)
      setSelectedProfile(null)
      toast({
        title: "Profile Updated",
        description: `Profile for ${profileData.name} has been updated successfully.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      })
    }
  }

  const handleDeleteProfile = async (profile: Profile) => {
    if (!confirm(`Are you sure you want to delete ${profile.name}'s profile?`)) return

    try {
      await deleteProfile(profile.id)
      toast({
        title: "Profile Deleted",
        description: `Profile for ${profile.name} has been deleted.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete profile. Please try again.",
      })
    }
  }

  const handleGenerateInsights = async (profile: Profile) => {
    try {
      await generateAnalysis(profile.id, "personality")
      toast({
        title: "Insights Generated",
        description: `AI insights have been generated for ${profile.name}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate insights. Please try again.",
      })
    }
  }

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile)
    setShowDetailView(true)
  }

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile)
    setShowEditForm(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-optimized Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">Character Profiles</h1>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl">
              Psychological analysis and insights for better interpersonal interactions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-black hover:bg-neutral-100 neo-interactive w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Profile
            </Button>
          </div>
        </div>

        {/* Mobile-optimized Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-card border-neutral-800">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs sm:text-sm text-white/70">Total Profiles</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-neutral-800">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-neo-accent">{stats.withInsights}</div>
                <div className="text-xs sm:text-sm text-white/70">With AI Insights</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-neutral-800">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-neo-success">{stats.avgPersonalityScore}%</div>
                <div className="text-xs sm:text-sm text-white/70">Avg Personality</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-neutral-800">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-neo-warning">{stats.departments}</div>
                <div className="text-xs sm:text-sm text-white/70">Departments</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile-optimized Search and Filters */}
      <Card className="bg-card border-neutral-800">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search profiles by name, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-neutral-700 text-white placeholder:text-white/40 h-10 sm:h-12"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden border-neutral-700 text-white/70 hover:text-white hover:bg-white/5"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {showMobileFilters && <X className="w-4 h-4 ml-2" />}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters Row - Always visible on desktop, toggleable on mobile */}
            <div className={cn("flex flex-col sm:flex-row gap-3 sm:gap-4", !showMobileFilters && "hidden sm:flex")}>
              <div className="flex-1">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="bg-white/5 border-neutral-700 text-white h-10">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedDepartment !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedDepartment("all")
                  }}
                  className="border-neutral-700 text-white/70 hover:text-white hover:bg-white/5 w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>
          Showing {filteredProfiles.length} of {profiles.length} profiles
        </span>
        {filteredProfiles.length === 0 && searchQuery && (
          <span className="text-white/50">No profiles match your search</span>
        )}
      </div>

      {/* Mobile-optimized Profiles Grid/List */}
      {filteredProfiles.length === 0 ? (
        <Card className="bg-card border-neutral-800">
          <CardContent className="p-8 sm:p-12 text-center">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              {profiles.length === 0 ? "No profiles yet" : "No matching profiles"}
            </h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              {profiles.length === 0
                ? "Create your first character profile to start building psychological insights."
                : "Try adjusting your search criteria or filters to find profiles."}
            </p>
            {profiles.length === 0 && (
              <Button onClick={() => setShowCreateForm(true)} className="bg-white text-black hover:bg-neutral-100">
                <Plus className="w-4 h-4 mr-2" />
                Create First Profile
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-3 sm:space-y-4",
          )}
        >
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onView={handleViewProfile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
              onGenerateInsights={handleGenerateInsights}
            />
          ))}
        </div>
      )}

      {/* Create Profile Modal */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <ProfileForm onSave={handleCreateProfile} onCancel={() => setShowCreateForm(false)} isLoading={isLoading} />
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <ProfileForm
              profile={selectedProfile}
              onSave={handleUpdateProfile}
              onCancel={() => {
                setShowEditForm(false)
                setSelectedProfile(null)
              }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Detail Modal */}
      <Dialog open={showDetailView} onOpenChange={setShowDetailView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <ProfileDetail
              profile={selectedProfile}
              onEdit={handleEditProfile}
              onGenerateInsights={handleGenerateInsights}
              onClose={() => {
                setShowDetailView(false)
                setSelectedProfile(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
