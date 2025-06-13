"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/lib/settings-context"
import { Separator } from "@/components/ui/separator"

export function AISettingsPanel() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="space-y-6">
      {/* Personality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personality & Tone</CardTitle>
          <CardDescription>Configure how the AI assistant communicates with you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone">Communication Tone</Label>
              <Select value={settings.ai.tone} onValueChange={(value) => updateSettings("ai", { tone: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verbosity">Response Length</Label>
              <Select
                value={settings.ai.verbosity}
                onValueChange={(value) => updateSettings("ai", { verbosity: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Creativity Level: {settings.ai.creativity}%</Label>
            <Slider
              value={[settings.ai.creativity]}
              onValueChange={([value]) => updateSettings("ai", { creativity: value })}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Higher values make responses more creative and varied</p>
          </div>
        </CardContent>
      </Card>

      {/* Response Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response Style</CardTitle>
          <CardDescription>Customize how the AI structures and presents information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responseStyle">Response Style</Label>
              <Select
                value={settings.ai.responseStyle}
                onValueChange={(value) => updateSettings("ai", { responseStyle: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="explanatory">Explanatory</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise Level</Label>
              <Select
                value={settings.ai.expertise}
                onValueChange={(value) => updateSettings("ai", { expertise: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response Features</CardTitle>
          <CardDescription>Control what additional elements are included in responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Emojis</Label>
              <p className="text-sm text-muted-foreground">Include emojis to make responses more engaging</p>
            </div>
            <Switch
              checked={settings.ai.useEmojis}
              onCheckedChange={(checked) => updateSettings("ai", { useEmojis: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Examples</Label>
              <p className="text-sm text-muted-foreground">Provide practical examples when explaining concepts</p>
            </div>
            <Switch
              checked={settings.ai.includeExamples}
              onCheckedChange={(checked) => updateSettings("ai", { includeExamples: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Provide Sources</Label>
              <p className="text-sm text-muted-foreground">Include references and sources when available</p>
            </div>
            <Switch
              checked={settings.ai.provideSources}
              onCheckedChange={(checked) => updateSettings("ai", { provideSources: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
