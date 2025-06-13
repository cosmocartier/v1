"use client"
import { Settings, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { type GraphSettings, defaultGraphSettings } from "@/lib/graph-data-processor"

interface GraphSettingsPanelProps {
  settings: GraphSettings
  onSettingsChange: (settings: GraphSettings) => void
  isOpen: boolean
  onToggle: () => void
}

export function GraphSettingsPanel({ settings, onSettingsChange, isOpen, onToggle }: GraphSettingsPanelProps) {
  const handleSliderChange = (key: keyof GraphSettings, value: number[]) => {
    onSettingsChange({
      ...settings,
      [key]: value[0],
    })
  }

  const handleSwitchChange = (key: keyof GraphSettings, checked: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: checked,
    })
  }

  const resetToDefaults = () => {
    onSettingsChange(defaultGraphSettings)
  }

  if (!isOpen) {
    return (
      <Button onClick={onToggle} className="fixed top-4 right-4 z-50 shadow-lg" size="sm">
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 max-h-[90vh] overflow-y-auto shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Graph Settings</CardTitle>
        <div className="flex gap-2">
          <Button onClick={resetToDefaults} variant="outline" size="sm" className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={onToggle} variant="outline" size="sm" className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Visual Settings</h3>

          <div className="space-y-2">
            <Label className="text-sm">Text Fade Threshold: {settings.textFadeThreshold}</Label>
            <Slider
              value={[settings.textFadeThreshold]}
              onValueChange={(value) => handleSliderChange("textFadeThreshold", value)}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls when node labels become visible based on zoom level
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Node Size: {settings.nodeSize.toFixed(1)}x</Label>
            <Slider
              value={[settings.nodeSize]}
              onValueChange={(value) => handleSliderChange("nodeSize", value)}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Adjusts the overall size of all nodes</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Line Thickness: {settings.lineThickness}px</Label>
            <Slider
              value={[settings.lineThickness]}
              onValueChange={(value) => handleSliderChange("lineThickness", value)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Controls the thickness of connection lines</p>
          </div>
        </div>

        <Separator />

        {/* Physics Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Physics Settings</h3>

          <div className="space-y-2">
            <Label className="text-sm">Center Force: {settings.centerForce}</Label>
            <Slider
              value={[settings.centerForce]}
              onValueChange={(value) => handleSliderChange("centerForce", value)}
              min={-300}
              max={0}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Strength of gravitational pull toward center</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Repel Force: {settings.repelForce}</Label>
            <Slider
              value={[settings.repelForce]}
              onValueChange={(value) => handleSliderChange("repelForce", value)}
              min={-1000}
              max={-50}
              step={25}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">How strongly nodes push away from each other</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Link Force: {settings.linkForce.toFixed(1)}</Label>
            <Slider
              value={[settings.linkForce]}
              onValueChange={(value) => handleSliderChange("linkForce", value)}
              min={0.1}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Strength of connections between related nodes</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Link Distance: {settings.linkDistance}px</Label>
            <Slider
              value={[settings.linkDistance]}
              onValueChange={(value) => handleSliderChange("linkDistance", value)}
              min={30}
              max={200}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Ideal distance between connected nodes</p>
          </div>
        </div>

        <Separator />

        {/* Filter Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Node Filters</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Initiatives</Label>
              <Switch
                checked={settings.showInitiatives}
                onCheckedChange={(checked) => handleSwitchChange("showInitiatives", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Operations</Label>
              <Switch
                checked={settings.showOperations}
                onCheckedChange={(checked) => handleSwitchChange("showOperations", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Milestones</Label>
              <Switch
                checked={settings.showMilestones}
                onCheckedChange={(checked) => handleSwitchChange("showMilestones", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show Tasks</Label>
              <Switch
                checked={settings.showTasks}
                onCheckedChange={(checked) => handleSwitchChange("showTasks", checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
