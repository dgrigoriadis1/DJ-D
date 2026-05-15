import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SetlistEditor } from '@/components/setlist/SetlistEditor'
import { SetlistHeader } from '@/components/setlist/SetlistHeader'
import { SetlistTrackData } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SetlistPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) redirect('/login')

  const { id } = await params

  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
    include: { tracks: { orderBy: { position: 'asc' } } },
  })

  if (!setlist) notFound()

  const totalDuration = setlist.tracks.reduce((acc, t) => acc + t.duration, 0)
  const avgBPM =
    setlist.tracks.length > 0
      ? setlist.tracks.reduce((acc, t) => acc + t.bpm, 0) / setlist.tracks.length
      : 0

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back link */}
      <Link
        href="/setlists"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        My sets
      </Link>

      {/* Header with rename + delete */}
      <div className="mb-6">
        <SetlistHeader
          setlistId={setlist.id}
          name={setlist.name}
          description={setlist.description}
          trackCount={setlist.tracks.length}
          totalDuration={totalDuration}
          avgBPM={avgBPM}
        />
      </div>

      {/* Editor */}
      <SetlistEditor
        setlistId={setlist.id}
        initialTracks={tracks}
        setlistName={setlist.name}
      />
    </div>
  )
}
