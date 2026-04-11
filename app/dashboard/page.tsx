import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, ListMusic, Music2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) redirect('/login')

  const setlists = await prisma.setlist.findMany({
    where: { userId: session.userId },
    include: { tracks: { orderBy: { position: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
    take: 6,
  })

  const totalTracks = setlists.reduce((acc, s) => acc + s.tracks.length, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{session.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {setlists.length === 0
              ? 'Create your first setlist to get started'
              : `${setlists.length} set${setlists.length !== 1 ? 's' : ''} · ${totalTracks} tracks total`}
          </p>
        </div>
        <Button variant="spotify" asChild>
          <Link href="/setlists/new">
            <Plus className="h-4 w-4 mr-2" />
            New Set
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sets', value: setlists.length },
          { label: 'Total Tracks', value: totalTracks },
          {
            label: 'Avg Set Length',
            value:
              setlists.length > 0
                ? `${Math.round(totalTracks / setlists.length)} tracks`
                : '—',
          },
          {
            label: 'Total Duration',
            value:
              totalTracks > 0
                ? formatDuration(setlists.reduce((acc, s) => acc + s.tracks.reduce((a, t) => a + t.duration, 0), 0))
                : '—',
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent setlists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Sets</h2>
          {setlists.length > 0 && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/setlists">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>

        {setlists.length === 0 ? (
          <Card className="bg-card/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Music2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <CardTitle className="text-lg mb-2">No sets yet</CardTitle>
              <CardDescription className="mb-6 max-w-sm">
                Create your first DJ setlist and let AI help you build the perfect flow
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
                      <div className="flex items-start justify-between">
                        <ListMusic className="h-5 w-5 text-spotify-green shrink-0 mt-0.5" />
                      </div>
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
                      {/* Track name preview */}
                      {setlist.tracks.slice(0, 3).length > 0 && (
                        <div className="mt-3 space-y-1">
                          {setlist.tracks.slice(0, 3).map((track) => (
                            <p key={track.id} className="text-xs text-muted-foreground/70 truncate">
                              {track.name} — {track.artist}
                            </p>
                          ))}
                          {setlist.tracks.length > 3 && (
                            <p className="text-xs text-muted-foreground/50">
                              +{setlist.tracks.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
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
    </div>
  )
}
