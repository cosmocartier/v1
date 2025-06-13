"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, Loader2, Bug, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export function AuthDiagnostic() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { runDiagnostic } = useAuth()

  const runFullDiagnostic = async () => {
    setIsRunning(true)
    try {
      const diagnosticResults = await runDiagnostic()
      setResults(diagnosticResults)
    } catch (error) {
      console.error("Diagnostic failed:", error)
      setResults({ error: "Diagnostic failed to run" })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="size-5 text-green-500" /> : <AlertCircle className="size-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "PASS" : "FAIL"}</Badge>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="size-5" />
          Authentication Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runFullDiagnostic} disabled={isRunning} className="flex-1">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Run Diagnostic
              </>
            )}
          </Button>
        </div>

        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4">
              {/* Environment Variables Check */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.environment?.success)}
                  <div>
                    <h3 className="font-medium">Environment Variables</h3>
                    <p className="text-sm text-muted-foreground">Checking required Supabase configuration</p>
                  </div>
                </div>
                {getStatusBadge(results.environment?.success)}
              </div>

              {/* Database Connection Check */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.connection?.success)}
                  <div>
                    <h3 className="font-medium">Database Connection</h3>
                    <p className="text-sm text-muted-foreground">Testing connection to Supabase database</p>
                  </div>
                </div>
                {getStatusBadge(results.connection?.success)}
              </div>

              {/* Auth System Check */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.auth?.success)}
                  <div>
                    <h3 className="font-medium">Authentication System</h3>
                    <p className="text-sm text-muted-foreground">Verifying auth configuration and session handling</p>
                  </div>
                </div>
                {getStatusBadge(results.auth?.success)}
              </div>
            </div>

            {/* Error Details */}
            {(results.environment?.error || results.connection?.error || results.auth?.error) && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <h3 className="font-medium text-red-500 mb-2">Issues Found:</h3>
                <ul className="space-y-1 text-sm">
                  {results.environment?.error && (
                    <li className="text-red-400">• Environment: {results.environment.error}</li>
                  )}
                  {results.connection?.error && (
                    <li className="text-red-400">• Connection: {results.connection.error}</li>
                  )}
                  {results.auth?.error && <li className="text-red-400">• Auth: {results.auth.error}</li>}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {results.environment?.success && results.connection?.success && results.auth?.success && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-500 font-medium">
                  ✅ All systems operational! Authentication should be working correctly.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
