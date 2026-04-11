'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Music2 } from 'lucide-react'

export function LoginButton() {
  return (
    <Button
      variant="spotify"
      size="lg"
      className="w-full"
      onClick={() => signIn('spotify', { callbackUrl: '/dashboard' })}
    >
      <Music2 className="h-5 w-5 mr-2" />
      Continue with Spotify
    </Button>
  )
}
