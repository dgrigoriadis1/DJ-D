'use client'

import Image from 'next/image'
import { GripVertical, Trash2, Music } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SetlistTrackData, TransitionScore } from '@/types'
import { toCamelot } from '@/lib/harmonic'
import { TransitionBadge } from './TransitionBadge'
import { Button } from '@/components/ui/button'
import { cn, formatDuration, formatBPM } from '@/lib/utils'

interface TrackCardProps {
  track: SetlistTrackData
  index: number
  transitionToNext?: TransitionScore
  onRemove: (trackId: string) => void
  isDragging?: boolean
}

export function TrackCard({ track, index, transitionToNext, onRemove, isDragging }: TrackCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: track.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const camelot = toCamelot(track.key, track.mode)
  const energyPct = Math.round(track.energy * 100)
  const danceabilityPct = Math.round(track.danceability * 100)

  return (
    <div ref={setNodeRef} style={style} className="group">
      {/* Track card */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card transition-all',
          isSortableDragging ? 'opacity-50 shadow-lg scale-[1.02] border-spotify-green/40' : 'hover:border-border/80'
        )}
      >
        {/* Drag handle */}
        <button
          className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Position number */}
        <span className="text-muted-foreground/60 text-sm font-mono w-6 text-right shrink-0">
          {index + 1}
        </span>

        {/* Album art */}
        <div className="h-12 w-12 rounded shrink-0 overflow-hidden bg-muted flex items-center justify-center">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.album}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <Music className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{track.name}</p>
          <p className="text-muted-foreground text-xs truncate">{track.artist}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {/* BPM */}
          <div className="text-center hidden sm:block">
            <div className="text-xs text-muted-foreground">BPM</div>
            <div className="text-sm font-mono font-semibold">{formatBPM(track.bpm)}</div>
          </div>

          {/* Camelot key */}
          <div className="text-center hidden sm:block">
            <div className="text-xs text-muted-foreground">Key</div>
            <div
              className="text-sm font-mono font-semibold"
              style={{ color: camelotColor(camelot) }}
            >
              {camelot}
            </div>
          </div>

          {/* Energy bar */}
          <div className="hidden md:block text-center w-16">
            <div className="text-xs text-muted-foreground mb-1">Energy</div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-spotify-green"
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{energyPct}%</div>
          </div>

          {/* Duration */}
          <div className="text-center hidden lg:block">
            <div className="text-xs text-muted-foreground">Time</div>
            <div className="text-sm font-mono">{formatDuration(track.duration)}</div>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(track.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Transition badge between this track and the next */}
      {transitionToNext && (
        <div className="flex items-center gap-2 my-1 px-12">
          <div className="flex-1 h-px bg-border/50" />
          <TransitionBadge transition={transitionToNext} compact />
          <div className="flex-1 h-px bg-border/50" />
        </div>
      )}
    </div>
  )
}

function camelotColor(camelot: string): string {
  if (camelot === '?') return '#888'
  const num = parseInt(camelot.replace(/[AB]/g, ''), 10)
  // Map 1-12 to a color on a warm spectrum
  const hue = ((num - 1) / 12) * 360
  return `hsl(${hue}, 70%, 65%)`
}
