import type { NextAuthConfig } from "next-auth"

/**
 * Configuración Edge-safe de Auth.js v5.
 * No debe importar Prisma ni bcrypt — solo lógica compatible con Edge runtime
 * (middleware). La config completa está en auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname === "/login"

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
        return true
      }

      // Todas las demás rutas requieren sesión
      return isLoggedIn
    },
  },
  providers: [], // poblado en auth.ts (Node runtime)
} satisfies NextAuthConfig
