import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRecommendations } from '@/lib/claude'
import { SetlistTrackData } from '@/types'

// POST /api/ai/recommend — get song recommendations for a position in the setlist
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI recommendations are not configured. Please add your ANTHROPIC_API_KEY.' },
      { status: 503 }
    )
  }

  const body = await request.json()
  const { setlistId, position, genre } = body

  if (!setlistId) {
    return NextResponse.json({ error: 'setlistId is required' }, { status: 400 })
  }

  const setlist = await prisma.setlist.findFirst({
    where: { id: setlistId, userId: session.userId },
    include: { tracks: { orderBy: { position: 'asc' } } },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  const tracks: SetlistTrackData[] = setlist.tracks.map((t) => ({
    id: t.id,
    setlistId: t.setlistId,
    spotifyId: t.spotifyId,
    name: t.name,
    artist: t.artist,
    album: t.album,
    albumArt: t.albumArt,
    duration: t.duration,
    bpm: t.bpm,
    key: t.key,
    mode: t.mode,
    energy: t.energy,
    danceability: t.danceability,
    valence: t.valence,
    loudness: t.loudness,
    position: t.position,
  }))

  const recommendations = await getRecommendations(tracks, position ?? tracks.length, genre)

  return NextResponse.json({ recommendations })
}
