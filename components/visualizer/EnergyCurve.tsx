'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { SetlistTrackData } from '@/types'

interface EnergyCurveProps { tracks: SetlistTrackData[] }

function CustomTooltip({ active, payload, label, tracks }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: number
  tracks: SetlistTrackData[]
}) {
  if (!active || !payload?.length || label === undefined) return null
  const track = tracks[label - 1]
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs shadow-2xl"
      style={{
        background: 'rgba(17,8,32,0.95)',
        border: '1px solid rgba(168,85,247,0.25)',
        backdropFilter: 'blur(12px)',
        maxWidth: '200px',
      }}
    >
      <p className="font-bold text-sm mb-0.5 truncate">{track?.name}</p>
      <p className="text-muted-foreground mb-2 truncate">{track?.artist}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono font-bold">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export function EnergyCurve({ tracks }: EnergyCurveProps) {
  const data = tracks.map((t, i) => ({
    position: i + 1,
    Energy: Math.round(t.energy * 100),
    Danceability: Math.round(t.danceability * 100),
    Valence: Math.round(t.valence * 100),
  }))

  return (
    <div
      className="w-full h-56 rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="position"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip tracks={tracks} />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
          <Line
            type="monotone" dataKey="Energy" stroke="#A855F7" strokeWidth={2.5}
            dot={{ fill: '#A855F7', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#A855F7', strokeWidth: 0 }}
          />
          <Line
            type="monotone" dataKey="Danceability" stroke="#22D3EE" strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={{ fill: '#22D3EE', r: 2, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#22D3EE', strokeWidth: 0 }}
          />
          <Line
            type="monotone" dataKey="Valence" stroke="#F472B6" strokeWidth={1.5}
            strokeDasharray="2 4"
            dot={{ fill: '#F472B6', r: 2, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#F472B6', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
