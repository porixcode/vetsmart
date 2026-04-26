"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Shield, MonitorSmartphone, ClipboardList, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UsersTab } from "@/components/users/users-tab"
import { RolesTab } from "@/components/users/roles-tab"
import { SessionsTab } from "@/components/users/sessions-tab"
import { AuditTab } from "@/components/users/audit-tab"
import { UserDetailDrawer } from "@/components/users/user-detail-drawer"
import { NewUserModal } from "@/components/users/new-user-modal"
import { EditUserModal } from "@/components/users/edit-user-modal"
import { deleteUser, updateUserStatus, resetPassword } from "@/lib/actions/users"
import type { UserView, ActiveSessionView, AuditLogEntry } from "@/lib/types/users-view"

type MainTab = "usuarios" | "roles" | "sesiones" | "auditoria"

interface UsuariosPageClientProps {
  users:      UserView[]
  stats:      { total: number; byRole: Record<string, number>; byStatus: Record<string, number> }
  sessions:   ActiveSessionView[]
  auditLog:   AuditLogEntry[]
}

export function UsuariosPageClient({ users, stats, sessions, auditLog }: UsuariosPageClientProps) {
  const router = useRouter()
  const [tab, setTab] = React.useState<MainTab>("usuarios")
  const [drawerUser, setDrawerUser] = React.useState<UserView | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isNewUserOpen, setIsNewUserOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserView | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [tempPassword, setTempPassword] = React.useState<string | null>(null)
  const [confirmAction, setConfirmAction] = React.useState<{ user: UserView; action: "delete" | "suspend" | "activate" } | null>(null)

  const openDrawer = (user: UserView) => { setDrawerUser(user); setIsDrawerOpen(true) }

  const handleDelete = async (user: UserView) => {
    const result = await deleteUser(user.id)
    if (result.ok) { router.refresh(); setIsDrawerOpen(false); setConfirmAction(null) }
  }

  const handleStatusToggle = async (user: UserView) => {
    const newStatus = user.status === "Activo" ? "SUSPENDED" : "ACTIVE"
    const result = await updateUserStatus(user.id, newStatus)
    if (result.ok) { router.refresh(); setIsDrawerOpen(false); setConfirmAction(null) }
  }

  const handleResetPassword = async (user: UserView) => {
    const formData = new FormData()
    formData.set("userId", user.id)
    const result = await resetPassword({} as any, formData)
    if (result.ok && "temporaryPassword" in result) {
      setTempPassword(result.temporaryPassword)
    }
  }

  const handleEdit = (user: UserView) => {
    setEditingUser(user)
    setIsEditOpen(true)
  }

  const activeCount = stats.byStatus["ACTIVE"] ?? 0
  const rolesCount  = Object.keys(stats.byRole).length

  const TABS: Array<{ id: MainTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number }> = [
    { id:"usuarios",  label:"Usuarios",         icon:Users,            badge: users.length },
    { id:"roles",     label:"Roles y permisos", icon:Shield,           badge: rolesCount },
    { id:"sesiones",  label:"Sesiones activas", icon:MonitorSmartphone, badge: sessions.length },
    { id:"auditoria", label:"Auditoría",        icon:ClipboardList },
  ]

  return (
    <div className="flex h-full flex-col">
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
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setIsNewUserOpen(true)}>
            <Plus className="size-3.5" strokeWidth={1.5} />
            Nuevo usuario
          </Button>
        </div>
      </div>

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

      <div className="flex flex-1 min-h-0 flex-col">
        {tab === "usuarios"  && (
          <UsersTab
            users={users}
            onUserClick={openDrawer}
            onEdit={handleEdit}
            onDelete={(u) => setConfirmAction({ user: u, action: "delete" })}
            onStatusToggle={(u) => setConfirmAction({ user: u, action: u.status === "Activo" ? "suspend" : "activate" })}
            onResetPassword={handleResetPassword}
            onNewUser={() => setIsNewUserOpen(true)}
          />
        )}
        {tab === "roles"     && <RolesTab />}
        {tab === "sesiones"  && <SessionsTab sessions={sessions} />}
        {tab === "auditoria" && <AuditTab auditLog={auditLog} />}
      </div>

      <UserDetailDrawer
        user={drawerUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEdit}
        onDelete={(u) => { setIsDrawerOpen(false); setConfirmAction({ user: u, action: "delete" }) }}
        onStatusToggle={(u) => { setIsDrawerOpen(false); setConfirmAction({ user: u, action: u.status === "Activo" ? "suspend" : "activate" }) }}
        onResetPassword={handleResetPassword}
      />

      <NewUserModal
        open={isNewUserOpen}
        onOpenChange={setIsNewUserOpen}
        onSuccess={(pw) => { setTempPassword(pw); router.refresh() }}
      />

      <EditUserModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => router.refresh()}
        user={editingUser}
      />

      {/* Temporary password dialog */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setTempPassword(null)}>
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2">Contraseña temporal</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Comparte esta contraseña con el usuario. Solo se muestra una vez.
            </p>
            <div className="rounded-md border bg-muted px-3 py-2 font-mono text-sm tracking-wider text-center">
              {tempPassword}
            </div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => { navigator.clipboard.writeText(tempPassword); setTempPassword(null) }}>
                Copiar y cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setConfirmAction(null)}>
          <div className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2">
              {confirmAction.action === "delete" ? "Eliminar usuario" : confirmAction.action === "suspend" ? "Suspender usuario" : "Activar usuario"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {confirmAction.action === "delete"
                ? `¿Estás seguro de eliminar a ${confirmAction.user.name}? Esta acción es reversible.`
                : confirmAction.action === "suspend"
                  ? `¿Suspender a ${confirmAction.user.name}? No podrá acceder al sistema.`
                  : `¿Activar a ${confirmAction.user.name}? Podrá acceder al sistema nuevamente.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button
                size="sm"
                variant={confirmAction.action === "delete" ? "destructive" : "default"}
                onClick={() => {
                  if (confirmAction.action === "delete") handleDelete(confirmAction.user)
                  else handleStatusToggle(confirmAction.user)
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
