"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InitiativeForm } from "@/components/forms/initiative-form"
import { useToast } from "@/hooks/use-toast"

interface DashboardInitiativeButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  showText?: boolean
}

export function DashboardInitiativeButton({
  variant = "default",
  size = "default",
  className = "",
  showText = true,
}: DashboardInitiativeButtonProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  const handleSuccess = (initiative: any) => {
    toast({
      title: "Initiative Created",
      description: `"${initiative.title}" has been successfully created and is now available in your initiatives list.`,
    })
    setShowCreateForm(false)
  }

  return (
    <>
      <Button onClick={() => setShowCreateForm(true)} variant={variant} size={size} className={className}>
        <Plus className="w-4 h-4" />
        {showText && <span className="ml-2">New Initiative</span>}
      </Button>

      <InitiativeForm open={showCreateForm} onOpenChange={setShowCreateForm} onSuccess={handleSuccess} />
    </>
  )
}
