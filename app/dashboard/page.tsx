import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Plus, ListMusic, ArrowRight } from 'lucide-react'
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
  const totalDurationAll = setlists.reduce(
    (acc, s) => acc + s.tracks.reduce((a, t) => a + t.duration, 0),
    0
  )

  const firstName = session.user?.name?.split(' ')[0] ?? null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">
            Dashboard
          </p>
          <h1 className="text-3xl font-black">
            {firstName ? (
              <>Hey, <span className="gradient-text">{firstName}</span></>
            ) : (
              <span className="gradient-text">Your Sets</span>
            )}
          </h1>
        </div>
        <Link
          href="/setlists/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 glow-sm"
          style={{
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            color: '#fff',
          }}
        >
          <Plus className="h-4 w-4" />
          New Set
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Total Sets', value: setlists.length, color: 'var(--violet)' },
          { label: 'Total Tracks', value: totalTracks, color: 'var(--cyan)' },
          {
            label: 'Avg Set Length',
            value: setlists.length > 0 ? `${Math.round(totalTracks / setlists.length)}` : '—',
            suffix: setlists.length > 0 ? ' trks' : '',
            color: 'var(--pink)',
          },
          {
            label: 'Total Play Time',
            value: totalTracks > 0 ? formatDuration(totalDurationAll) : '—',
            color: 'var(--violet)',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--violet-border)',
            }}
          >
            <div className="text-2xl font-black font-mono" style={{ color: stat.color }}>
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
            </div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Sets grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm tracking-widest uppercase text-muted-foreground">
            Recent Sets
          </h2>
          {setlists.length > 0 && (
            <Link
              href="/setlists"
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: 'var(--violet)' }}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {setlists.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center border-dashed"
            style={{ border: '1px dashed var(--violet-border)' }}
          >
            <ListMusic className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <h3 className="font-bold text-lg mb-2">No sets yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Create your first DJ setlist and let AI help you build the perfect flow
            </p>
            <Link
              href="/setlists/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm glow-sm"
              style={{
                background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                color: '#fff',
              }}
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
                    className="border-glow rounded-xl p-5 h-full group cursor-pointer transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.025)' }}
                  >
                    {/* Header */}
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
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {setlist.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
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

                    {/* Energy bar */}
                    {setlist.tracks.length > 0 && (
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round(avgEnergy * 100)}%`,
                            background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
                          }}
                        />
                      </div>
                    )}

                    {/* Preview track names */}
                    {setlist.tracks.slice(0, 3).length > 0 && (
                      <div className="mt-3 space-y-1">
                        {setlist.tracks.slice(0, 3).map((t) => (
                          <p key={t.id} className="text-[11px] text-muted-foreground truncate opacity-60">
                            {t.name} — {t.artist}
                          </p>
                        ))}
                        {setlist.tracks.length > 3 && (
                          <p className="text-[11px] text-muted-foreground opacity-40">
                            +{setlist.tracks.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}

            {/* New set card */}
            <Link href="/setlists/new">
              <div
                className="rounded-xl h-full min-h-[140px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-dashed"
                style={{
                  border: '1px dashed var(--violet-border)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--violet-dim)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}
              >
                <Plus className="h-7 w-7 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground opacity-60">New set</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
