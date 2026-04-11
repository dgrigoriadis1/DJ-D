import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// DELETE /api/setlists/[id]/tracks/[trackId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, trackId } = await params

  // Verify ownership via setlist
  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  const track = await prisma.setlistTrack.findFirst({
    where: { id: trackId, setlistId: id },
  })

  if (!track) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.setlistTrack.delete({ where: { id: trackId } }),
    prisma.setlistTrack.updateMany({
      where: { setlistId: id, position: { gt: track.position } },
      data: { position: { decrement: 1 } },
    }),
    prisma.setlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true })
}
