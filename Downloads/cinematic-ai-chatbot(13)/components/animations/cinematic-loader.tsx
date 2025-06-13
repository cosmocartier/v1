"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CinematicLoaderProps {
  isLoading: boolean
  onComplete: () => void
  agentName?: string
  className?: string
}

export function CinematicLoader({ isLoading, onComplete, agentName, className }: CinematicLoaderProps) {
  const [stage, setStage] = useState<"initializing" | "connecting" | "processing" | "complete">("initializing")
  const [progress, setProgress] = useState(0)
  const [showFinalMessage, setShowFinalMessage] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setStage("initializing")
      setProgress(0)
      setShowFinalMessage(false)
      return
    }

    // Stage 1: Initializing
    const timer1 = setTimeout(() => {
      setStage("connecting")
    }, 1500)

    // Stage 2: Connecting
    const timer2 = setTimeout(() => {
      setStage("processing")
    }, 3000)

    // Stage 3: Processing
    const timer3 = setTimeout(() => {
      setStage("complete")
    }, 4500)

    // Final message
    const timer4 = setTimeout(() => {
      setShowFinalMessage(true)
    }, 5000)

    // Complete animation
    const timer5 = setTimeout(() => {
      onComplete()
    }, 6500)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearInterval(progressInterval)
    }
  }, [isLoading, onComplete])

  if (!isLoading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center",
          className,
        )}
      >
        <div className="w-full max-w-md px-8 py-12">
          {/* Agent icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <path d="M12 2a5 5 0 0 0-5 5v14a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"></path>
              <path d="M8 16h8"></path>
              <path d="M8 12h8"></path>
              <path d="M8 8h8"></path>
            </svg>
          </motion.div>

          {/* Status text */}
          <div className="text-center mb-6">
            <AnimatePresence mode="wait">
              {!showFinalMessage ? (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {stage === "initializing" && "Initializing Agent"}
                    {stage === "connecting" && "Connecting Context"}
                    {stage === "processing" && "Processing Knowledge Base"}
                    {stage === "complete" && "Activation Complete"}
                  </h3>
                  <p className="text-muted-foreground">
                    {stage === "initializing" && "Preparing neural pathways..."}
                    {stage === "connecting" && "Establishing secure connections..."}
                    {stage === "processing" && "Integrating strategic context..."}
                    {stage === "complete" && "All systems operational"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="final"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold mb-2 text-primary">
                    {agentName || "Your agent"} is now fully operational
                  </h2>
                  <p className="text-muted-foreground">Ready to assist with your strategic objectives</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-4 gap-2">
            {["initializing", "connecting", "processing", "complete"].map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-colors duration-300",
                  stage === s
                    ? "bg-primary"
                    : i < ["initializing", "connecting", "processing", "complete"].indexOf(stage)
                      ? "bg-primary/50"
                      : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
