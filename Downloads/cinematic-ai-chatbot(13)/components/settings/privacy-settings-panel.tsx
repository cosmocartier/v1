"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/lib/settings-context"
import { Separator } from "@/components/ui/separator"

export function PrivacySettingsPanel() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data & Privacy</CardTitle>
          <CardDescription>Control how your data is collected and used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Collection</Label>
              <p className="text-sm text-muted-foreground">Allow data collection for service improvement</p>
            </div>
            <Switch
              checked={settings.privacy.dataCollection}
              onCheckedChange={(checked) => updateSettings("privacy", { dataCollection: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics</Label>
              <p className="text-sm text-muted-foreground">Enable usage analytics</p>
            </div>
            <Switch
              checked={settings.privacy.analytics}
              onCheckedChange={(checked) => updateSettings("privacy", { analytics: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Crash Reporting</Label>
              <p className="text-sm text-muted-foreground">Send crash reports to help improve stability</p>
            </div>
            <Switch
              checked={settings.privacy.crashReporting}
              onCheckedChange={(checked) => updateSettings("privacy", { crashReporting: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
