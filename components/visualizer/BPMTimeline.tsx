'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { SetlistTrackData } from '@/types'
import { toCamelot } from '@/lib/harmonic'

interface BPMTimelineProps {
  tracks: SetlistTrackData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: number
  tracks: SetlistTrackData[]
}

function CustomTooltip({ active, payload, label, tracks }: CustomTooltipProps) {
  if (!active || !payload?.length || label === undefined) return null
  const track = tracks[label - 1]
  if (!track) return null
  const camelot = toCamelot(track.key, track.mode)
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl max-w-52">
      <p className="font-semibold text-sm mb-1 truncate">{track.name}</p>
      <p className="text-muted-foreground mb-2 truncate">{track.artist}</p>
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">BPM</span>
        <span className="font-mono font-bold text-spotify-green">{track.bpm.toFixed(1)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">Key</span>
        <span className="font-mono">{camelot}</span>
      </div>
    </div>
  )
}

export function BPMTimeline({ tracks }: BPMTimelineProps) {
  const data = tracks.map((track, index) => ({
    position: index + 1,
    BPM: Math.round(track.bpm * 10) / 10,
    energy: track.energy,
  }))

  const minBPM = Math.min(...tracks.map((t) => t.bpm))
  const maxBPM = Math.max(...tracks.map((t) => t.bpm))
  const padding = 10
  const yMin = Math.max(0, Math.floor(minBPM - padding))
  const yMax = Math.ceil(maxBPM + padding)

  return (
    <div className="w-full h-56 bg-card/50 rounded-lg p-4 border border-border">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="position"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            label={{ value: 'Track #', position: 'insideBottomRight', offset: 0, fontSize: 11 }}
          />
          <YAxis
            domain={[yMin, yMax]}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            label={{ value: 'BPM', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip tracks={tracks} />} />
          <Bar dataKey="BPM" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${142 - entry.energy * 60}, 70%, ${40 + entry.energy * 20}%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
