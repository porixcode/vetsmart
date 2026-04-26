export function downloadCSV(lines: string[][], filename: string) {
  const csv = lines.map(line => line.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
