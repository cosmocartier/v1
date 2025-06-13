"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    // Default to daily chat
    router.push("/chat/daily")
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
