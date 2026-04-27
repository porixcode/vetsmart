import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { AppointmentModalProvider } from '@/components/providers/appointment-modal-provider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VetSmart - SERMEC Veterinaria',
  description: 'Sistema de gestión veterinaria profesional para SERMEC Veterinaria',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased text-sm">
        <SessionProvider>
          <AppointmentModalProvider>
            {children}
          </AppointmentModalProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
