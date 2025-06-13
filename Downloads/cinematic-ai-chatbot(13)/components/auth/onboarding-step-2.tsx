"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X, Users, Link, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { SignUpData } from "@/lib/types/auth"

interface OnboardingStep2Props {
  onComplete: (invites: string[]) => void
  onSkip: () => void
  userData: SignUpData
  onboardingData: any
}

export function OnboardingStep2({ onComplete, onSkip, userData, onboardingData }: OnboardingStep2Props) {
  const [inviteEmails, setInviteEmails] = useState<string[]>(["", "", ""])
  const [inviteLink, setInviteLink] = useState(`https://me-platform.com/invite?ref=${userData.email?.split("@")[0]}`)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails]
    newEmails[index] = value
    setInviteEmails(newEmails)
  }

  const addEmailField = () => {
    setInviteEmails([...inviteEmails, ""])
  }

  const removeEmailField = (index: number) => {
    const newEmails = inviteEmails.filter((_, i) => i !== index)
    setInviteEmails(newEmails)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validEmails = inviteEmails.filter((email) => email.trim() && isValidEmail(email))
    onComplete(validEmails)
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getValidInviteCount = () => {
    return inviteEmails.filter((email) => email.trim() && isValidEmail(email)).length
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Who else is on {onboardingData.company || "your"}'s {onboardingData.team_type || "team"}?
          </h2>
          <p className="text-muted-foreground">Get more done with your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Invites */}
          <div className="space-y-4">
            {inviteEmails.map((email, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    type="email"
                    placeholder={`coworker@${onboardingData.company?.toLowerCase().replace(/\s+/g, "") || "company"}.com`}
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="pl-10"
                  />
                </div>
                {inviteEmails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmailField(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </motion.div>
            ))}

            <Button type="button" variant="outline" onClick={addEmailField} className="w-full border-dashed">
              <Plus className="size-4 mr-2" />
              Add another email
            </Button>
          </div>

          {/* Invite Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="size-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                Invite link for users on @{onboardingData.company?.toLowerCase().replace(/\s+/g, "") || "company"}.com
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="flex-1 bg-muted/50" />
              <Button type="button" variant="outline" onClick={copyInviteLink} className="shrink-0">
                {linkCopied ? (
                  <>
                    <Check className="size-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-700 dark:text-green-300">💰 Earn $10.00 in credit per invite</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <Button type="button" variant="ghost" onClick={onSkip} className="text-muted-foreground">
              Skip
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-me-500 to-me-600 hover:from-me-600 hover:to-me-700"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>

      {/* Profile Preview */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sticky top-8 space-y-4"
        >
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getInitials(userData.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{userData.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>

              <div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {onboardingData.team_type || "Team Member"}
                </Badge>
              </div>

              {onboardingData.company && <div className="text-sm text-muted-foreground">{onboardingData.company}</div>}

              {getValidInviteCount() > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Team Invites</p>
                  <p className="text-sm text-muted-foreground">
                    {getValidInviteCount()} member{getValidInviteCount() !== 1 ? "s" : ""} will be invited
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
