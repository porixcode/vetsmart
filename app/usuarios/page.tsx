"use client"

import * as React from "react"
import { Users, Shield, MonitorSmartphone, ClipboardList, Plus, ExternalLink } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { UsersTab } from "@/components/users/users-tab"
import { RolesTab } from "@/components/users/roles-tab"
import { SessionsTab } from "@/components/users/sessions-tab"
import { AuditTab } from "@/components/users/audit-tab"
import { UserDetailDrawer } from "@/components/users/user-detail-drawer"
import { systemUsers, activeSessions, type SystemUser } from "@/lib/data/users"
import { cn } from "@/lib/utils"

type MainTab = "usuarios" | "roles" | "sesiones" | "auditoria"

const activeCount  = systemUsers.filter(u => u.status === "Activo").length
const rolesCount   = 3
const sessionCount = activeSessions.length

export default function UsuariosPage() {
  const [tab, setTab] = React.useState<MainTab>("usuarios")
  const [drawerUser, setDrawerUser] = React.useState<SystemUser | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const openDrawer = (user: SystemUser) => { setDrawerUser(user); setIsDrawerOpen(true) }

  const TABS: Array<{ id: MainTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number }> = [
    { id:"usuarios",  label:"Usuarios",         icon:Users,            badge: systemUsers.length },
    { id:"roles",     label:"Roles y permisos", icon:Shield },
    { id:"sesiones",  label:"Sesiones activas", icon:MonitorSmartphone, badge: sessionCount },
    { id:"auditoria", label:"Auditoría",        icon:ClipboardList },
  ]

  return (
    <AppShell>
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              {activeCount} usuarios activos · {rolesCount} roles del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
              <ExternalLink className="size-3.5" strokeWidth={1.5} />
              Auditoría de accesos
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setTab("usuarios")}>
              <Plus className="size-3.5" strokeWidth={1.5} />
              Nuevo usuario
            </Button>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex border-b px-6">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  tab === t.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {t.label}
                {t.badge !== undefined && (
                  <span className={cn(
                    "rounded-full px-1.5 text-[10px] font-medium",
                    tab === t.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  )}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex flex-1 min-h-0 flex-col">
          {tab === "usuarios"  && <UsersTab onUserClick={openDrawer} />}
          {tab === "roles"     && <RolesTab />}
          {tab === "sesiones"  && <SessionsTab />}
          {tab === "auditoria" && <AuditTab />}
        </div>
      </div>

      <UserDetailDrawer
        user={drawerUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </AppShell>
  )
}
