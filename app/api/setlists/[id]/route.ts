import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/setlists/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
    include: {
      tracks: { orderBy: { position: 'asc' } },
    },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  return NextResponse.json(setlist)
}

// PUT /api/setlists/[id] — update name/description
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, description } = body

  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  const updated = await prisma.setlist.update({
    where: { id },
    data: {
      name: name?.trim() ?? setlist.name,
      description: description !== undefined ? description?.trim() ?? null : setlist.description,
    },
    include: { tracks: { orderBy: { position: 'asc' } } },
  })

  return NextResponse.json(updated)
}

// DELETE /api/setlists/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const setlist = await prisma.setlist.findFirst({
    where: { id, userId: session.userId },
  })

  if (!setlist) {
    return NextResponse.json({ error: 'Setlist not found' }, { status: 404 })
  }

  await prisma.setlist.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
