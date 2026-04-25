import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  // Protege todo salvo endpoints de auth, estáticos y assets
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|icon.*|apple-icon.*|.*\\.svg).*)",
  ],
}
