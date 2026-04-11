'use client'

import { useState } from 'react'
import { Sparkles, AlertTriangle, Lightbulb, Music, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AIAnalysis, SetlistTrackData } from '@/types'
import { toast } from 'sonner'

interface SetAnalysisProps {
  setlistId: string
  tracks: SetlistTrackData[]
  setlistName: string
}

export function SetAnalysis({ setlistId, tracks, setlistName }: SetAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (tracks.length < 2) {
      toast.error('Add at least 2 tracks to analyze your set')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setlistId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Analysis failed')
      }
      const data = await res.json()
      setAnalysis(data)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  if (tracks.length < 2) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Add at least 2 tracks to get AI analysis</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-spotify-green opacity-60" />
        <h3 className="font-semibold text-lg mb-2">AI Set Analysis</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Claude will analyze your {tracks.length}-track set for energy arc, harmonic flow, and
          weak transitions, then recommend songs to improve it.
        </p>
        <Button variant="spotify" onClick={analyze} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze My Set
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Re-analyze button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={analyze} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Re-analyze
        </Button>
      </div>

      {/* Overview */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-spotify-green" />
          <h3 className="font-semibold text-sm">Overview</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.overview}</p>
      </div>

      {/* Energy arc */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⚡</span>
          <h3 className="font-semibold text-sm">Energy Arc</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.energyArcAnalysis}</p>
      </div>

      {/* Weak transitions */}
      {analysis.weakTransitions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <h3 className="font-semibold text-sm">Weak Transitions</h3>
            <Badge variant="secondary">{analysis.weakTransitions.length}</Badge>
          </div>
          <div className="space-y-3">
            {analysis.weakTransitions.map((wt, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5"
              >
                <p className="text-xs font-semibold text-orange-400 mb-1">
                  After track {wt.position + 1}
                </p>
                <p className="text-sm text-muted-foreground mb-1">{wt.reason}</p>
                <p className="text-sm text-foreground">
                  <span className="text-orange-400 font-medium">Suggestion: </span>
                  {wt.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Music className="h-4 w-4 text-spotify-green" />
            <h3 className="font-semibold text-sm">Recommended Additions</h3>
          </div>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-spotify-green/20 bg-spotify-green/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{rec.name}</p>
                    <p className="text-xs text-muted-foreground">{rec.artist}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {rec.expectedBPM && (
                      <Badge variant="outline" className="font-mono text-xs">
                        ~{rec.expectedBPM} BPM
                      </Badge>
                    )}
                    {rec.expectedKey && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {rec.expectedKey}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{rec.reason}</p>
                <p className="text-xs text-spotify-green mt-1">
                  Insert at position {rec.suggestedPosition + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General tips */}
      {analysis.generalTips.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <h3 className="font-semibold text-sm">DJ Tips</h3>
          </div>
          <ul className="space-y-2">
            {analysis.generalTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-yellow-400 shrink-0">·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
