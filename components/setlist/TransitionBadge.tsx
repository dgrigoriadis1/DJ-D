import { TransitionScore } from '@/types'
import { transitionBgColor, transitionColor } from '@/lib/transitions'
import { cn } from '@/lib/utils'

interface TransitionBadgeProps {
  transition: TransitionScore
  compact?: boolean
}

export function TransitionBadge({ transition, compact = false }: TransitionBadgeProps) {
  const colorClass = transitionColor(transition.score)
  const bgClass = transitionBgColor(transition.score)

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono font-semibold',
          bgClass,
          colorClass
        )}
        title={`Transition: ${transition.camelotFrom} → ${transition.camelotTo} | BPM diff: ${transition.bpmDiff.toFixed(1)}`}
      >
        {transition.score}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between px-3 py-1.5 rounded-md border text-xs', bgClass)}>
      <div className="flex items-center gap-3">
        {/* Score */}
        <span className={cn('font-bold text-base font-mono', colorClass)}>
          {transition.score}
          <span className="text-xs font-normal opacity-60">/100</span>
        </span>

        {/* Camelot */}
        <span className="text-muted-foreground">
          {transition.camelotFrom} → {transition.camelotTo}
        </span>

        {/* BPM diff */}
        <span className="text-muted-foreground">
          Δ{transition.bpmDiff.toFixed(1)} BPM
        </span>
      </div>

      {/* Label */}
      <span className={cn('uppercase text-[10px] tracking-wider font-semibold', colorClass)}>
        {transition.label}
      </span>
    </div>
  )
}
