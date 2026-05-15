'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDuration } from '@/lib/utils'

interface SetlistHeaderProps {
  setlistId: string
  name: string
  description: string | null
  trackCount: number
  totalDuration: number
  avgBPM: number
}

export function SetlistHeader({
  setlistId,
  name,
  description,
  trackCount,
  totalDuration,
  avgBPM,
}: SetlistHeaderProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editDesc, setEditDesc] = useState(description ?? '')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) nameRef.current?.focus()
  }, [editing])

  const saveRename = async () => {
    if (!editName.trim()) { toast.error('Name cannot be empty'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/setlists/${setlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc || null }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Saved')
      setEditing(false)
      router.refresh()
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditName(name)
    setEditDesc(description ?? '')
    setEditing(false)
  }

  const deleteSetlist = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/setlists/${setlistId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success(`Deleted "${name}"`)
      router.push('/setlists')
    } catch {
      toast.error('Failed to delete setlist')
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input
              ref={nameRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename()
                if (e.key === 'Escape') cancelEdit()
              }}
              maxLength={100}
              className="w-full text-2xl font-black bg-transparent border-b-2 outline-none pb-1 text-foreground"
              style={{ borderColor: 'var(--violet)' }}
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit() }}
              placeholder="Description (optional)"
              maxLength={200}
              className="w-full text-sm bg-transparent border-b outline-none pb-0.5 text-muted-foreground"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={saveRename}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'var(--violet)', color: '#fff' }}
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--muted-foreground)' }}
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-black truncate">{name}</h1>
              <button
                onClick={() => setEditing(true)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1 rounded"
                title="Rename set"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            {description && (
              <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              {trackCount > 0 && (
                <>
                  <span>{trackCount} track{trackCount !== 1 ? 's' : ''}</span>
                  {totalDuration > 0 && (
                    <><span>·</span><span>{formatDuration(totalDuration)}</span></>
                  )}
                  <span>·</span>
                  <span className="font-mono" style={{ color: 'var(--cyan)' }}>
                    {avgBPM.toFixed(0)} avg BPM
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete */}
      {!editing && (
        <div className="shrink-0">
          {showDeleteConfirm ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
            >
              <span className="text-red-400 font-semibold">Delete set?</span>
              <button
                onClick={deleteSetlist}
                disabled={deleting}
                className="px-2 py-1 rounded-lg font-bold text-white transition-all"
                style={{ background: '#EF4444' }}
              >
                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 rounded-lg font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--muted-foreground)' }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg opacity-30 hover:opacity-80 transition-opacity"
              title="Delete set"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
