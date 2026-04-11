import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/setlists — list all setlists for the current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const setlists = await prisma.setlist.findMany({
    where: { userId: session.userId },
    include: {
      tracks: {
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(setlists)
}

// POST /api/setlists — create a new setlist
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const setlist = await prisma.setlist.create({
    data: {
      userId: session.userId,
      name: name.trim(),
      description: description?.trim() ?? null,
    },
    include: { tracks: true },
  })

  return NextResponse.json(setlist, { status: 201 })
}
