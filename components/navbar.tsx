'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ListMusic, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 border-b" style={{
      borderColor: 'var(--violet-border)',
      background: 'rgba(8, 4, 15, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Custom waveform icon */}
            <div className="flex items-end gap-[3px] h-5">
              {[3, 5, 7, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full transition-all duration-300 group-hover:animate-pulse-glow"
                  style={{
                    height: `${h * 3}px`,
                    background: i === 2
                      ? 'var(--violet)'
                      : i === 1 || i === 3
                      ? 'var(--cyan)'
                      : 'var(--pink)',
                    opacity: 0.9,
                  }}
                />
              ))}
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">DJ-D</span>
          </Link>

          {/* Nav links */}
          {session && (
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild
                className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild
                className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                <Link href="/setlists">
                  <ListMusic className="h-4 w-4 mr-1.5" />
                  My Sets
                </Link>
              </Button>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle — always visible */}
            <ThemeToggle />

            {session ? (
              <>
                {session.user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? 'User'}
                    className="h-8 w-8 rounded-full hidden sm:block"
                    style={{ border: '1px solid var(--violet-border)' }}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 glow-sm"
                style={{
                  background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                  color: '#fff',
                }}
              >
                Connect Spotify
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
