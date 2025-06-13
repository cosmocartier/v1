"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { SignUpForm } from "./sign-up-form"
import { SignInForm } from "./sign-in-form"
import { MELogo } from "@/components/me-logo"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)

  const handleSuccess = () => {
    onClose()
  }

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border max-w-md w-full max-h-[90vh] overflow-y-auto p-6 rounded-lg relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="size-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MELogo size="md" />
                <span className="font-bold text-lg">Strategic Access</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">{mode === "login" ? "Welcome Back" : "Join ME Platform"}</h2>
              <p className="text-muted-foreground">
                {mode === "login"
                  ? "Access your strategic intelligence dashboard"
                  : "Start orchestrating better outcomes today"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {mode === "signup" ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignUpForm onSuccess={handleSuccess} onSwitchToSignIn={switchMode} />
                </motion.div>
              ) : (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignInForm onSuccess={handleSuccess} onSwitchToSignUp={switchMode} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
