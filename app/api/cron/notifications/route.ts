import { NextResponse } from "next/server"
import { runAll } from "@/lib/jobs/notifications"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  const expected   = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expected) {
    console.error(`[cron] auth=${authHeader?.slice(0, 40)} expected=Bearer ${process.env.CRON_SECRET?.slice(0, 10)}...`)
    return NextResponse.json({ error: "No autorizado", debug: !process.env.CRON_SECRET ? "CRON_SECRET no cargado en entorno" : "Token inválido" }, { status: 401 })
  }

  try {
    const result = await runAll()
    return NextResponse.json({ ok: true, created: result })
  } catch (err) {
    console.error("Cron error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
