import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createSpotifyClient } from '@/lib/spotify'

// POST /api/setlists/[id]/tracks — add a track to the setlist
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.userId || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
    include: { tracks: true },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  const body = await request.json()
  const { spotifyId, position } = body

  if (!spotifyId) {
    return NextResponse.json({ error: 'spotifyId is required' }, { status: 400 })
  }

  // Fetch full track data and audio features from Spotify in parallel
  const spotify = createSpotifyClient(session.accessToken)
  const [trackDetailResponse, featuresData] = await Promise.all([
    fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }),
    spotify.getAudioFeature(spotifyId),
  ])

  const trackDetail = await trackDetailResponse.json()

  if (!trackDetail.id) {
    return NextResponse.json({ error: 'Track not found on Spotify' }, { status: 404 })
  }

  const insertPosition = position ?? setlist.tracks.length

  // Shift existing tracks down if inserting in the middle
  if (insertPosition < setlist.tracks.length) {
    await prisma.setlistTrack.updateMany({
      where: { setlistId: id, position: { gte: insertPosition } },
      data: { position: { increment: 1 } },
    })
  }

  const track = await prisma.setlistTrack.create({
    data: {
      setlistId: id,
      spotifyId: trackDetail.id,
      name: trackDetail.name,
      artist: trackDetail.artists.map((a: { name: string }) => a.name).join(', '),
      album: trackDetail.album.name,
      albumArt: trackDetail.album.images?.[0]?.url ?? null,
      duration: trackDetail.duration_ms,
      bpm: featuresData?.tempo ?? 0,
      key: featuresData?.key ?? -1,
      mode: featuresData?.mode ?? 1,
      energy: featuresData?.energy ?? 0.5,
      danceability: featuresData?.danceability ?? 0.5,
      valence: featuresData?.valence ?? 0.5,
      loudness: featuresData?.loudness ?? -10,
      position: insertPosition,
    },
  })

  await prisma.setlist.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(track, { status: 201 })
}

// PUT /api/setlists/[id]/tracks — reorder tracks
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  const body = await request.json()
  const { trackIds } = body as { trackIds: string[] }

  if (!Array.isArray(trackIds)) {
    return NextResponse.json({ error: 'trackIds must be an array' }, { status: 400 })
  }

  await prisma.$transaction(
    trackIds.map((trackId, index) =>
      prisma.setlistTrack.update({
        where: { id: trackId },
        data: { position: index },
      })
    )
  )

  await prisma.setlist.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
