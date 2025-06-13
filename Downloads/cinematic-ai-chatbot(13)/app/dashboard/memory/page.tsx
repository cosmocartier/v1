"use client"

import { MemoryPanel } from "@/components/memory/memory-panel"

export default function MemoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">Organizational memory and context management</p>
      </div>
      <MemoryPanel />
    </div>
  )
}
