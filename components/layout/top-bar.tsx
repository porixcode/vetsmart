"use client";

import { Search, Plus, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAppointmentModal } from "@/components/providers/appointment-modal-provider";

interface TopBarProps {
  breadcrumb?: string;
}

export function TopBar({ breadcrumb = "Dashboard" }: TopBarProps) {
  const [isDark, setIsDark] = useState(false);
  const { open: openAppointmentModal } = useAppointmentModal();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      {/* Breadcrumb */}
      <div className="flex items-center">
        <h1 className="text-sm font-medium text-text-primary">{breadcrumb}</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Buscar pacientes, citas, productos..."
            className="h-9 w-full rounded-sm border border-border bg-background-subtle pl-9 pr-16 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-150"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-background-muted px-1.5 font-mono text-[10px] font-medium text-text-muted sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-sm bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-150 active:scale-[0.98]"
          onClick={() => openAppointmentModal()}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          <span>Nueva cita</span>
        </Button>

        <button className="relative rounded-md p-2 transition-colors duration-150 hover:bg-background-muted">
          <Bell className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="rounded-md p-2 transition-colors duration-150 hover:bg-background-muted"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </header>
  );
}
