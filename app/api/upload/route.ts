import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

function attachmentTypeFromMime(mime: string): string {
  if (mime === "application/pdf") return "PDF"
  if (mime.startsWith("image/")) return "IMAGEN"
  return "OTRO"
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const formData = await req.formData()
    const files = formData.getAll("files") as File[]
    const patientId = formData.get("patientId") as string | null

    if (!files.length) {
      return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 })
    }

    const results = []

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type) && file.size > 0) {
        continue
      }

      const ext = path.extname(file.name) || ".bin"
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      const filePath = path.join(UPLOAD_DIR, uniqueName)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      const fileSize = `${(file.size / 1024).toFixed(1)} KB`

      let doc = null
      if (patientId) {
        doc = await prisma.patientDocument.create({
          data: {
            patientId,
            name: file.name,
            type: attachmentTypeFromMime(file.type) as any,
            category: "Otros",
            url: `/uploads/${uniqueName}`,
            size: fileSize,
          },
        })
      }

      results.push({
        id: doc?.id ?? uniqueName,
        name: file.name,
        url: `/uploads/${uniqueName}`,
        size: fileSize,
        type: attachmentTypeFromMime(file.type),
      })
    }

    return NextResponse.json({ files: results })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Error al subir archivos" }, { status: 500 })
  }
}
