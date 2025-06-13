"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Plus, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automation</h1>
          <p className="text-muted-foreground">Automated workflows and intelligent rules</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Automation
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Task Auto-Assignment
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <Button variant="ghost" size="sm">
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Automatically assigns tasks based on team member expertise and workload.
            </p>
            <div className="text-xs text-muted-foreground">Triggered: 24 times this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Deadline Notifications
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Active</Badge>
                <Button variant="ghost" size="sm">
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Sends notifications 3 days, 1 day, and 2 hours before deadlines.
            </p>
            <div className="text-xs text-muted-foreground">Triggered: 12 times this week</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
