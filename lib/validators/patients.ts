import { z } from "zod"
import { Species, PatientSex, PatientStatus } from "@prisma/client"

/** Conversión Label UI ↔ enum Prisma (la UI usa strings humanos). */
export const SPECIES_LABEL_TO_ENUM: Record<string, Species> = {
  Canino: "CANINO",
  Felino: "FELINO",
  Ave:    "AVE",
  Roedor: "ROEDOR",
  Reptil: "REPTIL",
  Otro:   "OTRO",
}
export const SPECIES_ENUM_TO_LABEL: Record<Species, "Canino" | "Felino" | "Ave" | "Roedor" | "Reptil" | "Otro"> = {
  CANINO: "Canino", FELINO: "Felino", AVE: "Ave", ROEDOR: "Roedor", REPTIL: "Reptil", OTRO: "Otro",
}

export const SEX_LABEL_TO_ENUM: Record<string, PatientSex> = { Macho: "MACHO", Hembra: "HEMBRA" }
export const SEX_ENUM_TO_LABEL: Record<PatientSex, "Macho" | "Hembra"> = { MACHO: "Macho", HEMBRA: "Hembra" }

export const STATUS_LABEL_TO_ENUM: Record<string, PatientStatus> = {
  Activo:            "ACTIVO",
  Inactivo:          "INACTIVO",
  "En tratamiento":  "EN_TRATAMIENTO",
}
export const STATUS_ENUM_TO_LABEL: Record<PatientStatus, "Activo" | "Inactivo" | "En tratamiento"> = {
  ACTIVO:         "Activo",
  INACTIVO:       "Inactivo",
  EN_TRATAMIENTO: "En tratamiento",
}

const stringListFromCSV = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform(v => {
    if (!v) return []
    if (Array.isArray(v)) return v.map(s => s.trim()).filter(Boolean)
    return v.split(",").map(s => s.trim()).filter(Boolean)
  })

const OwnerInlineSchema = z.object({
  name:       z.string().trim().min(1, "Nombre del dueño requerido"),
  documentId: z.string().trim().min(1, "Documento requerido"),
  phone:      z.string().trim().min(1, "Teléfono requerido"),
  email:      z.string().trim().email("Email inválido").optional().or(z.literal("")).transform(v => v || undefined),
  address:    z.string().trim().optional().transform(v => v || undefined),
})

/** Acepta tanto labels UI ("Canino") como enum values ("CANINO"). */
const speciesCoerce = z.preprocess(
  v => (typeof v === "string" && SPECIES_LABEL_TO_ENUM[v]) ? SPECIES_LABEL_TO_ENUM[v] : v,
  z.nativeEnum(Species, { errorMap: () => ({ message: "Especie inválida" }) }),
)
const sexCoerce = z.preprocess(
  v => (typeof v === "string" && SEX_LABEL_TO_ENUM[v]) ? SEX_LABEL_TO_ENUM[v] : v,
  z.nativeEnum(PatientSex, { errorMap: () => ({ message: "Sexo inválido" }) }),
)

export const CreatePatientSchema = z.object({
  name:      z.string().trim().min(1, "Nombre requerido"),
  species:   speciesCoerce,
  breed:     z.string().trim().min(1, "Raza requerida"),
  sex:       sexCoerce,
  birthDate: z.coerce.date().optional(),
  weight:    z.coerce.number().positive().optional(),
  color:     z.string().trim().optional().transform(v => v || undefined),
  microchip: z.string().trim().optional().transform(v => v || undefined),
  neutered:  z.coerce.boolean().optional().default(false),
  allergies:             stringListFromCSV,
  preexistingConditions: stringListFromCSV,
  notes:                 z.string().trim().optional().transform(v => v || undefined),

  ownerMode: z.enum(["existing", "new"]),
  ownerId:   z.string().optional(),
  owner:     OwnerInlineSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.ownerMode === "existing" && !data.ownerId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ownerId"], message: "Selecciona un dueño existente" })
  }
  if (data.ownerMode === "new" && !data.owner) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["owner"], message: "Datos del nuevo dueño requeridos" })
  }
})
export type CreatePatientInput = z.infer<typeof CreatePatientSchema>

export const UpdatePatientSchema = CreatePatientSchema.innerType().partial().extend({
  id: z.string().min(1),
})
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>

export const PatientSearchSchema = z.object({
  q:         z.string().optional().default(""),
  species:   z.string().optional().default("Todas"),
  status:    z.string().optional().default("Activos"),
  lastVisit: z.string().optional().default("Cualquier fecha"),
  vet:       z.string().optional().default("Todos"),
})
export type PatientSearch = z.infer<typeof PatientSearchSchema>
