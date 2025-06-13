"use client"

import type React from "react"

import { useState } from "react"
import { InitiativeForm } from "@/components/forms/initiative-form"
import { useToast } from "@/hooks/use-toast"

interface InitiativeCreationHandlerProps {
  children: (props: { onCreateInitiative: () => void }) => React.ReactNode
}

export function InitiativeCreationHandler({ children }: InitiativeCreationHandlerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  const handleCreateInitiative = () => {
    setShowCreateForm(true)
  }

  const handleSuccess = (initiative: any) => {
    toast({
      title: "Initiative Created",
      description: `"${initiative.title}" has been successfully created and is now available in your initiatives list.`,
    })
    setShowCreateForm(false)
  }

  return (
    <>
      {children({ onCreateInitiative: handleCreateInitiative })}
      <InitiativeForm open={showCreateForm} onOpenChange={setShowCreateForm} onSuccess={handleSuccess} />
    </>
  )
}
