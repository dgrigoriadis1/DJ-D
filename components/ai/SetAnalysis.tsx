'use client'

import { useState } from 'react'
import { Sparkles, AlertTriangle, Lightbulb, Music, Loader2, RefreshCw } from 'lucide-react'
import { AIAnalysis, SetlistTrackData } from '@/types'
import { toast } from 'sonner'

interface SetAnalysisProps {
  setlistId: string
  tracks: SetlistTrackData[]
  setlistName: string
}

export function SetAnalysis({ setlistId, tracks }: SetAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    if (tracks.length < 2) { toast.error('Add at least 2 tracks'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setlistId }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setAnalysis(await res.json())
      toast.success('Analysis complete')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  if (tracks.length < 2) {
    return (
      <div className="text-center py-14 text-muted-foreground">
        <Sparkles className="h-9 w-9 mx-auto mb-3 opacity-20" />
        <p className="text-sm">Add at least 2 tracks to get AI analysis</p>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-14">
        <div
          className="inline-flex p-4 rounded-2xl mb-5"
          style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <Sparkles className="h-8 w-8" style={{ color: 'var(--violet)' }} />
        </div>
        <h3 className="font-bold text-lg mb-2">AI Set Analysis</h3>
        <p className="text-muted-foreground text-sm mb-7 max-w-sm mx-auto leading-relaxed">
          Claude will analyze your {tracks.length}-track set — energy arc, harmonic flow,
          weak transitions — and suggest songs to fill the gaps.
        </p>
        <button
          onClick={analyze}
          disabled={loading}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            color: '#fff',
            boxShadow: loading ? 'none' : 'var(--glow-violet)',
          }}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            : <><Sparkles className="h-4 w-4" /> Analyze My Set</>
          }
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Re-analyze */}
      <div className="flex justify-end">
        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Re-analyze
        </button>
      </div>

      {/* Overview */}
      <Section
        icon={<Sparkles className="h-4 w-4" />}
        iconColor="var(--violet)"
        title="Overview"
        accent="var(--violet)"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.overview}</p>
      </Section>

      {/* Energy arc */}
      <Section
        icon={<span className="text-sm">⚡</span>}
        iconColor="var(--cyan)"
        title="Energy Arc"
        accent="var(--cyan)"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.energyArcAnalysis}</p>
      </Section>

      {/* Weak transitions */}
      {analysis.weakTransitions.length > 0 && (
        <Section
          icon={<AlertTriangle className="h-4 w-4" />}
          iconColor="#FB923C"
          title={`Weak Transitions (${analysis.weakTransitions.length})`}
          accent="#FB923C"
        >
          <div className="space-y-3">
            {analysis.weakTransitions.map((wt, i) => (
              <div
                key={i}
                className="rounded-xl p-4 text-sm"
                style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.18)' }}
              >
                <p className="text-xs font-mono font-bold mb-1.5" style={{ color: '#FB923C' }}>
                  After track {wt.position + 1}
                </p>
                <p className="text-muted-foreground mb-1.5">{wt.reason}</p>
                <p>
                  <span style={{ color: '#FB923C' }} className="font-semibold">Fix: </span>
                  {wt.suggestion}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Section
          icon={<Music className="h-4 w-4" />}
          iconColor="var(--violet)"
          title="Recommended Additions"
          accent="var(--violet)"
        >
          <div className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl p-4 text-sm"
                style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold">{rec.name}</p>
                    <p className="text-xs text-muted-foreground">{rec.artist}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {rec.expectedBPM && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--cyan)', border: '1px solid rgba(34,211,238,0.2)' }}
                      >
                        ~{rec.expectedBPM} BPM
                      </span>
                    )}
                    {rec.expectedKey && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(168,85,247,0.1)', color: 'var(--violet)', border: '1px solid rgba(168,85,247,0.2)' }}
                      >
                        {rec.expectedKey}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{rec.reason}</p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--violet)' }}>
                  → Insert at position {rec.suggestedPosition + 1}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tips */}
      {analysis.generalTips.length > 0 && (
        <Section
          icon={<Lightbulb className="h-4 w-4" />}
          iconColor="#FBBF24"
          title="DJ Tips"
          accent="#FBBF24"
        >
          <ul className="space-y-2">
            {analysis.generalTips.map((tip, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                <span style={{ color: '#FBBF24' }} className="shrink-0 mt-0.5">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({
  icon, iconColor, title, accent, children,
}: {
  icon: React.ReactNode
  iconColor: string
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${accent}22`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: iconColor }}>{icon}</span>
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}
