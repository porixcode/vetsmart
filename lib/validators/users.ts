import { z } from "zod"
import { Role, UserStatus, Gender } from "@prisma/client"
import { ROLE_LABEL_TO_ENUM, STATUS_LABEL_TO_ENUM } from "@/lib/types/users-view"

const roleCoerce = z.preprocess(
  v => (typeof v === "string" && ROLE_LABEL_TO_ENUM[v as keyof typeof ROLE_LABEL_TO_ENUM])
    ? ROLE_LABEL_TO_ENUM[v as keyof typeof ROLE_LABEL_TO_ENUM]
    : v,
  z.nativeEnum(Role, { errorMap: () => ({ message: "Rol inválido" }) }),
)

const statusCoerce = z.preprocess(
  v => (typeof v === "string" && STATUS_LABEL_TO_ENUM[v as keyof typeof STATUS_LABEL_TO_ENUM])
    ? STATUS_LABEL_TO_ENUM[v as keyof typeof STATUS_LABEL_TO_ENUM]
    : v,
  z.nativeEnum(UserStatus, { errorMap: () => ({ message: "Estado inválido" }) }),
)

export const UserSearchSchema = z.object({
  q:      z.string().optional().default(""),
  role:   z.string().optional().default("Todos"),
  status: z.string().optional().default("Todos"),
})
export type UserSearch = z.infer<typeof UserSearchSchema>

const genderCoerce = z.preprocess(
  v => {
    if (v === "Masculino") return "MASCULINO"
    if (v === "Femenino")  return "FEMENINO"
    return v
  },
  z.nativeEnum(Gender).optional().nullable(),
)

export const CreateUserSchema = z.object({
  name:    z.string().trim().min(1, "Nombre requerido"),
  email:   z.string().trim().email("Email inválido").min(1, "Email requerido"),
  phone:   z.string().trim().optional().transform(v => v || null),
  cedula:  z.string().trim().optional().transform(v => v || null),
  role:    roleCoerce,
  specialty:         z.string().trim().optional().transform(v => v || null),
  cedulaProfesional: z.string().trim().optional().transform(v => v || null),
  universidad:       z.string().trim().optional().transform(v => v || null),
  graduationYear:    z.coerce.number().int().positive().optional().nullable().transform(v => v ?? null),
  birthDate:         z.coerce.date().optional().nullable().transform(v => v ?? null),
  gender:            genderCoerce,
  address:           z.string().trim().optional().transform(v => v || null),
  color:             z.string().default("#6B7280"),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  id: z.string().min(1),
  status: statusCoerce.optional(),
})
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

export const ResetPasswordSchema = z.object({
  userId: z.string().min(1),
})
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
