'use client'

import { useState, useCallback } from 'react'
import { Search, Plus, Music, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnrichedTrack } from '@/types'
import { toCamelot } from '@/lib/harmonic'
import { formatDuration } from '@/lib/utils'
import { toast } from 'sonner'

interface TrackSearchProps {
  setlistId: string
  onTrackAdded: () => void
}

export function TrackSearch({ setlistId, onTrackAdded }: TrackSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EnrichedTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  const search = useCallback(async () => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data)
    } catch {
      toast.error('Search failed — check your Spotify connection')
    } finally {
      setIsSearching(false)
    }
  }, [query])

  const addTrack = async (track: EnrichedTrack) => {
    setAddingId(track.id)
    try {
      const res = await fetch(`/api/setlists/${setlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotifyId: track.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add track')
      }
      toast.success(`Added "${track.name}"`)
      onTrackAdded()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add track')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Spotify for songs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            className="pl-9"
          />
        </div>
        <Button onClick={search} disabled={isSearching || !query.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="border border-border rounded-lg divide-y divide-border overflow-hidden max-h-96 overflow-y-auto">
          {results.map((track) => {
            const af = track.audioFeatures
            const camelot = af ? toCamelot(af.key, af.mode) : '?'
            return (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                {/* Album art */}
                <div className="h-10 w-10 rounded shrink-0 overflow-hidden bg-muted flex items-center justify-center">
                  {track.album.images[0] ? (
                    <Image
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <Music className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artists.map((a) => a.name).join(', ')} · {track.album.name}
                  </p>
                </div>

                {/* Audio features */}
                {af && (
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="font-mono text-xs">
                      {af.tempo.toFixed(0)} BPM
                    </Badge>
                    <Badge variant="outline" className="font-mono text-xs">
                      {camelot}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(af.energy * 100)}% ⚡
                    </Badge>
                  </div>
                )}

                <span className="text-xs text-muted-foreground hidden lg:block">
                  {formatDuration(track.duration_ms)}
                </span>

                {/* Add button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0"
                  style={{ color: 'var(--violet)' }}
                  onClick={() => addTrack(track)}
                  disabled={addingId === track.id}
                >
                  {addingId === track.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
