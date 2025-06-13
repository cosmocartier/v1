"use client"

import { useSettings } from "@/lib/settings-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Check, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function IntegrationSettingsPanel() {
  const { settings, updateSettings } = useSettings()
  const { integrations } = settings
  const [testingCalendar, setTestingCalendar] = useState(false)
  const [calendarTestResult, setCalendarTestResult] = useState<"success" | "error" | null>(null)
  const [testingSlack, setTestingSlack] = useState(false)
  const [slackTestResult, setSlackTestResult] = useState<"success" | "error" | null>(null)

  const testCalendarConnection = async () => {
    setTestingCalendar(true)
    setCalendarTestResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate success (in a real app, this would be based on actual API response)
    setCalendarTestResult(integrations.calendar.provider !== "none" ? "success" : "error")
    setTestingCalendar(false)
  }

  const testSlackConnection = async () => {
    setTestingSlack(true)
    setSlackTestResult(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate success (in a real app, this would be based on actual API response)
    setSlackTestResult(integrations.slack.webhook ? "success" : "error")
    setTestingSlack(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendar Integration</CardTitle>
          <CardDescription>Connect your calendar for better scheduling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Calendar Integration</Label>
            <Switch
              checked={settings.integrations.calendar.enabled}
              onCheckedChange={(checked) =>
                updateSettings("integrations", {
                  calendar: { ...settings.integrations.calendar, enabled: checked },
                })
              }
            />
          </div>

          {settings.integrations.calendar.enabled && (
            <div className="space-y-2">
              <Label>Calendar Provider</Label>
              <Select
                value={settings.integrations.calendar.provider}
                onValueChange={(value) =>
                  updateSettings("integrations", {
                    calendar: { ...settings.integrations.calendar, provider: value as any },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Slack Integration
            </h3>
            <p className="text-sm text-muted-foreground">Connect to Slack to receive notifications and updates.</p>
          </div>
          <Switch
            id="slack-enabled"
            checked={integrations.slack.enabled}
            onCheckedChange={(checked) =>
              updateSettings("integrations", {
                slack: { ...integrations.slack, enabled: checked },
              })
            }
          />
        </div>

        {integrations.slack.enabled && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={integrations.slack.webhook}
                onChange={(e) =>
                  updateSettings("integrations", {
                    slack: { ...integrations.slack, webhook: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack-channels">Slack Channels (comma separated)</Label>
              <Input
                id="slack-channels"
                placeholder="#general, #notifications"
                value={integrations.slack.channels.join(", ")}
                onChange={(e) =>
                  updateSettings("integrations", {
                    slack: { ...integrations.slack, channels: e.target.value.split(",").map((c) => c.trim()) },
                  })
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={testSlackConnection}
                disabled={testingSlack || !integrations.slack.webhook}
              >
                {testingSlack ? "Testing..." : "Test Connection"}
              </Button>

              {slackTestResult === "success" && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Connected
                </Badge>
              )}

              {slackTestResult === "error" && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Connection Failed
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Integration
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure email provider for notifications and communications.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-provider">Email Provider</Label>
          <Select
            value={integrations.email.provider}
            onValueChange={(value) =>
              updateSettings("integrations", {
                email: { ...integrations.email, provider: value as typeof integrations.email.provider },
              })
            }
          >
            <SelectTrigger id="email-provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gmail">Gmail</SelectItem>
              <SelectItem value="outlook">Outlook</SelectItem>
              <SelectItem value="smtp">Custom SMTP</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {integrations.email.provider === "smtp" && (
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">Username</Label>
                <Input id="smtp-username" placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Password</Label>
                <Input id="smtp-password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smtp-secure">Use Secure Connection (TLS)</Label>
              <Switch id="smtp-secure" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
