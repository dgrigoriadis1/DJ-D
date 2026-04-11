'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { SetlistTrackData } from '@/types'

interface EnergyCurveProps {
  tracks: SetlistTrackData[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: number
  tracks: SetlistTrackData[]
}

function CustomTooltip({ active, payload, label, tracks }: CustomTooltipProps) {
  if (!active || !payload?.length || label === undefined) return null
  const track = tracks[label - 1]
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl max-w-48">
      <p className="font-semibold text-sm mb-1 truncate">{track?.name}</p>
      <p className="text-muted-foreground mb-2 truncate">{track?.artist}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export function EnergyCurve({ tracks }: EnergyCurveProps) {
  const data = tracks.map((track, index) => ({
    position: index + 1,
    Energy: Math.round(track.energy * 100),
    Danceability: Math.round(track.danceability * 100),
    Valence: Math.round(track.valence * 100),
  }))

  return (
    <div className="w-full h-56 bg-card/50 rounded-lg p-4 border border-border">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="position"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            label={{ value: 'Track #', position: 'insideBottomRight', offset: 0, fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip tracks={tracks} />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="Energy"
            stroke="#1DB954"
            strokeWidth={2.5}
            dot={{ fill: '#1DB954', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Danceability"
            stroke="#FF6B35"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#FF6B35', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Valence"
            stroke="#A78BFA"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={{ fill: '#A78BFA', r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
