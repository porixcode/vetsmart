"use server"

import ExcelJS from "exceljs"
import { requireRole } from "@/lib/auth-utils"

export async function generateExcelReport(
  headers: string[],
  rows: string[][],
  sheetName: string,
): Promise<{ ok: true; buffer: number[] } | { ok: false; error: string }> {
  try {
    await requireRole("ADMIN", "VETERINARIO")

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "VetSmart"
    workbook.created = new Date()

    const sheet = workbook.addWorksheet(sheetName)
    sheet.columns = headers.map(h => ({ header: h, key: h, width: 20 }))
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } }

    rows.forEach((row, ri) => {
      const excelRow: Record<string, string> = {}
      headers.forEach((h, ci) => { excelRow[h] = row[ci] ?? "" })
      sheet.addRow(excelRow)
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return { ok: true, buffer: Array.from(new Uint8Array(buffer)) }
  } catch (err) {
    return { ok: false, error: `Error al generar Excel: ${err instanceof Error ? err.message : "Error"}` }
  }
}
