import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginButton } from './LoginButton'
import { Music2 } from 'lucide-react'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music2 className="h-10 w-10 text-spotify-green" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to DJ-D</h1>
          <p className="text-muted-foreground mt-2">Connect your Spotify account to get started</p>
        </div>

        {/* Login card */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <LoginButton />
          <p className="text-xs text-muted-foreground">
            DJ-D requests read access to your playlists and the ability to create new playlists.
            We never modify your existing playlists without permission.
          </p>
        </div>

        {/* Setup reminder */}
        <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-left">
          <p className="text-xs text-yellow-400 font-semibold mb-1">First time setup?</p>
          <p className="text-xs text-muted-foreground">
            You&apos;ll need Spotify API credentials in your <code className="bg-muted px-1 rounded">.env.local</code>.
            See <code className="bg-muted px-1 rounded">.env.example</code> for setup instructions.
          </p>
        </div>
      </div>
    </div>
  )
}
