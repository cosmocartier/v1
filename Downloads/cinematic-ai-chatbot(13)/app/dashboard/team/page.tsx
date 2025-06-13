"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Strategic Lead",
      email: "sarah@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      activeInitiatives: 3,
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Operations Manager",
      email: "mike@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "away",
      activeInitiatives: 2,
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Project Coordinator",
      email: "emily@company.com",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
      activeInitiatives: 4,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and collaboration</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant={member.status === "online" ? "default" : "secondary"}>{member.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Initiatives:</span>
                  <Badge variant="outline">{member.activeInitiatives}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
