"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InitiativeForm } from "@/components/forms/initiative-form"

interface InitiativeModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function InitiativeModal({ open, setOpen }: InitiativeModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Initiative</DialogTitle>
        </DialogHeader>
        <InitiativeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
