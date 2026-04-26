import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { userId } = await params

  const entries = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, color: true } },
    },
  })

  return NextResponse.json(entries.map(e => ({
    id:          e.id,
    userId:      e.userId,
    userName:    e.user?.name ?? null,
    userColor:   e.user?.color ?? null,
    actionType:  e.actionType,
    module:      e.module,
    description: e.description,
    ip:          e.ip ?? null,
    device:      e.device ?? null,
    createdAt:   e.createdAt.toISOString(),
  })))
}
