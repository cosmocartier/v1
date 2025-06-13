"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, User, Target, TrendingUp } from "lucide-react"
import { useStrategic } from "@/lib/strategic-context"
import { InitiativeForm } from "@/components/forms/initiative-form"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function InitiativesPage() {
  const { initiatives } = useStrategic()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive"
      case "High":
        return "default"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleSuccess = (initiative: any) => {
    toast({
      title: "Initiative Created",
      description: `"${initiative.title}" has been successfully created.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Initiatives</h1>
          <p className="text-muted-foreground">
            Manage your outcome-driven strategic initiatives and track their progress.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Initiative
        </Button>
      </div>

      {initiatives.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No initiatives yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first strategic initiative to start tracking outcomes and progress.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Initiative
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((initiative) => (
            <Link key={initiative.id} href={`/dashboard/initiatives/${initiative.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getPriorityColor(initiative.priority)}>{initiative.priority}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {initiative.visibility}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{initiative.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{initiative.desiredOutcome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{initiative.progress}%</span>
                    </div>
                    <Progress value={initiative.progress} className="h-2" />
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{initiative.owner}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(initiative.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="line-clamp-1">{initiative.successMetric}</span>
                    </div>
                  </div>

                  {initiative.milestones && initiative.milestones.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">
                        {initiative.milestones.length} milestone{initiative.milestones.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <InitiativeForm open={showCreateForm} onOpenChange={setShowCreateForm} onSuccess={handleSuccess} />
    </div>
  )
}
