"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"

export async function setConfig(key: string, value: string) {
  await requireRole("ADMIN")

  await prisma.clinicConfig.upsert({
    where:  { key },
    create: { key, value },
    update: { value },
  })

  revalidatePath("/configuracion")
}

export async function setConfigJSON(key: string, value: unknown) {
  await setConfig(key, JSON.stringify(value))
}
