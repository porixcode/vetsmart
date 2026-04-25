import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"
import { AppointmentModalProvider } from "@/components/providers/appointment-modal-provider"

interface AppShellProps {
  children: React.ReactNode
  breadcrumb?: string
}

export function AppShell({ children, breadcrumb }: AppShellProps) {
  return (
    <AppointmentModalProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-60">
          <TopBar breadcrumb={breadcrumb} />
          <main className="p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AppointmentModalProvider>
  )
}
