import { AppShell } from "@/components/layout/app-shell"
import { listUsers, getUserStats, getActiveSessions, getAuditLog } from "@/lib/queries/users"
import { UsuariosPageClient } from "./usuarios-page-client"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  const [users, stats, sessions, auditLog] = await Promise.all([
    listUsers(),
    getUserStats(),
    getActiveSessions(),
    getAuditLog(),
  ])

  return (
    <AppShell>
      <UsuariosPageClient
        users={users}
        stats={stats}
        sessions={sessions}
        auditLog={auditLog}
      />
    </AppShell>
  )
}
