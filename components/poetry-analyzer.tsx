"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { poetryForms } from "./poetry-forms"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Star, ThumbsUp, ThumbsDown, Lightbulb, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TechnicalAnalysis {
  rhythm: string
  wordChoice: string
  imagery: string
  structure: string
}

interface AnalysisResult {
  overallRating: string
  strengths: string[]
  weaknesses: string[]
  technicalAnalysis: TechnicalAnalysis
  improvements: string[]
  finalVerdict: string
}

export function PoetryAnalyzer() {
  const [poem, setPoem] = useState("")
  const [selectedForm, setSelectedForm] = useState("Free Verse")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzePoem = async () => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyze-poem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ poem, form: selectedForm }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "An error occurred while analyzing the poem.")
      }

      if (!data.analysis) {
        throw new Error("No analysis data received from the server.")
      }

      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRatingNumber = (ratingString: string) => {
    const match = ratingString.match(/\d+/)
    return match ? Number.parseInt(match[0]) : 0
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>AI Poetry Assistant</CardTitle>
          <CardDescription>Get detailed feedback and ratings for your poetry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Select onValueChange={setSelectedForm} defaultValue={selectedForm}>
              <SelectTrigger>
                <SelectValue placeholder="Select poetry form" />
              </SelectTrigger>
              <SelectContent>
                {poetryForms.map((form) => (
                  <SelectItem key={form.name} value={form.name}>
                    {form.name} - {form.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter your poem here..."
              value={poem}
              onChange={(e) => setPoem(e.target.value)}
              rows={10}
              className="font-mono"
            />

            <Button onClick={analyzePoem} disabled={isAnalyzing || !poem.trim()} className="w-full">
              {isAnalyzing ? "Analyzing..." : "Analyze Poem"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analysis && (
            <div className="mt-6 space-y-6">
              {/* Overall Rating */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-lg">Overall Rating</h3>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-2">
                    <Progress value={getRatingNumber(analysis.overallRating) * 10} className="h-2" />
                    <span className="font-bold">{getRatingNumber(analysis.overallRating)}/10</span>
                  </div>
                  <p>{analysis.overallRating}</p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Strengths</h3>
                  </div>
                  <ul className="list-disc list-inside bg-muted p-4 rounded-lg space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold">Areas for Improvement</h3>
                  </div>
                  <ul className="list-disc list-inside bg-muted p-4 rounded-lg space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technical Analysis */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Technical Analysis</h3>
                </div>
                <div className="grid gap-4 bg-muted p-4 rounded-lg">
                  {Object.entries(analysis.technicalAnalysis).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{key}</span>
                        <span className="font-bold">{getRatingNumber(value)}/10</span>
                      </div>
                      <Progress value={getRatingNumber(value) * 10} className="h-2" />
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Suggestions for Improvement</h3>
                </div>
                <ul className="list-decimal list-inside bg-muted p-4 rounded-lg space-y-2">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>

              {/* Final Verdict */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Final Verdict</h3>
                <p>{analysis.finalVerdict}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

