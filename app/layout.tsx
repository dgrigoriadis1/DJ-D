import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'DJ-D — AI DJ Set Planner',
  description:
    'Build perfect DJ sets with AI. Analyze BPMs, harmonic keys, and energy flow — then let Claude recommend the perfect transitions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <footer className="text-center py-3 text-xs text-zinc-600">
            BPM &amp; key data powered by{' '}
            <a href="https://getsongbpm.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">
              GetSongBPM.com
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
