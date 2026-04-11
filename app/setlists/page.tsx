import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, ListMusic, Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'

export default async function SetlistsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) redirect('/login')

  const setlists = await prisma.setlist.findMany({
    where: { userId: session.userId },
    include: { tracks: { orderBy: { position: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Sets</h1>
          <p className="text-muted-foreground mt-1">
            {setlists.length} setlist{setlists.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="spotify" asChild>
          <Link href="/setlists/new">
            <Plus className="h-4 w-4 mr-2" />
            New Set
          </Link>
        </Button>
      </div>

      {setlists.length === 0 ? (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Music2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <CardTitle className="text-lg mb-2">No sets yet</CardTitle>
            <CardDescription className="mb-6 max-w-sm">
              Create your first DJ setlist — import from Spotify or build one from scratch
            </CardDescription>
            <Button variant="spotify" asChild>
              <Link href="/setlists/new">
                <Plus className="h-4 w-4 mr-2" />
                Create your first set
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {setlists.map((setlist) => {
            const totalDuration = setlist.tracks.reduce((acc, t) => acc + t.duration, 0)
            const avgBPM =
              setlist.tracks.length > 0
                ? setlist.tracks.reduce((acc, t) => acc + t.bpm, 0) / setlist.tracks.length
                : 0

            return (
              <Link key={setlist.id} href={`/setlists/${setlist.id}`}>
                <Card className="bg-card/50 hover:border-spotify-green/30 hover:bg-card/80 transition-all cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <ListMusic className="h-5 w-5 text-spotify-green" />
                    <CardTitle className="text-base mt-2">{setlist.name}</CardTitle>
                    {setlist.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {setlist.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{setlist.tracks.length} tracks</span>
                      {totalDuration > 0 && (
                        <>
                          <span>·</span>
                          <span>{formatDuration(totalDuration)}</span>
                        </>
                      )}
                      {avgBPM > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{avgBPM.toFixed(0)} avg BPM</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/50 mt-2">
                      Updated {new Date(setlist.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          {/* New set card */}
          <Link href="/setlists/new">
            <Card className="bg-card/20 border-dashed hover:border-spotify-green/30 hover:bg-card/50 transition-all cursor-pointer h-full min-h-[140px] flex items-center justify-center">
              <CardContent className="flex flex-col items-center gap-2 py-8">
                <Plus className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">New set</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
