import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSpotifyClient } from '@/lib/spotify'

// GET /api/spotify/search?q=query
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const spotify = createSpotifyClient(session.accessToken)
  const tracks = await spotify.searchTracks(query, 20)

  // Fetch audio features for all results in one batch
  const trackIds = tracks.map((t) => t.id)
  const features = await spotify.getAudioFeatures(trackIds)
  const featuresMap = new Map(features.map((f) => [f.id, f]))

  const enriched = tracks.map((track) => ({
    ...track,
    audioFeatures: featuresMap.get(track.id) ?? null,
  }))

  return NextResponse.json(enriched)
}
