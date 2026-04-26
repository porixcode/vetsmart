import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const start = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      uptime: process.uptime(),
      latency: Date.now() - start,
    })
  } catch {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      db: "disconnected",
      uptime: process.uptime(),
      latency: Date.now() - start,
    }, { status: 503 })
  }
}
