import "server-only"

import { prisma } from "@/lib/prisma"

export async function getConfig(key: string): Promise<string | null> {
  const row = await prisma.clinicConfig.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function getConfigJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await getConfig(key)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

export async function getAllConfig(): Promise<Record<string, string>> {
  const rows = await prisma.clinicConfig.findMany()
  const map: Record<string, string> = {}
  for (const r of rows) map[r.key] = r.value
  return map
}
