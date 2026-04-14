'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
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
    <div className="max-w-lg mx-auto px-4 py-10 animate-fade-in">
      <Link
        href="/setlists"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sets
      </Link>

      <div className="mb-7">
        <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">New</p>
        <h1 className="text-3xl font-black">Create a <span className="gradient-text">Set</span></h1>
        <p className="text-muted-foreground text-sm mt-1">Give your setlist a name to get started</p>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid var(--violet-border)',
        }}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="name">
              Set name <span style={{ color: 'var(--pink)' }}>*</span>
            </label>
            <Input
              id="name"
              placeholder="e.g., Saturday Night Peak Hour"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
              className="bg-white/5 border-white/10 focus:border-violet-500/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="description">
              Description{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              id="description"
              placeholder="e.g., Tech house, 126-132 BPM, 2-hour set"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              className="bg-white/5 border-white/10 focus:border-violet-500/60"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
                color: '#fff',
                boxShadow: loading ? 'none' : 'var(--glow-sm)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Set
                </>
              )}
            </button>
            <Link
              href="/setlists"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--muted-foreground)',
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
