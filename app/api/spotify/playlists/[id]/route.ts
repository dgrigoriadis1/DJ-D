import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSpotifyClient } from '@/lib/spotify'

// GET /api/spotify/playlists/[id] — get tracks from a Spotify playlist with audio features
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const spotify = createSpotifyClient(session.accessToken)

  // Get all tracks from the playlist
  const tracks = await spotify.getPlaylistTracks(id)

  // Batch-fetch audio features (Spotify allows up to 100 per request)
  const enriched = []
  for (let i = 0; i < tracks.length; i += 100) {
    const batch = tracks.slice(i, i + 100)
    const ids = batch.map((t) => t.id)
    const features = await spotify.getAudioFeatures(ids)
    const featuresMap = new Map(features.map((f) => [f.id, f]))

    for (const track of batch) {
      enriched.push({
        ...track,
        audioFeatures: featuresMap.get(track.id) ?? null,
      })
    }
  }

  return NextResponse.json(enriched)
}
