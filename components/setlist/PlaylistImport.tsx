'use client'

import { useState, useEffect } from 'react'
import { ListMusic, ChevronRight, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SpotifyPlaylist, EnrichedTrack } from '@/types'
import { toast } from 'sonner'

interface PlaylistImportProps {
  setlistId: string
  onImportComplete: () => void
}

export function PlaylistImport({ setlistId, onImportComplete }: PlaylistImportProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/spotify/playlists')
      .then((r) => r.json())
      .then(setPlaylists)
      .catch(() => toast.error('Failed to load playlists'))
      .finally(() => setLoading(false))
  }, [])

  const importPlaylist = async (playlist: SpotifyPlaylist) => {
    setImporting(playlist.id)
    try {
      // Fetch tracks with audio features
      const res = await fetch(`/api/spotify/playlists/${playlist.id}`)
      if (!res.ok) throw new Error('Failed to fetch playlist')
      const tracks: EnrichedTrack[] = await res.json()

      // Add each track to the setlist
      let added = 0
      for (const track of tracks) {
        try {
          const addRes = await fetch(`/api/setlists/${setlistId}/tracks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spotifyId: track.id }),
          })
          if (addRes.ok) added++
        } catch {
          // Skip tracks that fail
        }
      }

      toast.success(`Imported ${added} tracks from "${playlist.name}"`)
      onImportComplete()
    } catch (error) {
      toast.error('Import failed — please try again')
    } finally {
      setImporting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading your playlists...
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ListMusic className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p>No playlists found in your Spotify account</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border/80 hover:bg-muted/20 transition-colors"
        >
          {/* Playlist image */}
          <div className="h-12 w-12 rounded shrink-0 overflow-hidden bg-muted flex items-center justify-center">
            {playlist.images[0] ? (
              <Image
                src={playlist.images[0].url}
                alt={playlist.name}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <ListMusic className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{playlist.name}</p>
            <p className="text-xs text-muted-foreground">
              {playlist.tracks.total} tracks · by {playlist.owner.display_name}
            </p>
          </div>

          {/* Import button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => importPlaylist(playlist)}
            disabled={importing === playlist.id}
            className="shrink-0"
          >
            {importing === playlist.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Import
                <ChevronRight className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
