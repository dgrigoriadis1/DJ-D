'use client'

import { useState, useCallback } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { ListMusic, Search, BarChart3, Sparkles, Import } from 'lucide-react'
import { SetlistTrackData } from '@/types'
import { scoreSetlist, setlistQualityScore } from '@/lib/transitions'
import { TrackCard } from './TrackCard'
import { TrackSearch } from './TrackSearch'
import { PlaylistImport } from './PlaylistImport'
import { EnergyCurve } from '@/components/visualizer/EnergyCurve'
import { BPMTimeline } from '@/components/visualizer/BPMTimeline'
import { SetAnalysis } from '@/components/ai/SetAnalysis'
import { toast } from 'sonner'

type Tab = 'tracks' | 'search' | 'import' | 'visualize' | 'ai'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'tracks',   label: 'Tracks',     icon: <ListMusic className="h-3.5 w-3.5" /> },
  { id: 'search',   label: 'Add Songs',  icon: <Search className="h-3.5 w-3.5" /> },
  { id: 'import',   label: 'Import',     icon: <Import className="h-3.5 w-3.5" /> },
  { id: 'visualize',label: 'Visualize',  icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: 'ai',       label: 'AI Analysis',icon: <Sparkles className="h-3.5 w-3.5" /> },
]

interface SetlistEditorProps {
  setlistId: string
  initialTracks: SetlistTrackData[]
  setlistName: string
}

export function SetlistEditor({ setlistId, initialTracks, setlistName }: SetlistEditorProps) {
  const [tracks, setTracks] = useState<SetlistTrackData[]>(initialTracks)
  const [activeTab, setActiveTab] = useState<Tab>('tracks')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const transitions = scoreSetlist(tracks)
  const quality = setlistQualityScore(transitions)

  const refreshTracks = useCallback(async () => {
    const res = await fetch(`/api/setlists/${setlistId}`)
    if (res.ok) {
      const data = await res.json()
      setTracks(data.tracks)
    }
  }, [setlistId])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tracks.findIndex((t) => t.id === active.id)
    const newIndex = tracks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(tracks, oldIndex, newIndex).map((t, i) => ({ ...t, position: i }))

    setTracks(reordered)

    try {
      const res = await fetch(`/api/setlists/${setlistId}/tracks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds: reordered.map((t) => t.id) }),
      })
      if (!res.ok) throw new Error()
    } catch {
      toast.error('Failed to save track order')
      setTracks(tracks)
    }
  }

  const handleRemoveTrack = async (trackId: string) => {
    const name = tracks.find((t) => t.id === trackId)?.name
    const prev = tracks
    setTracks(tracks.filter((t) => t.id !== trackId).map((t, i) => ({ ...t, position: i })))

    try {
      const res = await fetch(`/api/setlists/${setlistId}/tracks/${trackId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(`Removed "${name}"`)
    } catch {
      toast.error('Failed to remove track')
      setTracks(prev)
    }
  }

  // Quality score color
  const qualityColor = quality >= 80 ? '#4ADE80' : quality >= 60 ? '#A855F7' : '#F87171'

  return (
    <div className="space-y-4">
      {/* Top status bar */}
      {tracks.length > 1 && (
        <div
          className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span className="text-muted-foreground">{tracks.length} tracks</span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
          <span className="text-muted-foreground">
            Set quality:{' '}
            <span className="font-bold font-mono" style={{ color: qualityColor }}>
              {quality}/100
            </span>
          </span>
          {transitions.filter((t) => t.score < 50).length > 0 && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span style={{ color: '#FB923C' }}>
                {transitions.filter((t) => t.score < 50).length} rough transition{transitions.filter((t) => t.score < 50).length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      )}

      {/* Tab nav — pill style */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-1 justify-center sm:flex-none sm:justify-start"
              style={{
                background: isActive ? 'var(--violet-dim)' : 'transparent',
                color: isActive ? 'var(--violet)' : 'hsl(var(--muted-foreground))',
                border: isActive ? '1px solid var(--violet-border)' : '1px solid transparent',
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'tracks' && (
          <>
            {tracks.length === 0 ? (
              <div className="text-center py-16">
                <ListMusic className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-sm mb-1">No tracks yet</p>
                <p className="text-muted-foreground text-xs mb-5">
                  Search for songs or import an existing Spotify playlist
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'var(--violet-dim)',
                    border: '1px solid var(--violet-border)',
                    color: 'var(--violet)',
                  }}
                >
                  Search for songs
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tracks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0">
                    {tracks.map((track, index) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        index={index}
                        transitionToNext={transitions[index]}
                        onRemove={handleRemoveTrack}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </>
        )}

        {activeTab === 'search' && (
          <TrackSearch setlistId={setlistId} onTrackAdded={refreshTracks} />
        )}

        {activeTab === 'import' && (
          <PlaylistImport setlistId={setlistId} onImportComplete={refreshTracks} />
        )}

        {activeTab === 'visualize' && (
          <div className="space-y-6">
            {tracks.length < 2 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Add at least 2 tracks to see visualizations
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">
                    Energy Arc
                  </p>
                  <EnergyCurve tracks={tracks} />
                </div>
                <div>
                  <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">
                    BPM Timeline
                  </p>
                  <BPMTimeline tracks={tracks} />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <SetAnalysis setlistId={setlistId} tracks={tracks} setlistName={setlistName} />
        )}
      </div>
    </div>
  )
}
