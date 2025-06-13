"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSettings } from "@/lib/settings-context"
import { AISettingsPanel } from "@/components/settings/ai-settings-panel"
import { NotificationSettingsPanel } from "@/components/settings/notification-settings-panel"
import { AppearanceSettingsPanel } from "@/components/settings/appearance-settings-panel"
import { PrivacySettingsPanel } from "@/components/settings/privacy-settings-panel"
import { IntegrationSettingsPanel } from "@/components/settings/integration-settings-panel"
import { SecuritySettingsPanel } from "@/components/settings/security-settings-panel"
import { GeneralSettingsPanel } from "@/components/settings/general-settings-panel"
import { Bot, Bell, Palette, Shield, Plug, Lock, SettingsIcon, Download, Upload, RotateCcw, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { settings, resetSettings, exportSettings, importSettings, hasUnsavedChanges, isLoading } = useSettings()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("ai")

  const handleExportSettings = () => {
    try {
      const settingsData = exportSettings()
      const blob = new Blob([settingsData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `machine-excellence-settings-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Settings Exported",
        description: "Your settings have been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImportSettings = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const success = await importSettings(text)
          if (success) {
            toast({
              title: "Settings Imported",
              description: "Your settings have been imported successfully.",
            })
          } else {
            toast({
              title: "Import Failed",
              description: "Invalid settings file. Please check the file format.",
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to read the settings file.",
            variant: "destructive",
          })
        }
      }
    }
    input.click()
  }

  const handleResetAll = async () => {
    try {
      await resetSettings()
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults.",
      })
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const settingsTabs = [
    {
      id: "ai",
      label: "AI Assistant",
      icon: Bot,
      description: "Customize AI behavior and responses",
      component: AISettingsPanel,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Manage notification preferences",
      component: NotificationSettingsPanel,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      description: "Customize visual settings",
      component: AppearanceSettingsPanel,
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Shield,
      description: "Control data and privacy settings",
      component: PrivacySettingsPanel,
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: Plug,
      description: "Connect external services",
      component: IntegrationSettingsPanel,
    },
    {
      id: "security",
      label: "Security",
      icon: Lock,
      description: "Security and authentication",
      component: SecuritySettingsPanel,
    },
    {
      id: "general",
      label: "General",
      icon: SettingsIcon,
      description: "General application settings",
      component: GeneralSettingsPanel,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Customize your experience and manage application preferences.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="w-fit">
              <Save className="h-3 w-3 mr-1" />
              Auto-saving...
            </Badge>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImportSettings}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Settings Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Tabs List */}
        <div className="block sm:hidden">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            {settingsTabs.slice(0, 4).map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-1 p-3 text-xs">
                <tab.icon className="h-4 w-4" />
                <span className="truncate">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {settingsTabs.length > 4 && (
            <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1 mt-2">
              {settingsTabs.slice(4).map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-1 p-3 text-xs">
                  <tab.icon className="h-4 w-4" />
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}
        </div>

        {/* Desktop Tabs List */}
        <div className="hidden sm:block">
          <TabsList className="grid w-full grid-cols-7 gap-1 h-auto p-1">
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-2 p-4">
                <tab.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className="text-xs text-muted-foreground hidden lg:block">{tab.description}</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        {settingsTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <tab.component />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
