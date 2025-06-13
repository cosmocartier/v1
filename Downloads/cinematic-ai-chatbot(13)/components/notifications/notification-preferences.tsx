"use client"

import type React from "react"

import { useState } from "react"
import { Bell, Mail, Smartphone, MessageSquare, Volume2, VolumeX, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/lib/notification-context"
import type { NotificationType, NotificationChannel, NotificationPriority } from "@/lib/notification-types"

const notificationTypes: { value: NotificationType; label: string }[] = [
  { value: "deadline_created", label: "Deadline Created" },
  { value: "deadline_modified", label: "Deadline Modified" },
  { value: "deadline_completed", label: "Deadline Completed" },
  { value: "deadline_approaching", label: "Deadline Approaching" },
  { value: "deadline_overdue", label: "Deadline Overdue" },
  { value: "milestone_achieved", label: "Milestone Achieved" },
  { value: "task_assigned", label: "Task Assigned" },
  { value: "initiative_status_change", label: "Initiative Status Change" },
  { value: "operation_status_change", label: "Operation Status Change" },
]

const channels: { value: NotificationChannel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "in_app", label: "In-App", icon: Bell },
  { value: "email", label: "Email", icon: Mail },
  { value: "push", label: "Push", icon: Smartphone },
  { value: "slack", label: "Slack", icon: MessageSquare },
]

const priorities: { value: NotificationPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

export function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications()
  const [expandedType, setExpandedType] = useState<NotificationType | null>(null)

  if (!preferences) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  const updateGlobalChannel = (channel: NotificationChannel, enabled: boolean) => {
    const channelKey =
      `enable${channel.charAt(0).toUpperCase() + channel.slice(1).replace("_", "")}` as keyof typeof preferences
    updatePreferences({ [channelKey]: enabled })
  }

  const updateTypePreference = (type: NotificationType, field: string, value: any) => {
    const currentPrefs = preferences.typePreferences[type]
    updatePreferences({
      typePreferences: {
        ...preferences.typePreferences,
        [type]: {
          ...currentPrefs,
          [field]: value,
        },
      },
    })
  }

  const toggleTypeChannel = (type: NotificationType, channel: NotificationChannel) => {
    const currentChannels = preferences.typePreferences[type]?.channels || []
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel]

    updateTypePreference(type, "channels", newChannels)
  }

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-muted/50 max-h-96 overflow-y-auto">
      <div>
        <h3 className="font-medium text-sm mb-4">Notification Preferences</h3>

        {/* Global Channel Settings */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Global Channels</h4>

          {channels.map((channel) => {
            const Icon = channel.icon
            const isEnabled = preferences[
              `enable${channel.value.charAt(0).toUpperCase() + channel.value.slice(1).replace("_", "")}` as keyof typeof preferences
            ] as boolean

            return (
              <div key={channel.value} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">{channel.label}</Label>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateGlobalChannel(channel.value, checked)}
                />
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Sound & Visual Settings */}
        <div className="space-y-3 my-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sound & Visual</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {preferences.enableSounds ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm">Sound Notifications</Label>
            </div>
            <Switch
              checked={preferences.enableSounds}
              onCheckedChange={(checked) => updatePreferences({ enableSounds: checked })}
            />
          </div>

          {preferences.enableSounds && (
            <div className="ml-6">
              <Label className="text-xs text-muted-foreground">Sound Theme</Label>
              <Select
                value={preferences.soundTheme}
                onValueChange={(value) => updatePreferences({ soundTheme: value as any })}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Visual Cues</Label>
            </div>
            <Switch
              checked={preferences.enableVisualCues}
              onCheckedChange={(checked) => updatePreferences({ enableVisualCues: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div className="space-y-3 my-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quiet Hours</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Enable Quiet Hours</Label>
            </div>
            <Switch
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) =>
                updatePreferences({
                  quietHours: { ...preferences.quietHours, enabled: checked },
                })
              }
            />
          </div>

          {preferences.quietHours.enabled && (
            <div className="ml-6 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={preferences.quietHours.startTime}
                    onChange={(e) =>
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, startTime: e.target.value },
                      })
                    }
                    className="h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={preferences.quietHours.endTime}
                    onChange={(e) =>
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, endTime: e.target.value },
                      })
                    }
                    className="h-8 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Per-Type Settings */}
        <div className="space-y-3 my-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notification Types</h4>

          {notificationTypes.map((type) => {
            const typePrefs = preferences.typePreferences[type.value]
            const isExpanded = expandedType === type.value

            return (
              <div key={type.value} className="border rounded-lg p-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedType(isExpanded ? null : type.value)}
                >
                  <div className="flex items-center gap-2">
                    <Label className="text-sm cursor-pointer">{type.label}</Label>
                    <Badge variant={typePrefs?.priority === "critical" ? "destructive" : "outline"} className="text-xs">
                      {typePrefs?.priority || "medium"}
                    </Badge>
                  </div>
                  <Switch
                    checked={typePrefs?.enabled ?? true}
                    onCheckedChange={(checked) => updateTypePreference(type.value, "enabled", checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {isExpanded && typePrefs?.enabled && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select
                        value={typePrefs.priority}
                        onValueChange={(value) => updateTypePreference(type.value, "priority", value)}
                      >
                        <SelectTrigger className="h-8 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Channels</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {channels.map((channel) => (
                          <Badge
                            key={channel.value}
                            variant={typePrefs.channels.includes(channel.value) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleTypeChannel(type.value, channel.value)}
                          >
                            {channel.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
