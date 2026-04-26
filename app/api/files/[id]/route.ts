import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const doc = await prisma.patientDocument.findUnique({
      where: { id },
    })

    if (!doc) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), "public", doc.url)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo no encontrado en disco" }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg", jpeg: "image/jpeg",
      png: "image/png", webp: "image/webp", gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    const ext = path.extname(doc.name).toLowerCase().replace(".", "")
    const mime = mimeMap[ext] ?? "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${doc.name}"`,
        "Content-Length": String(buffer.length),
      },
    })
  } catch (err) {
    console.error("File serve error:", err)
    return NextResponse.json({ error: "Error al servir archivo" }, { status: 500 })
  }
}
