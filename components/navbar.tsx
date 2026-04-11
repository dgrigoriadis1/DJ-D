'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Music2, LogOut, ListMusic, Home } from 'lucide-react'
import { Button } from './ui/button'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Music2 className="h-6 w-6 text-spotify-green" />
            <span className="text-white">DJ-D</span>
          </Link>

          {/* Nav links */}
          {session && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/setlists">
                  <ListMusic className="h-4 w-4 mr-2" />
                  My Sets
                </Link>
              </Button>
            </div>
          )}

          {/* User */}
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  className="h-8 w-8 rounded-full border border-border"
                />
              )}
              <span className="text-sm text-muted-foreground hidden sm:block">
                {session.user?.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="spotify" size="sm" asChild>
              <Link href="/login">Connect Spotify</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
