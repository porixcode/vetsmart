"use server"

import { revalidatePath } from "next/cache"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"

export async function deleteDocument(id: string, patientId: string) {
  const user = await requireRole("ADMIN", "VETERINARIO")

  try {
    const doc = await prisma.patientDocument.findUnique({ where: { id } })
    if (!doc) return { ok: false, error: "Documento no encontrado" } as const

    await prisma.patientDocument.delete({ where: { id } })

    const filePath = path.join(process.cwd(), "public", doc.url)
    if (existsSync(filePath)) {
      await unlink(filePath).catch(() => {})
    }

    await prisma.auditLog.create({
      data: {
        userId:      user.id,
        actionType:  "DELETE",
        module:      "Documentos",
        targetId:    id,
        description: `Eliminó documento ${doc.name}`,
      },
    })

    revalidatePath(`/pacientes/${patientId}`)
    return { ok: true } as const
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { ok: false, error: msg } as const
  }
}
