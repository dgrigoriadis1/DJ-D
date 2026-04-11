'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Search, ListMusic, Sparkles, BarChart3 } from 'lucide-react'
import { SetlistTrackData } from '@/types'
import { scoreSetlist, setlistQualityScore } from '@/lib/transitions'
import { TrackCard } from './TrackCard'
import { TrackSearch } from './TrackSearch'
import { PlaylistImport } from './PlaylistImport'
import { EnergyCurve } from '@/components/visualizer/EnergyCurve'
import { BPMTimeline } from '@/components/visualizer/BPMTimeline'
import { SetAnalysis } from '@/components/ai/SetAnalysis'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Tab = 'tracks' | 'search' | 'import' | 'visualize' | 'ai'

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
  const qualityScore = setlistQualityScore(transitions)

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

    const reordered = arrayMove(tracks, oldIndex, newIndex).map((t, i) => ({
      ...t,
      position: i,
    }))

    setTracks(reordered) // optimistic update

    try {
      const res = await fetch(`/api/setlists/${setlistId}/tracks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds: reordered.map((t) => t.id) }),
      })
      if (!res.ok) throw new Error('Failed to save order')
    } catch {
      toast.error('Failed to save track order')
      setTracks(tracks) // revert
    }
  }

  const handleRemoveTrack = async (trackId: string) => {
    const trackName = tracks.find((t) => t.id === trackId)?.name
    const newTracks = tracks.filter((t) => t.id !== trackId).map((t, i) => ({ ...t, position: i }))
    setTracks(newTracks) // optimistic

    try {
      const res = await fetch(`/api/setlists/${setlistId}/tracks/${trackId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove track')
      toast.success(`Removed "${trackName}"`)
    } catch {
      toast.error('Failed to remove track')
      setTracks(tracks) // revert
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tracks', label: 'Tracks', icon: <ListMusic className="h-4 w-4" /> },
    { id: 'search', label: 'Add Songs', icon: <Search className="h-4 w-4" /> },
    { id: 'import', label: 'Import Playlist', icon: <ListMusic className="h-4 w-4" /> },
    { id: 'visualize', label: 'Visualize', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'ai', label: 'AI Analysis', icon: <Sparkles className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{tracks.length} tracks</span>
          {tracks.length > 1 && (
            <>
              <span>·</span>
              <span>
                Set quality:{' '}
                <span
                  className={cn(
                    'font-semibold',
                    qualityScore >= 80
                      ? 'text-green-400'
                      : qualityScore >= 60
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  )}
                >
                  {qualityScore}/100
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-spotify-green text-spotify-green'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tracks' && (
        <div>
          {tracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListMusic className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tracks yet</p>
              <p className="text-sm mt-1">
                Use &ldquo;Add Songs&rdquo; to search Spotify, or &ldquo;Import Playlist&rdquo; to
                bulk import
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setActiveTab('search')}
              >
                <Search className="h-4 w-4 mr-2" />
                Search for songs
              </Button>
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
        </div>
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
            <div className="text-center py-8 text-muted-foreground">
              Add at least 2 tracks to see visualizations
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Energy Arc
                </h3>
                <EnergyCurve tracks={tracks} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  BPM Timeline
                </h3>
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
  )
}
