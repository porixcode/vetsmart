import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { ROLE_ENUM_TO_LABEL } from "@/lib/types/users-view"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { userId } = await params

  const sessions = await prisma.session.findMany({
    where: { userId, expires: { gt: new Date() } },
    orderBy: { lastActivity: "desc" },
    include: {
      user: { select: { name: true, role: true, color: true } },
    },
  })

  type Session = (typeof sessions)[number]

  return NextResponse.json(sessions.map((s: Session) => ({
    id:           s.id,
    userId:       s.userId,
    userName:     s.user.name,
    userRole:     ROLE_ENUM_TO_LABEL[s.user.role],
    userColor:    s.user.color,
    deviceType:   s.deviceType,
    browser:      s.browser ?? null,
    ip:           s.ip ?? null,
    city:         s.city ?? null,
    startedAt:    s.lastActivity.toISOString(),
    lastActivity: s.lastActivity.toISOString(),
  })))
}
