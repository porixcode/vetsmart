import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { AppShell } from "@/components/layout/app-shell"
import { PerfilClient } from "./perfil-client"

export const dynamic = "force-dynamic"

export default async function PerfilPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <AppShell>
      <PerfilClient user={user} />
    </AppShell>
  )
}
