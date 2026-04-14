'use client'

import Image from 'next/image'
import { GripVertical, Trash2, Music } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SetlistTrackData, TransitionScore } from '@/types'
import { toCamelot } from '@/lib/harmonic'
import { TransitionBadge } from './TransitionBadge'
import { formatDuration } from '@/lib/utils'

interface TrackCardProps {
  track: SetlistTrackData
  index: number
  transitionToNext?: TransitionScore
  onRemove: (trackId: string) => void
}

export function TrackCard({ track, index, transitionToNext, onRemove }: TrackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const camelot = toCamelot(track.key, track.mode)
  const energyPct = Math.round(track.energy * 100)
  const camelotColor = getCamelotColor(camelot)

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div
        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200"
        style={{
          background: isDragging
            ? 'rgba(168,85,247,0.08)'
            : 'rgba(255,255,255,0.025)',
          border: isDragging
            ? '1px solid rgba(168,85,247,0.4)'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: isDragging ? '0 0 20px rgba(168,85,247,0.2)' : 'none',
          opacity: isDragging ? 0.85 : 1,
        }}
      >
        {/* Drag handle */}
        <button
          className="text-muted-foreground/25 hover:text-muted-foreground/60 cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Position index */}
        <span className="text-muted-foreground/40 text-xs font-mono w-5 text-right shrink-0 tabular-nums">
          {index + 1}
        </span>

        {/* Album art */}
        <div
          className="h-11 w-11 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {track.albumArt ? (
            <Image src={track.albumArt} alt={track.album} width={44} height={44} className="object-cover" />
          ) : (
            <Music className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{track.name}</p>
          <p className="text-muted-foreground text-xs truncate mt-0.5">{track.artist}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 shrink-0">
          {/* BPM */}
          <div className="text-center hidden sm:block">
            <div className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--cyan)' }}>
              {track.bpm.toFixed(1)}
            </div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">BPM</div>
          </div>

          {/* Camelot key */}
          <div className="text-center hidden sm:block">
            <div
              className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
              style={{
                color: camelotColor,
                background: `${camelotColor}18`,
                border: `1px solid ${camelotColor}30`,
              }}
            >
              {camelot}
            </div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">Key</div>
          </div>

          {/* Energy */}
          <div className="hidden md:block w-14">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground/50">Energy</span>
              <span className="text-[10px] font-mono text-muted-foreground/70">{energyPct}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${energyPct}%`,
                  background: `linear-gradient(90deg, var(--violet), var(--cyan))`,
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="hidden lg:block text-center">
            <div className="text-xs font-mono text-muted-foreground/70 tabular-nums">
              {formatDuration(track.duration)}
            </div>
          </div>

          {/* Delete */}
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10"
            onClick={() => onRemove(track.id)}
            style={{ color: 'rgba(248,113,113,0.6)' }}
            title="Remove track"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Transition arrow between tracks */}
      {transitionToNext && (
        <div className="flex items-center gap-2 my-1.5 px-10">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <TransitionBadge transition={transitionToNext} compact />
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      )}
    </div>
  )
}

function getCamelotColor(camelot: string): string {
  if (camelot === '?') return '#666'
  const num = parseInt(camelot.replace(/[AB]/g, ''), 10)
  const isMajor = camelot.endsWith('B')
  // Major keys → cyan-purple range, Minor keys → pink-violet range
  const hue = isMajor
    ? 180 + ((num - 1) / 12) * 80   // 180–260 (cyan to blue-violet)
    : 280 + ((num - 1) / 12) * 80   // 280–360 (violet to pink)
  return `hsl(${hue % 360}, 75%, 65%)`
}
