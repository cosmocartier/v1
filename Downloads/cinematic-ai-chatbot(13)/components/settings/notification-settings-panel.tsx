"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/lib/settings-context"
import { Separator } from "@/components/ui/separator"
import { Mail, Smartphone, Bell } from "lucide-react"

export function NotificationSettingsPanel() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Configure email notification preferences and frequency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.notifications.email.enabled}
              onCheckedChange={(checked) =>
                updateSettings("notifications", {
                  email: { ...settings.notifications.email, enabled: checked },
                })
              }
            />
          </div>

          {settings.notifications.email.enabled && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label>Email Frequency</Label>
                <Select
                  value={settings.notifications.email.frequency}
                  onValueChange={(value) =>
                    updateSettings("notifications", {
                      email: { ...settings.notifications.email, frequency: value as any },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Email Types</Label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Task Deadlines</Label>
                    <Switch
                      checked={settings.notifications.email.types.taskDeadlines}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          email: {
                            ...settings.notifications.email,
                            types: { ...settings.notifications.email.types, taskDeadlines: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Milestone Updates</Label>
                    <Switch
                      checked={settings.notifications.email.types.milestoneUpdates}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          email: {
                            ...settings.notifications.email,
                            types: { ...settings.notifications.email.types, milestoneUpdates: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">System Alerts</Label>
                    <Switch
                      checked={settings.notifications.email.types.systemAlerts}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          email: {
                            ...settings.notifications.email,
                            types: { ...settings.notifications.email.types, systemAlerts: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Weekly Digest</Label>
                    <Switch
                      checked={settings.notifications.email.types.weeklyDigest}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          email: {
                            ...settings.notifications.email,
                            types: { ...settings.notifications.email.types, weeklyDigest: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Team Updates</Label>
                    <Switch
                      checked={settings.notifications.email.types.teamUpdates}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          email: {
                            ...settings.notifications.email,
                            types: { ...settings.notifications.email.types, teamUpdates: checked },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Configure push notifications for real-time alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive real-time push notifications</p>
            </div>
            <Switch
              checked={settings.notifications.push.enabled}
              onCheckedChange={(checked) =>
                updateSettings("notifications", {
                  push: { ...settings.notifications.push, enabled: checked },
                })
              }
            />
          </div>

          {settings.notifications.push.enabled && (
            <>
              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Push Notification Types</Label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Urgent Alerts</Label>
                    <Switch
                      checked={settings.notifications.push.types.urgentAlerts}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          push: {
                            ...settings.notifications.push,
                            types: { ...settings.notifications.push.types, urgentAlerts: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Task Reminders</Label>
                    <Switch
                      checked={settings.notifications.push.types.taskReminders}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          push: {
                            ...settings.notifications.push,
                            types: { ...settings.notifications.push.types, taskReminders: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Mentions</Label>
                    <Switch
                      checked={settings.notifications.push.types.mentions}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          push: {
                            ...settings.notifications.push,
                            types: { ...settings.notifications.push.types, mentions: checked },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">System Updates</Label>
                    <Switch
                      checked={settings.notifications.push.types.systemUpdates}
                      onCheckedChange={(checked) =>
                        updateSettings("notifications", {
                          push: {
                            ...settings.notifications.push,
                            types: { ...settings.notifications.push.types, systemUpdates: checked },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>Configure notifications within the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications within the application</p>
            </div>
            <Switch
              checked={settings.notifications.inApp.enabled}
              onCheckedChange={(checked) =>
                updateSettings("notifications", {
                  inApp: { ...settings.notifications.inApp, enabled: checked },
                })
              }
            />
          </div>

          {settings.notifications.inApp.enabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.inApp.sound}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", {
                      inApp: { ...settings.notifications.inApp, sound: checked },
                    })
                  }
                />
              </div>

              {settings.notifications.inApp.sound && (
                <div className="space-y-2">
                  <Label>Sound Type</Label>
                  <Select
                    value={settings.notifications.inApp.soundType}
                    onValueChange={(value) =>
                      updateSettings("notifications", {
                        inApp: { ...settings.notifications.inApp, soundType: value as any },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Badges</Label>
                  <p className="text-sm text-muted-foreground">Display notification badges on navigation items</p>
                </div>
                <Switch
                  checked={settings.notifications.inApp.showBadges}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", {
                      inApp: { ...settings.notifications.inApp, showBadges: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Mark as Read</Label>
                  <p className="text-sm text-muted-foreground">Automatically mark notifications as read when viewed</p>
                </div>
                <Switch
                  checked={settings.notifications.inApp.autoMarkRead}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", {
                      inApp: { ...settings.notifications.inApp, autoMarkRead: checked },
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
