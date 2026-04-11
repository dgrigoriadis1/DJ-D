'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export default function NewSetlistPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/setlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create setlist')
      }

      const setlist = await res.json()
      toast.success(`Created "${setlist.name}"`)
      router.push(`/setlists/${setlist.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create setlist')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/setlists">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sets
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Set</h1>
        <p className="text-muted-foreground mt-1">Give your setlist a name to get started</p>
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Set details</CardTitle>
          <CardDescription>You can always change these later</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Set name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                placeholder="e.g., Saturday Night Peak Hour"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                id="description"
                placeholder="e.g., Tech house, 126-132 BPM, 2-hour set"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="spotify"
                disabled={!name.trim() || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Set'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/setlists">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
