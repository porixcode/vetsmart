import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { authConfig } from "./auth.config"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",      type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const ip = req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim()
                ?? req?.headers?.get("x-real-ip")
                ?? email
        const rl = rateLimit(`login:${ip}`, 5)
        if (!rl.ok) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || user.deletedAt) return null
        if (user.status !== "ACTIVE") return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.image,
          role:  user.role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as typeof session.user.role
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return
      await Promise.all([
        prisma.user.update({
          where: { id: user.id },
          data:  { lastActivityAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            userId:      user.id,
            actionType:  "LOGIN",
            module:      "Sistema",
            description: "Inicio de sesión exitoso",
          },
        }),
      ]).catch(err => console.error("signIn event error:", err))
    },
    async signOut(message) {
      const userId = "token" in message && message.token
        ? (message.token as { id?: string }).id
        : undefined
      if (!userId) return
      await prisma.auditLog.create({
        data: {
          userId,
          actionType:  "LOGOUT",
          module:      "Sistema",
          description: "Cierre de sesión",
        },
      }).catch(err => console.error("signOut event error:", err))
    },
  },
})
