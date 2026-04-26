"use client"

import * as React from "react"
import { ShieldCheck, Users, Check, X } from "lucide-react"
import { ROLE_CONFIG, ALL_PERMISSIONS, PERMISSIONS_BY_ROLE, ROLES, type UserRoleLabel } from "@/lib/types/users-view"
import { cn } from "@/lib/utils"

function PermissionRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground capitalize">{label}</span>
      {granted
        ? <Check className="size-3.5 text-emerald-500 shrink-0" strokeWidth={2} />
        : <X className="size-3.5 text-muted-foreground/40 shrink-0" strokeWidth={2} />}
    </div>
  )
}

function RoleCard({ role }: { role: UserRoleLabel }) {
  const cfg = ROLE_CONFIG[role]
  const perms = PERMISSIONS_BY_ROLE[role]
  return (
    <div className="flex flex-col rounded-lg border border-border bg-background overflow-hidden">
      <div className={cn("px-5 py-4 border-b border-border", cfg.bg)}>
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-full"
            style={{ background: cfg.color }}
          >
            <ShieldCheck className="size-5 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("text-base font-semibold", cfg.text)}>{role}</h3>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{cfg.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {Object.entries(ALL_PERMISSIONS).map(([module, actions]) => {
          const granted = perms[module] ?? []
          if (granted.length === 0 && role === "Administrador") return null
          return (
            <div key={module}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground mb-1.5">{module}</p>
              <div className="divide-y divide-border/50">
                {actions.map(action => (
                  <PermissionRow key={action} label={action} granted={granted.includes(action)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-border px-5 py-3">
        <button className="w-full rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
          Editar permisos
        </button>
      </div>
    </div>
  )
}

export function RolesTab() {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto p-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Los permisos son heredados por todos los usuarios del rol. Puedes agregar o remover permisos individuales desde el perfil de cada usuario.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {ROLES.map(role => (
          <RoleCard key={role} role={role} />
        ))}
      </div>
    </div>
  )
}
