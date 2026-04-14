import { TransitionScore } from '@/types'

interface TransitionBadgeProps {
  transition: TransitionScore
  compact?: boolean
}

function scoreStyle(score: number) {
  if (score >= 80) return { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' }
  if (score >= 60) return { color: '#A855F7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)' }
  if (score >= 40) return { color: '#FB923C', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' }
  return { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' }
}

export function TransitionBadge({ transition, compact = false }: TransitionBadgeProps) {
  const s = scoreStyle(transition.score)

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
        style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
        title={`${transition.camelotFrom} → ${transition.camelotTo} · Δ${transition.bpmDiff.toFixed(1)} BPM`}
      >
        {transition.score}
        <span className="opacity-50 font-normal text-[9px] uppercase tracking-wider">{transition.label}</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-2 rounded-lg text-xs"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="flex items-center gap-4">
        <span className="font-black text-base font-mono">
          {transition.score}
          <span className="text-[10px] font-normal opacity-50">/100</span>
        </span>
        <span className="opacity-60">{transition.camelotFrom} → {transition.camelotTo}</span>
        <span className="opacity-60">Δ{transition.bpmDiff.toFixed(1)} BPM</span>
      </div>
      <span className="uppercase text-[10px] tracking-widest font-bold opacity-80">{transition.label}</span>
    </div>
  )
}
