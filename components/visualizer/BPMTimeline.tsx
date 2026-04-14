'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { SetlistTrackData } from '@/types'
import { toCamelot } from '@/lib/harmonic'

interface BPMTimelineProps { tracks: SetlistTrackData[] }

function CustomTooltip({ active, payload, label, tracks }: {
  active?: boolean
  payload?: { value: number }[]
  label?: number
  tracks: SetlistTrackData[]
}) {
  if (!active || !payload?.length || label === undefined) return null
  const track = tracks[label - 1]
  if (!track) return null
  const camelot = toCamelot(track.key, track.mode)
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs shadow-2xl"
      style={{
        background: 'rgba(17,8,32,0.95)',
        border: '1px solid rgba(168,85,247,0.25)',
        backdropFilter: 'blur(12px)',
        maxWidth: '210px',
      }}
    >
      <p className="font-bold text-sm mb-0.5 truncate">{track.name}</p>
      <p className="text-muted-foreground mb-2 truncate">{track.artist}</p>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">BPM</span>
        <span className="font-mono font-bold" style={{ color: '#22D3EE' }}>{track.bpm.toFixed(1)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Key</span>
        <span className="font-mono" style={{ color: '#A855F7' }}>{camelot}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Energy</span>
        <span className="font-mono">{Math.round(track.energy * 100)}%</span>
      </div>
    </div>
  )
}

export function BPMTimeline({ tracks }: BPMTimelineProps) {
  const data = tracks.map((t, i) => ({
    position: i + 1,
    BPM: Math.round(t.bpm * 10) / 10,
    energy: t.energy,
  }))

  const bpms = tracks.map((t) => t.bpm)
  const yMin = Math.max(0, Math.floor(Math.min(...bpms) - 10))
  const yMax = Math.ceil(Math.max(...bpms) + 10)

  return (
    <div
      className="w-full h-56 rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="position"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          />
          <YAxis
            domain={[yMin, yMax]}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          />
          <Tooltip content={<CustomTooltip tracks={tracks} />} />
          <Bar dataKey="BPM" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              // Color shifts violet → cyan based on energy
              const energyRatio = entry.energy
              const r = Math.round(168 - energyRatio * (168 - 34))
              const g = Math.round(85 + energyRatio * (211 - 85))
              const b = Math.round(247 - energyRatio * (247 - 238))
              return <Cell key={`cell-${index}`} fill={`rgb(${r},${g},${b})`} opacity={0.8} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
