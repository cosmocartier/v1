"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, Calendar, Target, Lightbulb } from "lucide-react"
import type { OperationPrediction } from "@/lib/ai-predictions"

interface PredictionDisplayProps {
  prediction: OperationPrediction
  className?: string
}

export function PredictionDisplay({ prediction, className }: PredictionDisplayProps) {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-600"
    if (probability >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          AI Completion Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Estimated Completion</span>
            </div>
            <div className="text-lg font-bold">{formatDate(prediction.estimatedCompletionDate)}</div>
            <div className="text-sm text-muted-foreground">{prediction.daysRemaining} days remaining</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">On-Time Probability</span>
            </div>
            <div className={`text-lg font-bold ${getProbabilityColor(prediction.probabilityOnTime)}`}>
              {prediction.probabilityOnTime}%
            </div>
            <Progress value={prediction.probabilityOnTime} className="w-full h-2 mt-1" />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Progress Velocity</span>
            </div>
            <div className="text-lg font-bold">{prediction.progressVelocity.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">per day</div>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Prediction Confidence:</span>
          <Badge className={getConfidenceColor(prediction.confidenceLevel)}>{prediction.confidenceLevel}</Badge>
        </div>

        {/* Risk Factors */}
        {prediction.riskFactors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Risk Factors</span>
            </div>
            <div className="space-y-2">
              {prediction.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {prediction.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Recommendations</span>
            </div>
            <div className="space-y-2">
              {prediction.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {formatDate(prediction.lastUpdated)}
        </div>
      </CardContent>
    </Card>
  )
}
