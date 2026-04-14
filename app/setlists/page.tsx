import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, ListMusic } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">Library</p>
          <h1 className="text-3xl font-black">My <span className="gradient-text">Sets</span></h1>
          <p className="text-muted-foreground text-sm mt-1">{setlists.length} setlist{setlists.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/setlists/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm glow-sm transition-all"
          style={{ background: 'linear-gradient(135deg, var(--violet), var(--cyan))', color: '#fff' }}
        >
          <Plus className="h-4 w-4" />
          New Set
        </Link>
      </div>

      {setlists.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ border: '1px dashed var(--violet-border)' }}
        >
          <ListMusic className="h-10 w-10 mx-auto mb-4 opacity-20" />
          <h3 className="font-bold text-lg mb-2">No sets yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Build your first DJ setlist</p>
          <Link
            href="/setlists/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm glow-sm"
            style={{ background: 'linear-gradient(135deg, var(--violet), var(--cyan))', color: '#fff' }}
          >
            <Plus className="h-4 w-4" />
            Create your first set
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {setlists.map((setlist) => {
            const dur = setlist.tracks.reduce((acc, t) => acc + t.duration, 0)
            const avgBPM = setlist.tracks.length > 0
              ? setlist.tracks.reduce((acc, t) => acc + t.bpm, 0) / setlist.tracks.length
              : 0
            const avgEnergy = setlist.tracks.length > 0
              ? setlist.tracks.reduce((acc, t) => acc + t.energy, 0) / setlist.tracks.length
              : 0

            return (
              <Link key={setlist.id} href={`/setlists/${setlist.id}`}>
                <div
                  className="border-glow rounded-xl p-5 h-full cursor-pointer transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.025)' }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--violet-dim)' }}
                    >
                      <ListMusic className="h-5 w-5" style={{ color: 'var(--violet)' }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{setlist.name}</h3>
                      {setlist.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{setlist.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="font-mono">{setlist.tracks.length} tracks</span>
                    {dur > 0 && <><span>·</span><span>{formatDuration(dur)}</span></>}
                    {avgBPM > 0 && (
                      <><span>·</span>
                      <span className="font-mono" style={{ color: 'var(--cyan)' }}>
                        {avgBPM.toFixed(0)} BPM
                      </span></>
                    )}
                  </div>

                  {setlist.tracks.length > 0 && (
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(avgEnergy * 100)}%`,
                          background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
                        }}
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground/40 mt-3">
                    {new Date(setlist.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            )
          })}

          <Link href="/setlists/new">
            <div
              className="rounded-xl h-full min-h-[140px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              style={{ border: '1px dashed var(--violet-border)' }}
            >
              <Plus className="h-7 w-7 opacity-30" />
              <p className="text-sm text-muted-foreground opacity-60">New set</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
