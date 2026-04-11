import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SetlistEditor } from '@/components/setlist/SetlistEditor'
import { SetlistTrackData } from '@/types'
import { formatDuration } from '@/lib/utils'

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/setlists">
            <ArrowLeft className="h-4 w-4 mr-1" />
            My sets
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{setlist.name}</h1>
            {setlist.description && (
              <p className="text-muted-foreground mt-1">{setlist.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              {setlist.tracks.length > 0 && (
                <>
                  <span>{setlist.tracks.length} tracks</span>
                  {totalDuration > 0 && (
                    <>
                      <span>·</span>
                      <span>{formatDuration(totalDuration)}</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="font-mono">
                    {(
                      setlist.tracks.reduce((acc, t) => acc + t.bpm, 0) / setlist.tracks.length
                    ).toFixed(0)}{' '}
                    avg BPM
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
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
