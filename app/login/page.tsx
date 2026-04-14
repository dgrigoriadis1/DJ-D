import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginButton } from './LoginButton'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 60% at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(34,211,238,0.06) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-end justify-center gap-[3px] h-8 mb-5">
            {[3, 5, 7, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-[4px] rounded-full"
                style={{
                  height: `${h * 4}px`,
                  background: i === 2 ? 'var(--violet)' : i === 1 || i === 3 ? 'var(--cyan)' : 'var(--pink)',
                }}
              />
            ))}
          </div>
          <h1 className="text-4xl font-black gradient-text">DJ-D</h1>
          <p className="text-muted-foreground mt-2 text-sm">Your AI set planning partner</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 space-y-5"
          style={{
            background: 'rgba(17,8,32,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--violet-border)',
            boxShadow: '0 0 60px rgba(168,85,247,0.08)',
          }}
        >
          <div className="text-center mb-2">
            <h2 className="font-bold text-lg">Connect your Spotify</h2>
            <p className="text-muted-foreground text-sm mt-1">
              We&apos;ll read your playlists and audio data — nothing else.
            </p>
          </div>

          <LoginButton />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--violet-border)' }} />
            <span className="text-xs text-muted-foreground">What we access</span>
            <div className="flex-1 h-px" style={{ background: 'var(--violet-border)' }} />
          </div>

          {/* Permissions list */}
          <ul className="space-y-2">
            {[
              { icon: '✓', text: 'Read your playlists' },
              { icon: '✓', text: 'Read audio features (BPM, key, energy)' },
              { icon: '✓', text: 'Create new playlists (optional, later)' },
              { icon: '✗', text: 'We never modify existing playlists' },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span style={{ color: item.icon === '✓' ? 'var(--violet)' : 'var(--pink)' }}>
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Setup note */}
        <div
          className="mt-4 rounded-xl px-4 py-3 text-xs text-muted-foreground"
          style={{
            background: 'rgba(251,191,36,0.05)',
            border: '1px solid rgba(251,191,36,0.15)',
          }}
        >
          <span style={{ color: '#FBBF24' }}>First time?</span> You need a{' '}
          <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>
            .env.local
          </code>{' '}
          file with your API keys. See the README for setup instructions.
        </div>
      </div>
    </div>
  )
}
