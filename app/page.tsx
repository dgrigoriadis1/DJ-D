import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Music2, Zap, BarChart3, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      {/* Hero */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-spotify-green/30 bg-spotify-green/10 text-spotify-green text-sm font-medium mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Spotify + Claude AI
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          Your AI{' '}
          <span className="text-spotify-green">DJ Partner</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Build perfect DJ sets in minutes. Upload your setlist, and DJ-D analyzes BPMs, harmonic
          keys, and energy flow — then uses AI to recommend the perfect transitions and songs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button variant="spotify" size="lg" asChild>
            <Link href="/login">
              Connect with Spotify
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {[
          {
            icon: <Music2 className="h-6 w-6 text-spotify-green" />,
            title: 'Spotify Integration',
            description:
              'Import your playlists directly. DJ-D fetches BPM, key, energy, and danceability for every track automatically.',
          },
          {
            icon: <BarChart3 className="h-6 w-6 text-blue-400" />,
            title: 'Visual Set Flow',
            description:
              'See your energy arc, BPM timeline, and harmonic compatibility at a glance. Spot weak transitions instantly.',
          },
          {
            icon: <Sparkles className="h-6 w-6 text-purple-400" />,
            title: 'AI Recommendations',
            description:
              'Claude analyzes your full set and suggests songs to fill gaps, improve flow, and make transitions seamless.',
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-border bg-card/50 text-left space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Problem statement */}
      <div className="mt-16 max-w-2xl mx-auto p-6 rounded-xl border border-border bg-muted/20">
        <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm leading-relaxed">
          Spotify and Apple Music take forever to pair 4-5 songs — much less a full set. Their AI DJ
          rarely gets it right. DJ-D does the heavy lifting instantly: paste your setlist, get a
          complete analysis in seconds, and build your perfect set with confidence.
        </p>
      </div>
    </div>
  )
}
