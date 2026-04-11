import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSpotifyClient } from '@/lib/spotify'

// GET /api/spotify/playlists — list the user's Spotify playlists
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const spotify = createSpotifyClient(session.accessToken)
  const playlists = await spotify.getUserPlaylists(50)

  return NextResponse.json(playlists)
}
