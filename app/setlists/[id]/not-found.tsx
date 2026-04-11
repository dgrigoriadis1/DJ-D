import Link from 'next/link'
import { Music2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <Music2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Set not found</h2>
      <p className="text-muted-foreground mb-6">
        This setlist doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button asChild>
        <Link href="/setlists">Back to my sets</Link>
      </Button>
    </div>
  )
}
