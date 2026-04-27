"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Package,
  BarChart3,
  UserCog,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/app/actions/auth"

const ROLE_LABEL: Record<string, string> = {
  ADMIN:         "Administrador",
  VETERINARIO:   "Veterinario",
  RECEPCIONISTA: "Recepcionista",
}

const navSections = [
  {
    label: "Principal",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Pacientes", href: "/pacientes", icon: Users },
      { name: "Citas", href: "/citas", icon: Calendar },
      { name: "Historial Clínico", href: "/historial-clinico", icon: FileText },
    ],
  },
  {
    label: "Gestión",
    items: [
      { name: "Inventario", href: "/inventario", icon: Package },
      { name: "Reportes", href: "/reportes", icon: BarChart3 },
      { name: "Usuarios", href: "/usuarios", icon: UserCog },
    ],
  },
  {
    label: "Sistema",
    items: [
      { name: "Configuración", href: "/configuracion", icon: Settings },
      { name: "Ayuda", href: "/ayuda", icon: HelpCircle },
    ],
  },
]

function getInitials(name: string | null | undefined): string {
  if (!name) return "??"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? "")
    .join("") || "??"
}

export function Sidebar() {
  const pathname = usePathname()
  const [notificationCount] = useState(3)
  const { data: session, status } = useSession()

  const user = session?.user
  const displayName = user?.name ?? (status === "loading" ? "Cargando…" : "Invitado")
  const roleLabel = user?.role ? ROLE_LABEL[user.role] : ""
  const initials = getInitials(user?.name)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-border bg-background flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold tracking-tight-custom text-text-primary">
            Vet
          </span>
          <span className="text-lg font-semibold tracking-tight-custom text-primary">
            Smart
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </div>

      {/* User Pill */}
      <div className="border-b border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-2 transition-colors duration-150 hover:bg-background-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
                {roleLabel && <p className="text-xs text-text-muted">{roleLabel}</p>}
              </div>
              <ChevronDown className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-text-muted">
              {user?.email ?? "Sin sesión"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil" className="gap-2">
                <UserIcon className="h-4 w-4" strokeWidth={1.5} />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-danger focus:text-danger">
              <form action={logoutAction}>
                <button type="submit" className="flex w-full items-center gap-2 text-left">
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Cerrar sesión
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors duration-150",
                          isActive
                            ? "border-l-2 border-primary bg-primary/10 text-primary font-medium"
                            : "text-text-secondary hover:bg-background-muted hover:text-text-primary"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-primary" : "text-text-muted"
                          )}
                          strokeWidth={1.5}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <button className="relative rounded-md p-2 transition-colors duration-150 hover:bg-background-muted">
            <Bell className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
                {notificationCount}
              </span>
            )}
          </button>
          <button className="rounded-md p-2 transition-colors duration-150 hover:bg-background-muted">
            <Settings className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
