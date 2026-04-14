import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowRight, Zap, BarChart3, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="relative overflow-hidden">
      {/* Ambient mesh background */}
      <div className="mesh-bg absolute inset-0 pointer-events-none" />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">

        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 animate-fade-in"
          style={{
            background: 'var(--violet-dim)',
            border: '1px solid var(--violet-border)',
            color: 'var(--violet)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-glow" />
          AI-Powered DJ Set Planner
        </div>

        {/* Main headline */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 animate-fade-in">
          <span className="gradient-text">Build</span>
          <br />
          <span className="text-foreground">Perfect Sets.</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10 animate-fade-in">
          Upload your setlist. DJ-D maps every BPM, key, and energy curve —
          then AI plans transitions and recommends songs like a seasoned
          touring DJ would.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-center animate-fade-in">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-300 glow-violet"
            style={{
              background: 'linear-gradient(135deg, #A855F7 0%, #22D3EE 100%)',
              color: '#fff',
            }}
          >
            Connect with Spotify
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <span className="text-xs text-muted-foreground">Free · No credit card</span>
        </div>

        {/* Floating stat chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-14 animate-fade-in">
          {[
            { label: 'BPM Matched', value: '±0.1', color: 'var(--violet)' },
            { label: 'Key Analysis', value: 'Camelot', color: 'var(--cyan)' },
            { label: 'AI Transitions', value: 'Claude', color: 'var(--pink)' },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="font-bold font-mono" style={{ color: chip.color }}>
                {chip.value}
              </span>
              <span className="text-muted-foreground">{chip.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Problem statement — full width band */}
      <section
        className="relative py-16 px-4"
        style={{ borderTop: '1px solid var(--violet-border)', borderBottom: '1px solid var(--violet-border)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Zap className="h-6 w-6 mx-auto mb-4" style={{ color: 'var(--pink)' }} />
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Spotify takes forever to pair 4–5 songs — much less a full set.
            Their AI DJ rarely gets it right. DJ-D does the heavy lifting instantly:
            paste your setlist, get a complete harmonic and energy analysis in seconds,
            and build with confidence.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">
            Everything a <span className="gradient-text">real DJ</span> considers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
                color: 'var(--violet)',
                title: 'BPM & Tempo Mapping',
                body: 'Every track analyzed for exact BPM. Transition scores flag rough jumps before you mix.',
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                color: 'var(--cyan)',
                title: 'Harmonic Mixing',
                body: 'Full Camelot wheel compatibility. Compatible keys are scored green — clashing keys flagged immediately.',
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                color: 'var(--pink)',
                title: 'AI Song Recommendations',
                body: 'Claude analyzes your full set arc and suggests exact songs to bridge weak transitions.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border-glow rounded-xl p-6 group transition-all duration-300"
                style={{ background: 'var(--violet-dim)' }}
              >
                <div
                  className="inline-flex p-2.5 rounded-lg mb-4"
                  style={{ background: 'rgba(255,255,255,0.06)', color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-black mb-4">
            Ready to <span className="gradient-text-warm">drop</span>?
          </h2>
          <p className="text-muted-foreground mb-8">
            Connect Spotify, import a playlist, and get your first AI analysis in under a minute.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold transition-all duration-300 glow-violet"
            style={{
              background: 'linear-gradient(135deg, #A855F7 0%, #22D3EE 100%)',
              color: '#fff',
            }}
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
