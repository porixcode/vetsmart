import { NextResponse } from "next/server"
import { runAll } from "@/lib/jobs/notifications"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  const expected   = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const result = await runAll()
    return NextResponse.json({ ok: true, created: result })
  } catch (err) {
    console.error("Cron error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
