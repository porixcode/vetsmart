/**
 * Ejecuta manualmente las tareas de notificaciones del cron.
 * Uso: bun run scripts/run-cron.ts
 *
 * Requiere CRON_SECRET en .env
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000"
const SECRET   = process.env.CRON_SECRET

if (!SECRET) {
  console.error("❌ CRON_SECRET no está definido en .env")
  process.exit(1)
}

async function main() {
  console.log("🔄 Ejecutando tareas de notificaciones…")

  const res = await fetch(`${BASE_URL}/api/cron/notifications`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
  })

  const data = await res.json()

  if (!res.ok) {
    console.error(`❌ Error ${res.status}:`, data.error ?? "desconocido")
    process.exit(1)
  }

  console.log("✅ Notificaciones generadas:")
  console.log(`   Citas próximas:   ${data.created.appointments}`)
  console.log(`   Vacunas próximas:  ${data.created.vaccines}`)
  console.log(`   Stock crítico:     ${data.created.stock}`)
  console.log(`   Total:             ${data.created.appointments + data.created.vaccines + data.created.stock}`)
}

main().catch(console.error)
