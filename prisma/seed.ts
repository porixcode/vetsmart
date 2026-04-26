/**
 * VetSmart — Seed idempotente
 *
 * Ejecutar con: bun run db:seed (alias de `prisma db seed`)
 *
 * Borra todo el data en orden de dependencias y repuebla con datos
 * realistas basados en los mocks de lib/data/*. Password por defecto
 * para todos los usuarios: Vetsmart2026! (hasheado con bcrypt).
 */

import { PrismaClient, Role, UserStatus, Gender, Species, PatientSex, PatientStatus,
         AppointmentStatus, ServiceType, ServiceCategory, RecordStatus, AttentionType,
         VaccinationStatus, ProductCategory, ProductStatus, MovementType, MovementReason,
         ReminderChannel, ReminderDeliveryStatus, AttachmentType, AuditActionType,
         DeviceType, ClinicType, TaxRegime } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Vetsmart2026!"

// ─── Helpers de fecha ────────────────────────────────────────
const now = new Date()
function daysAgo(days: number, h = 10, m = 0): Date {
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  d.setHours(h, m, 0, 0)
  return d
}
function daysFromNow(days: number, h = 10, m = 0): Date {
  return daysAgo(-days, h, m)
}

async function reset() {
  console.log("🧹 Limpiando base de datos…")
  // Orden inverso de dependencias
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.appointmentReminder.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.productLot.deleteMany()
  await prisma.productSupplier.deleteMany()
  await prisma.recordAttachment.deleteMany()
  await prisma.recordProcedure.deleteMany()
  await prisma.recordMedication.deleteMany()
  await prisma.recordDiagnosis.deleteMany()
  await prisma.recordVitals.deleteMany()
  await prisma.clinicalRecord.deleteMany()
  await prisma.vaccination.deleteMany()
  await prisma.deworming.deleteMany()
  await prisma.patientDocument.deleteMany()
  await prisma.patientNote.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.serviceVeterinarian.deleteMany()
  await prisma.service.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.owner.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.diagnosis.deleteMany()
  await prisma.reminderTemplate.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.clinicSchedule.deleteMany()
  await prisma.holiday.deleteMany()
  await prisma.room.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.clinicConfig.deleteMany()
  await prisma.clinic.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
}

// ═════════════════════════════════════════════════════════════
// 1. CLÍNICA + BRANCH + ROOMS + SCHEDULE + PAYMENT METHODS
// ═════════════════════════════════════════════════════════════
async function seedClinic() {
  console.log("🏥 Creando clínica SERMEC…")
  const clinic = await prisma.clinic.create({
    data: {
      name: "SERMEC Veterinaria",
      legalName: "Servicios Médicos Veterinarios SERMEC S.A.S",
      nit: "900.123.456-7",
      type: ClinicType.GENERAL,
      phone: "608-555-0100",
      email: "contacto@sermec.com",
      website: "https://sermec.com",
      address: "Cra. 32 #15-42",
      city: "Villavicencio",
      department: "Meta",
      country: "Colombia",
      timezone: "America/Bogota",
      currency: "COP",
      speciesServed: ["Caninos", "Felinos", "Aves", "Exóticos"],
      taxRegime: TaxRegime.REGIMEN_SIMPLE,
      ivaRate: 19,
      icaRate: 0.414,
      invoicePrefix: "FV-SRM",
      invoiceStart: 1,
      invoiceCurrent: 1,
      branches: {
        create: [{
          name: "Sede Principal",
          address: "Cra. 32 #15-42, Villavicencio",
          phone: "608-555-0100",
          isMain: true,
          rooms: {
            create: [
              { name: "Consultorio 1" },
              { name: "Consultorio 2" },
              { name: "Consultorio 3" },
              { name: "Sala de Estética" },
              { name: "Quirófano" },
              { name: "Urgencias" },
            ],
          },
        }],
      },
      schedules: {
        create: [
          { day: 0, isOpen: true,  maxPerHour: 4, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
          { day: 1, isOpen: true,  maxPerHour: 4, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
          { day: 2, isOpen: true,  maxPerHour: 4, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
          { day: 3, isOpen: true,  maxPerHour: 4, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
          { day: 4, isOpen: true,  maxPerHour: 4, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
          { day: 5, isOpen: true,  maxPerHour: 3, shifts: [{ start: "08:00", end: "13:00" }] },
          { day: 6, isOpen: false, maxPerHour: 0, shifts: [] },
        ],
      },
      paymentMethods: {
        create: [
          { name: "Efectivo" },
          { name: "Transferencia bancaria" },
          { name: "Tarjeta débito" },
          { name: "Tarjeta crédito" },
          { name: "Nequi" },
          { name: "Daviplata" },
        ],
      },
      reminderTemplates: {
        create: [
          { name: "Recordatorio de cita",     description: "24 horas antes",       category: "cita",     timing: "24h antes",     subject: "Recordatorio: cita mañana en SERMEC", body: "Hola {nombre_dueño}, le recordamos la cita de {nombre_paciente} mañana {fecha_cita} a las {hora_cita} con {veterinario}. Si necesita reagendar responda este mensaje." },
          { name: "Confirmación de cita",     description: "Al agendar",           category: "cita",     timing: "inmediato",     subject: "Cita confirmada en SERMEC", body: "Hola {nombre_dueño}, su cita para {nombre_paciente} fue confirmada para el {fecha_cita} a las {hora_cita}. Servicio: {servicio}. Veterinario: {veterinario}." },
          { name: "Vacuna próxima a vencer",  description: "7 días antes",         category: "vacuna",   timing: "7 días antes",  subject: "Vacuna de {nombre_paciente} vence pronto", body: "Hola {nombre_dueño}, la vacuna {nombre_vacuna} de {nombre_paciente} vence el {fecha_vencimiento}. Agende su refuerzo llamando al {telefono_clinica}." },
          { name: "Post-cirugía",             description: "Día después cirugía",  category: "cirugía",  timing: "24h después",   subject: "¿Cómo está {nombre_paciente}?", body: "Hola {nombre_dueño}, esperamos que {nombre_paciente} se esté recuperando bien. Cualquier duda o signo de alarma comuníquese al {telefono_clinica}." },
          { name: "Control post-tratamiento", description: "Recordatorio control", category: "control",  timing: "según prescr.", subject: "Control programado", body: "Hola {nombre_dueño}, le recordamos el control de {nombre_paciente} para el {fecha_control}. Diagnóstico: {diagnostico}. Tratamiento: {tratamiento}." },
          { name: "Cumpleaños",               description: "Día del cumpleaños",   category: "social",   timing: "día 0",         body: "¡Hoy {nombre_paciente} cumple {edad} años! En SERMEC celebramos con ustedes. 🎉" },
          { name: "Encuesta de satisfacción", description: "2 días post-visita",   category: "encuesta", timing: "48h después",   subject: "¿Cómo estuvo su visita?", body: "Hola {nombre_dueño}, nos encantaría saber cómo estuvo su experiencia con {veterinario}. Su opinión nos ayuda a mejorar." },
          { name: "Reactivación",             description: "Paciente inactivo",    category: "reactivación", timing: "6 meses sin visita", body: "Hola {nombre_dueño}, hace tiempo no vemos a {nombre_paciente}. Le invitamos a agendar un control preventivo. Responda este mensaje." },
        ],
      },
    },
    include: { branches: { include: { rooms: true } } },
  })
  console.log(`   ✓ Clínica creada (id: ${clinic.id})`)
  return clinic
}

// ═════════════════════════════════════════════════════════════
// 2. USUARIOS (Admins + Vets + Recepcionistas)
// ═════════════════════════════════════════════════════════════
async function seedUsers() {
  console.log("👥 Creando usuarios…")
  const hash = await bcrypt.hash(PASSWORD, 10)

  const admins = [
    { email: "admin@vetsmart.co",         name: "Lucía Fernández", cedula: "52.341.876", phone: "310-555-0201", color: "#8B5CF6", gender: Gender.FEMENINO,  birthDate: new Date(1988, 4, 14), address: "Cra. 7 #45-12, Bogotá" },
    { email: "carlos.poris@vetsmart.co",  name: "Carlos Poris",    cedula: "79.821.453", phone: "315-555-0202", color: "#7C3AED", gender: Gender.MASCULINO, birthDate: new Date(1985, 9, 3),  address: "Cll. 100 #15-32, Bogotá" },
  ]

  const vets = [
    { email: "marly.jara@sermec.com",     name: "Marly Jara",     cedula: "52.847.391", phone: "321-555-0203", color: "#3B82F6", gender: Gender.FEMENINO,  birthDate: new Date(1986, 1, 20), address: "Cra. 15 #82-44, Villavicencio", specialty: "Medicina General", cedulaProfesional: "MV-14823", universidad: "Universidad Nacional de Colombia", graduationYear: 2012 },
    { email: "carlos.mendoza@sermec.com", name: "Carlos Mendoza", cedula: "79.234.812", phone: "317-555-0204", color: "#10B981", gender: Gender.MASCULINO, birthDate: new Date(1981, 6, 7),  address: "Cll. 50 #28-10, Villavicencio", specialty: "Cirugía",          cedulaProfesional: "MV-09547", universidad: "Universidad de Antioquia",        graduationYear: 2008 },
    { email: "ana.rodriguez@sermec.com",  name: "Ana Rodríguez",  cedula: "63.419.287", phone: "312-555-0205", color: "#F59E0B", gender: Gender.FEMENINO,  birthDate: new Date(1990, 2, 15), address: "Av. Alfonso López #5-32, Villavicencio", specialty: "Dermatología", cedulaProfesional: "MV-22184", universidad: "Universidad CES", graduationYear: 2015 },
    { email: "luis.perez@sermec.com",     name: "Luis Pérez",     cedula: "80.157.634", phone: "318-555-0206", color: "#8B5CF6", gender: Gender.MASCULINO, birthDate: new Date(1983, 11, 22), address: "Cra. 4 #72-18, Villavicencio", specialty: "Cardiología",       cedulaProfesional: "MV-31042", universidad: "Universidad de La Salle", graduationYear: 2010 },
  ]

  const receps = [
    { email: "sandra.gutierrez@sermec.com", name: "Sandra Gutiérrez", cedula: "52.784.126", phone: "320-555-0209", color: "#14B8A6", gender: Gender.FEMENINO,  birthDate: new Date(1991, 5, 12), address: "Cra. 30 #17-21, Villavicencio" },
    { email: "felipe.torres@sermec.com",    name: "Felipe Torres",    cedula: "80.341.892", phone: "316-555-0210", color: "#0D9488", gender: Gender.MASCULINO, birthDate: new Date(1994, 10, 8), address: "Cll. 80 #60-14, Villavicencio" },
    { email: "maria.ospina@sermec.com",     name: "María Ospina",     cedula: "43.218.764", phone: "319-555-0211", color: "#14B8A6", gender: Gender.FEMENINO,  birthDate: new Date(1992, 8, 25), address: "Cra. 43A #10-50, Villavicencio" },
  ]

  const createdAdmins = await Promise.all(admins.map(a => prisma.user.create({
    data: { ...a, passwordHash: hash, role: Role.ADMIN, status: UserStatus.ACTIVE, twoFactorEnabled: true, lastActivityAt: daysAgo(0, 8, 30), lastIp: "192.168.1.10" },
  })))
  const createdVets = await Promise.all(vets.map(v => prisma.user.create({
    data: { ...v, passwordHash: hash, role: Role.VETERINARIO, status: UserStatus.ACTIVE, twoFactorEnabled: false, lastActivityAt: daysAgo(0, 11, 0), lastIp: "192.168.1.21", createdById: createdAdmins[0].id },
  })))
  const createdReceps = await Promise.all(receps.map(r => prisma.user.create({
    data: { ...r, passwordHash: hash, role: Role.RECEPCIONISTA, status: UserStatus.ACTIVE, twoFactorEnabled: false, lastActivityAt: daysAgo(0, 8, 0), lastIp: "192.168.1.41", createdById: createdAdmins[0].id },
  })))

  console.log(`   ✓ ${createdAdmins.length} admins, ${createdVets.length} vets, ${createdReceps.length} recepcionistas`)
  return { admins: createdAdmins, vets: createdVets, receps: createdReceps }
}

// ═════════════════════════════════════════════════════════════
// 3. DIAGNÓSTICOS (CIE-10 Veterinario)
// ═════════════════════════════════════════════════════════════
async function seedDiagnoses() {
  console.log("🏷️  Creando catálogo CIE-10…")
  const entries = [
    { cie10: "L23.0",     description: "Dermatitis alérgica por contacto", category: "Dermatología",   species: ["Canino", "Felino"] },
    { cie10: "J00",       description: "Rinofaringitis aguda (resfriado común)", category: "Respiratorio", species: ["Canino", "Felino"] },
    { cie10: "K59.1",     description: "Diarrea funcional",                category: "Gastrointestinal", species: ["Canino", "Felino"] },
    { cie10: "N39.0",     description: "Infección del tracto urinario",    category: "Urinario",        species: ["Canino", "Felino"] },
    { cie10: "H66.9",     description: "Otitis media no especificada",     category: "ORL",             species: ["Canino"] },
    { cie10: "K08.1",     description: "Pérdida dental por caries",        category: "Odontología",     species: ["Canino", "Felino"] },
    { cie10: "B85.0",     description: "Infestación por pulgas",           category: "Parasitología",   species: ["Canino", "Felino"] },
    { cie10: "E66.0",     description: "Obesidad debida a exceso calórico", category: "Nutrición",      species: ["Canino", "Felino"] },
    { cie10: "M25.5",     description: "Dolor articular",                  category: "Musculoesquelético", species: ["Canino"] },
    { cie10: "I51.9",     description: "Enfermedad cardíaca no especificada", category: "Cardiología",   species: ["Canino", "Felino"] },
    { cie10: "C80.9",     description: "Neoplasia maligna sin especificar", category: "Oncología",      species: ["Canino", "Felino"] },
    { cie10: "A09",       description: "Gastroenteritis infecciosa",       category: "Gastrointestinal", species: ["Canino"] },
    { cie10: "L08.0",     description: "Pioderma",                         category: "Dermatología",    species: ["Canino"] },
    { cie10: "T14.1",     description: "Herida abierta",                   category: "Trauma",          species: ["Canino", "Felino"] },
    { cie10: "E10.9",     description: "Diabetes mellitus tipo 1",         category: "Endocrino",       species: ["Canino", "Felino"] },
  ]
  await prisma.diagnosis.createMany({ data: entries })
  console.log(`   ✓ ${entries.length} diagnósticos`)
}

// ═════════════════════════════════════════════════════════════
// 4. OWNERS + PATIENTS
// ═════════════════════════════════════════════════════════════
async function seedOwnersAndPatients(vets: { id: string }[]) {
  console.log("👤 Creando propietarios y pacientes…")

  const ownersData = [
    { name: "Carlos García Mendoza",     phone: "+57 310 456 7890", email: "carlos.garcia@email.com",   address: "Cra 45 #78-23, Villavicencio", documentId: "80.123.456" },
    { name: "María Fernanda López",      phone: "+57 315 234 5678", email: "mafe.lopez@email.com",       address: "Calle 100 #15-42, Villavicencio", documentId: "52.987.654" },
    { name: "Andrés Felipe Rodríguez",   phone: "+57 301 987 6543", email: "andres.rodriguez@email.com", address: "Av 19 #134-50, Villavicencio", documentId: "79.456.789" },
    { name: "Laura Valentina Martínez",  phone: "+57 320 111 2233", email: "laura.martinez@email.com",   address: "Calle 72 #10-25, Villavicencio", documentId: "1.020.789.456" },
    { name: "Juan David Hernández",      phone: "+57 318 555 6677", email: "juandavid.h@email.com",      address: "Cra 7 #45-67, Villavicencio", documentId: "80.567.234" },
    { name: "Camila Andrea Sánchez",     phone: "+57 312 888 9900", email: "camila.sanchez@email.com",   address: "Calle 53 #23-45, Villavicencio", documentId: "1.019.234.567" },
    { name: "Santiago José Ramírez",     phone: "+57 317 333 4455", email: "santiago.ramirez@email.com", address: "Cra 15 #93-10, Villavicencio", documentId: "79.234.567" },
    { name: "Valentina Restrepo Díaz",   phone: "+57 314 666 7788", email: "vale.restrepo@email.com",    address: "Calle 116 #45-89, Villavicencio", documentId: "52.345.678" },
    { name: "Daniel Alejandro Castro",   phone: "+57 319 222 3344", email: "daniel.castro@email.com",    address: "Av Alfonso López #115-50, Villavicencio", documentId: "1.018.567.890" },
    { name: "Sofía Isabella Moreno",     phone: "+57 316 444 5566", email: "sofia.moreno@email.com",     address: "Cra 68 #80-15, Villavicencio", documentId: "1.022.123.456" },
  ]
  const owners = await Promise.all(ownersData.map(o => prisma.owner.create({ data: o })))

  const patientsData = [
    { ownerIdx: 0, name: "Luna",    species: Species.CANINO, breed: "Golden Retriever",   sex: PatientSex.HEMBRA, birthDate: new Date(2023, 3, 15), weight: 28.5, color: "Dorado",      neutered: true,  allergies: ["Pollo"], preexistingConditions: [] },
    { ownerIdx: 1, name: "Max",     species: Species.CANINO, breed: "Bulldog Francés",    sex: PatientSex.MACHO,  birthDate: new Date(2021, 6, 22), weight: 12.0, color: "Blanco/Negro", neutered: true,  allergies: [], preexistingConditions: ["Dermatitis alérgica"] },
    { ownerIdx: 2, name: "Michi",   species: Species.FELINO, breed: "Persa",              sex: PatientSex.HEMBRA, birthDate: new Date(2024, 1, 10), weight: 4.5,  color: "Blanco",      neutered: false, allergies: [], preexistingConditions: [] },
    { ownerIdx: 3, name: "Rocky",   species: Species.CANINO, breed: "Pastor Alemán",      sex: PatientSex.MACHO,  birthDate: new Date(2019, 8, 5),  weight: 35.0, color: "Negro/Café",  neutered: true,  allergies: [], preexistingConditions: ["Displasia cadera"] },
    { ownerIdx: 4, name: "Coco",    species: Species.AVE,    breed: "Cacatúa",            sex: PatientSex.MACHO,  birthDate: new Date(2022, 3, 12), weight: 0.35, color: "Blanco/Amarillo", neutered: false, allergies: [], preexistingConditions: [] },
    { ownerIdx: 5, name: "Toby",    species: Species.CANINO, breed: "Beagle",             sex: PatientSex.MACHO,  birthDate: new Date(2025, 4, 20), weight: 10.0, color: "Tricolor",    neutered: false, allergies: [], preexistingConditions: [] },
    { ownerIdx: 6, name: "Pelusa",  species: Species.FELINO, breed: "Maine Coon",         sex: PatientSex.HEMBRA, birthDate: new Date(2020, 0, 8),  weight: 8.0,  color: "Gris",        neutered: true,  allergies: [], preexistingConditions: [] },
    { ownerIdx: 7, name: "Bruno",   species: Species.CANINO, breed: "Rottweiler",         sex: PatientSex.MACHO,  birthDate: new Date(2022, 5, 3),  weight: 45.0, color: "Negro/Café",  neutered: true,  allergies: [], preexistingConditions: [] },
    { ownerIdx: 8, name: "Nina",    species: Species.CANINO, breed: "Poodle",             sex: PatientSex.HEMBRA, birthDate: new Date(2018, 2, 18), weight: 6.2,  color: "Café",        neutered: true,  allergies: [], preexistingConditions: ["Cataratas"] },
    { ownerIdx: 9, name: "Simba",   species: Species.FELINO, breed: "Bengalí",            sex: PatientSex.MACHO,  birthDate: new Date(2023, 7, 30), weight: 5.0,  color: "Atigrado",    neutered: false, allergies: [], preexistingConditions: [] },
    { ownerIdx: 0, name: "Duque",   species: Species.CANINO, breed: "Labrador",           sex: PatientSex.MACHO,  birthDate: new Date(2020, 11, 1), weight: 32.0, color: "Chocolate",   neutered: true,  allergies: [], preexistingConditions: [] },
    { ownerIdx: 1, name: "Canela",  species: Species.CANINO, breed: "Cocker Spaniel",     sex: PatientSex.HEMBRA, birthDate: new Date(2021, 2, 14), weight: 14.0, color: "Dorado",      neutered: true,  allergies: [], preexistingConditions: [] },
    { ownerIdx: 3, name: "Whiskers", species: Species.FELINO, breed: "Siamés",            sex: PatientSex.MACHO,  birthDate: new Date(2022, 0, 20), weight: 4.2,  color: "Crema/Café",  neutered: true,  allergies: [], preexistingConditions: [] },
    { ownerIdx: 5, name: "Thor",    species: Species.CANINO, breed: "Husky Siberiano",    sex: PatientSex.MACHO,  birthDate: new Date(2024, 1, 28), weight: 25.0, color: "Blanco/Gris", neutered: false, allergies: [], preexistingConditions: [] },
    { ownerIdx: 7, name: "Bella",   species: Species.CANINO, breed: "Labrador",           sex: PatientSex.HEMBRA, birthDate: new Date(2022, 6, 9),  weight: 30.0, color: "Negro",       neutered: true,  allergies: [], preexistingConditions: [] },
  ]
  const patients = await Promise.all(patientsData.map((p, i) => prisma.patient.create({
    data: {
      name: p.name, species: p.species, breed: p.breed, sex: p.sex, birthDate: p.birthDate,
      weight: p.weight, color: p.color, neutered: p.neutered,
      allergies: p.allergies, preexistingConditions: p.preexistingConditions,
      status: PatientStatus.ACTIVO,
      ownerId: owners[p.ownerIdx].id,
      assignedVetId: vets[i % vets.length].id,
    },
  })))

  console.log(`   ✓ ${owners.length} propietarios, ${patients.length} pacientes`)
  return { owners, patients }
}

// ═════════════════════════════════════════════════════════════
// 5. SERVICIOS
// ═════════════════════════════════════════════════════════════
async function seedServices(vets: { id: string; specialty: string | null }[]) {
  console.log("💉 Creando servicios…")
  const servicesData = [
    { code: "CON-001", name: "Consulta general",              category: ServiceCategory.CONSULTA,      duration: 30,   price: 80000,  description: "Valoración general del paciente" },
    { code: "CON-002", name: "Consulta de seguimiento",       category: ServiceCategory.CONSULTA,      duration: 20,   price: 45000,  description: "Control post-tratamiento" },
    { code: "CON-003", name: "Consulta especializada",        category: ServiceCategory.CONSULTA,      duration: 45,   price: 140000, description: "Dermato / Cardio / Oncología" },
    { code: "VAC-001", name: "Vacuna antirrábica",            category: ServiceCategory.VACUNACION,    duration: 15,   price: 55000,  description: "Aplicación + registro" },
    { code: "VAC-002", name: "Vacuna séxtuple",               category: ServiceCategory.VACUNACION,    duration: 15,   price: 70000,  description: "DA2PPL canino" },
    { code: "VAC-003", name: "Vacuna triple felina",          category: ServiceCategory.VACUNACION,    duration: 15,   price: 60000,  description: "Rinotraqueitis, calicivirus, panleucopenia" },
    { code: "CIR-001", name: "Castración macho",              category: ServiceCategory.CIRUGIA,       duration: 90,   price: 280000, description: "Incluye anestesia y post-op" },
    { code: "CIR-002", name: "Esterilización hembra",         category: ServiceCategory.CIRUGIA,       duration: 120,  price: 380000, description: "OVH" },
    { code: "CIR-003", name: "Limpieza dental profunda",      category: ServiceCategory.CIRUGIA,       duration: 90,   price: 220000, description: "Con anestesia inhalatoria" },
    { code: "CIR-004", name: "Cirugía de tejidos blandos",    category: ServiceCategory.CIRUGIA,       duration: 180,  price: 650000, description: "Según evaluación previa" },
    { code: "EST-001", name: "Baño y corte",                  category: ServiceCategory.ESTETICA,      duration: 60,   price: 65000,  description: "Razas pequeñas" },
    { code: "EST-002", name: "Baño y corte raza grande",      category: ServiceCategory.ESTETICA,      duration: 90,   price: 95000 },
    { code: "EST-003", name: "Baño medicado",                 category: ServiceCategory.ESTETICA,      duration: 45,   price: 55000 },
    { code: "DIA-001", name: "Hemograma completo",            category: ServiceCategory.DIAGNOSTICO,   duration: 10,   price: 75000 },
    { code: "DIA-002", name: "Perfil bioquímico",             category: ServiceCategory.DIAGNOSTICO,   duration: 10,   price: 120000 },
    { code: "DIA-003", name: "Radiografía",                   category: ServiceCategory.DIAGNOSTICO,   duration: 20,   price: 95000 },
    { code: "DIA-004", name: "Ecografía abdominal",           category: ServiceCategory.DIAGNOSTICO,   duration: 30,   price: 150000 },
    { code: "HOS-001", name: "Hospitalización día",           category: ServiceCategory.HOSPITALIZACION, duration: 1440, price: 180000, description: "24h con monitoreo" },
    { code: "HOS-002", name: "Hospitalización UCI día",       category: ServiceCategory.HOSPITALIZACION, duration: 1440, price: 350000, description: "UCI con ventilación" },
  ]
  const services = await Promise.all(servicesData.map(s => prisma.service.create({ data: s })))

  // Asignar vets según especialidad y categoría
  const assignments: { serviceId: string; userId: string }[] = []
  for (const svc of services) {
    // Todos los vets hacen consultas generales y vacunaciones
    if (svc.category === "CONSULTA" || svc.category === "VACUNACION" || svc.category === "ESTETICA") {
      vets.forEach(v => assignments.push({ serviceId: svc.id, userId: v.id }))
    }
    // Cirugías: solo el cirujano (Carlos Mendoza) + Luis (cardiología también puede)
    else if (svc.category === "CIRUGIA") {
      vets.filter(v => v.specialty === "Cirugía" || v.specialty === "Cardiología").forEach(v => assignments.push({ serviceId: svc.id, userId: v.id }))
    }
    // Diagnóstico: todos
    else if (svc.category === "DIAGNOSTICO") {
      vets.forEach(v => assignments.push({ serviceId: svc.id, userId: v.id }))
    }
    // Hospitalización: medicina general + cirugía
    else if (svc.category === "HOSPITALIZACION") {
      vets.filter(v => v.specialty === "Medicina General" || v.specialty === "Cirugía").forEach(v => assignments.push({ serviceId: svc.id, userId: v.id }))
    }
  }
  await prisma.serviceVeterinarian.createMany({ data: assignments })
  console.log(`   ✓ ${services.length} servicios, ${assignments.length} asignaciones vet-servicio`)
  return services
}

// ═════════════════════════════════════════════════════════════
// 6. APPOINTMENTS + REMINDERS
// ═════════════════════════════════════════════════════════════
async function seedAppointments(
  patients: { id: string; ownerId: string }[],
  vets: { id: string }[],
  services: { id: string; name: string; duration: number; category: string }[],
  rooms: { id: string; name: string }[],
) {
  console.log("📅 Creando citas…")
  const appts: { patientId: string; ownerId: string; veterinarianId: string; serviceId: string; serviceType: ServiceType; status: AppointmentStatus; startsAt: Date; duration: number; roomId: string; reason: string; internalNotes?: string }[] = []

  const svcByCode = Object.fromEntries(services.map(s => [s.name, s]))
  const roomByName = Object.fromEntries(rooms.map(r => [r.name, r]))

  // Citas distribuidas: pasado (completadas), presente (en curso/programadas), futuro (confirmadas)
  const defs = [
    { patIdx: 0,  vetIdx: 0, svc: "Consulta general",      type: ServiceType.CONSULTA,   status: AppointmentStatus.COMPLETADA, day: -2, hour: 8,  reason: "Control general y peso" },
    { patIdx: 1,  vetIdx: 0, svc: "Vacuna séxtuple",       type: ServiceType.VACUNACION, status: AppointmentStatus.COMPLETADA, day: -2, hour: 9,  reason: "Refuerzo anual", room: "Consultorio 1" },
    { patIdx: 2,  vetIdx: 2, svc: "Baño y corte",          type: ServiceType.ESTETICA,   status: AppointmentStatus.COMPLETADA, day: -1, hour: 10, reason: "Baño mensual",      room: "Sala de Estética" },
    { patIdx: 3,  vetIdx: 1, svc: "Consulta general",      type: ServiceType.CONTROL,    status: AppointmentStatus.COMPLETADA, day: -1, hour: 11, reason: "Control displasia", room: "Consultorio 2" },
    { patIdx: 4,  vetIdx: 0, svc: "Consulta especializada", type: ServiceType.CONSULTA,  status: AppointmentStatus.EN_CURSO,   day: 0,  hour: 9,  reason: "Pérdida de plumas" },
    { patIdx: 5,  vetIdx: 0, svc: "Vacuna antirrábica",    type: ServiceType.VACUNACION, status: AppointmentStatus.PROGRAMADA, day: 0,  hour: 10, reason: "Primera vacuna" },
    { patIdx: 6,  vetIdx: 3, svc: "Consulta especializada", type: ServiceType.CONSULTA,  status: AppointmentStatus.PROGRAMADA, day: 0,  hour: 11, reason: "Evaluación cardíaca" },
    { patIdx: 7,  vetIdx: 1, svc: "Castración macho",      type: ServiceType.CIRUGIA,    status: AppointmentStatus.CONFIRMADA, day: 0,  hour: 14, reason: "Castración programada", room: "Quirófano", notes: "Ayuno confirmado" },
    { patIdx: 8,  vetIdx: 2, svc: "Baño medicado",         type: ServiceType.ESTETICA,   status: AppointmentStatus.PROGRAMADA, day: 0,  hour: 16, reason: "Dermatitis", room: "Sala de Estética" },
    { patIdx: 9,  vetIdx: 0, svc: "Consulta general",      type: ServiceType.CONSULTA,   status: AppointmentStatus.PROGRAMADA, day: 1,  hour: 9,  reason: "Control anual" },
    { patIdx: 10, vetIdx: 1, svc: "Limpieza dental profunda", type: ServiceType.CIRUGIA, status: AppointmentStatus.CONFIRMADA, day: 1,  hour: 10, reason: "Halitosis y sarro", room: "Quirófano" },
    { patIdx: 11, vetIdx: 2, svc: "Consulta especializada", type: ServiceType.CONSULTA,  status: AppointmentStatus.CONFIRMADA, day: 1,  hour: 14, reason: "Descamación piel" },
    { patIdx: 12, vetIdx: 0, svc: "Vacuna triple felina",  type: ServiceType.VACUNACION, status: AppointmentStatus.PROGRAMADA, day: 2,  hour: 9,  reason: "Refuerzo anual" },
    { patIdx: 13, vetIdx: 3, svc: "Consulta especializada", type: ServiceType.CONSULTA,  status: AppointmentStatus.PROGRAMADA, day: 2,  hour: 11, reason: "Evaluación cardíaca rutina" },
    { patIdx: 14, vetIdx: 1, svc: "Esterilización hembra", type: ServiceType.CIRUGIA,    status: AppointmentStatus.PROGRAMADA, day: 3,  hour: 9,  reason: "OVH programada",  room: "Quirófano" },
    { patIdx: 0,  vetIdx: 2, svc: "Baño y corte",          type: ServiceType.ESTETICA,   status: AppointmentStatus.PROGRAMADA, day: 3,  hour: 15, reason: "Baño mensual", room: "Sala de Estética" },
    { patIdx: 2,  vetIdx: 0, svc: "Consulta de seguimiento", type: ServiceType.CONTROL,  status: AppointmentStatus.PROGRAMADA, day: 4,  hour: 10, reason: "Control post-vacuna" },
    { patIdx: 5,  vetIdx: 0, svc: "Consulta general",      type: ServiceType.CONSULTA,   status: AppointmentStatus.PROGRAMADA, day: 5,  hour: 11, reason: "Control mensual" },
    { patIdx: 4,  vetIdx: 0, svc: "Consulta general",      type: ServiceType.CONSULTA,   status: AppointmentStatus.CANCELADA,  day: -1, hour: 14, reason: "Control", notes: "Cancelado por el dueño" },
    { patIdx: 11, vetIdx: 0, svc: "Consulta general",      type: ServiceType.CONSULTA,   status: AppointmentStatus.NO_ASISTIO, day: -3, hour: 15, reason: "Dolor de oído" },
  ]

  for (const d of defs) {
    const svc = svcByCode[d.svc]
    const startsAt = daysAgo(-d.day, d.hour, 0)
    appts.push({
      patientId: patients[d.patIdx].id,
      ownerId:   patients[d.patIdx].ownerId,
      veterinarianId: vets[d.vetIdx].id,
      serviceId: svc.id,
      serviceType: d.type,
      status:    d.status,
      startsAt,
      duration:  svc.duration,
      roomId:    roomByName[d.room ?? "Consultorio 1"]?.id ?? rooms[0].id,
      reason:    d.reason,
      internalNotes: d.notes,
    })
  }

  const created = await Promise.all(appts.map(a => prisma.appointment.create({ data: a })))

  // Reminders aleatorios deterministas (~50%)
  const reminders: { appointmentId: string; channel: ReminderChannel; status: ReminderDeliveryStatus; sentAt: Date }[] = []
  created.forEach((a, i) => {
    if (a.status === "PROGRAMADA" || a.status === "CONFIRMADA" || a.status === "COMPLETADA") {
      reminders.push({ appointmentId: a.id, channel: ReminderChannel.WHATSAPP, status: ReminderDeliveryStatus.CONFIRMADO, sentAt: new Date(a.startsAt.getTime() - 24 * 3600 * 1000) })
      if (i % 2 === 0) reminders.push({ appointmentId: a.id, channel: ReminderChannel.EMAIL, status: ReminderDeliveryStatus.ENVIADO, sentAt: new Date(a.startsAt.getTime() - 48 * 3600 * 1000) })
    }
  })
  await prisma.appointmentReminder.createMany({ data: reminders })

  console.log(`   ✓ ${created.length} citas, ${reminders.length} recordatorios`)
  return created
}

// ═════════════════════════════════════════════════════════════
// 7. CLINICAL RECORDS (con SOAP + diagnoses + meds + procedures)
// ═════════════════════════════════════════════════════════════
async function seedClinicalRecords(
  patients: { id: string }[],
  vets: { id: string }[],
  admins: { id: string }[],
  appointments: { id: string; patientId: string; veterinarianId: string; startsAt: Date; status: string }[],
) {
  console.log("📋 Creando historiales clínicos…")
  const completed = appointments.filter(a => a.status === "COMPLETADA")

  const recordsData = completed.map((apt, i) => ({
    patientId: apt.patientId,
    veterinarianId: apt.veterinarianId,
    appointmentId: apt.id,
    createdById: admins[0].id,
    date: apt.startsAt,
    type: AttentionType.CONSULTA,
    status: i === 0 ? RecordStatus.FIRMADO : RecordStatus.FINALIZADO,
    visitReason: "Control general",
    subjective: "Paciente con apetito normal, actividad habitual. Propietario reporta conducta normal en casa.",
    objective: "FC 90 lpm, FR 24 rpm, T 38.5°C, peso estable. Mucosas rosadas, TLLC <2s. Abdomen no doloroso.",
    analysis: "Paciente clínicamente estable. Sin hallazgos patológicos al examen.",
    plan: "Continuar con manejo preventivo. Control en 6 meses o según síntomas. Reforzar plan vacunal.",
    treatment: "Sin medicación nueva.",
    nextControl: new Date(apt.startsAt.getTime() + 180 * 24 * 3600 * 1000),
    signatureHash: i === 0 ? "sha256:a7b3c4d5e6f7" : null,
    signedAt:      i === 0 ? apt.startsAt : null,
    signedById:    i === 0 ? apt.veterinarianId : null,
  }))

  const records: { id: string }[] = []
  for (const r of recordsData) {
    const rec = await prisma.clinicalRecord.create({
      data: {
        ...r,
        vitals: {
          create: { temperature: 38.5, heartRate: 90, respRate: 24, weight: 15.0, mucous: "Rosadas", hydration: "Normal" },
        },
        diagnoses: {
          create: [{ cie10: "L23.0", description: "Dermatitis alérgica por contacto" }],
        },
        medications: {
          create: [
            { name: "Betametasona 0.1% tópica", dose: "Aplicar 2 veces al día", frequency: "2x/día", duration: "10 días" },
            { name: "Cefalexina 500mg",         dose: "1 cápsula cada 12h",     frequency: "c/12h",  duration: "7 días" },
          ],
        },
        procedures: {
          create: [{ code: "EXM-01", name: "Examen físico completo" }],
        },
      },
    })
    records.push({ id: rec.id })
  }
  console.log(`   ✓ ${records.length} historiales con SOAP completo`)
  return records
}

// ═════════════════════════════════════════════════════════════
// 8. VACCINATIONS + DEWORMINGS
// ═════════════════════════════════════════════════════════════
async function seedVaccinationsAndDewormings(patients: { id: string }[], vets: { id: string }[]) {
  console.log("💉 Creando vacunas y desparasitaciones…")
  const vacs: any[] = []
  const dews: any[] = []
  patients.forEach((p, i) => {
    const vet = vets[i % vets.length]
    // 1-2 vacunas por paciente
    vacs.push({ patientId: p.id, vaccineName: "Antirrábica Nobivac", lab: "MSD Animal Health", dateApplied: daysAgo(90, 10, 30), dateDue: daysFromNow(275, 10, 30), appliedById: vet.id, lotNumber: "NR240115", status: VaccinationStatus.APLICADA })
    if (i % 2 === 0) vacs.push({ patientId: p.id, vaccineName: "Séxtuple Vanguard Plus 5", lab: "Zoetis", dateApplied: daysAgo(120, 11, 0), dateDue: daysFromNow(245, 11, 0), appliedById: vet.id, lotNumber: "VP240301", status: VaccinationStatus.APLICADA })
    if (i % 3 === 0) vacs.push({ patientId: p.id, vaccineName: "Triple Felina Fel-O-Vax", lab: "Boehringer Ingelheim", dateApplied: daysAgo(400, 10, 0), dateDue: daysAgo(35, 10, 0), appliedById: vet.id, lotNumber: "FF230815", status: VaccinationStatus.VENCIDA })

    dews.push({ patientId: p.id, product: "Bravecto 20-40kg", dose: "1 tableta", weightAtApplication: 12.5, dateApplied: daysAgo(60, 10, 0), nextDue: daysFromNow(30, 10, 0), appliedById: vet.id })
  })
  await prisma.vaccination.createMany({ data: vacs })
  await prisma.deworming.createMany({ data: dews })
  console.log(`   ✓ ${vacs.length} vacunas, ${dews.length} desparasitaciones`)
}

// ═════════════════════════════════════════════════════════════
// 9. INVENTARIO: Suppliers + Products + Lots + ProductSupplier + Movements
// ═════════════════════════════════════════════════════════════
async function seedInventory(users: { id: string }[], admins: { id: string }[]) {
  console.log("📦 Creando inventario…")
  const suppliersData = [
    { name: "Dromedario Vet S.A.S",   contact: "Andrés Muñoz",  phone: "+57 1 234 5678", email: "ventas@dromedario.com.co" },
    { name: "Veterquímica",           contact: "Sandra López",  phone: "+57 1 345 6789", email: "comercial@veterquimica.com" },
    { name: "Zoetis Colombia S.A.S",  contact: "Ricardo Fuentes", phone: "+57 1 456 7890", email: "colomventas@zoetis.com" },
    { name: "Distribuciones Farma",   contact: "Paula Herrera", phone: "+57 1 567 8901", email: "pedidos@distfarma.co" },
    { name: "Medisalud Colombia",     contact: "Jorge Patiño",  phone: "+57 1 678 9012", email: "info@medisalud.com.co" },
    { name: "Distribuidora Mascotas", contact: "Camila Torres", phone: "+57 1 789 0123", email: "comercial@distmascotas.co" },
  ]
  const suppliers = await Promise.all(suppliersData.map(s => prisma.supplier.create({ data: s })))

  const productsData = [
    { code: "VAC-001", name: "Vacuna Antirrábica Nobivac",       category: ProductCategory.VACUNAS,          brand: "MSD Animal Health",    unit: "dosis",        currentStock: 3,  minimumStock: 10, reorderQuantity: 30,  purchasePrice: 18500,  salePrice: 35000,  location: "Refrigerador A",            controlled: false, status: ProductStatus.STOCK_BAJO,   invima: "2019M-0012345", supplierIdxs: [0, 1] },
    { code: "VAC-002", name: "Vacuna Séxtuple Vanguard Plus 5", category: ProductCategory.VACUNAS,          brand: "Zoetis",               unit: "dosis",        currentStock: 22, minimumStock: 15, reorderQuantity: 40,  purchasePrice: 22000,  salePrice: 42000,  location: "Refrigerador A",            controlled: false, status: ProductStatus.ACTIVO,       invima: "2020M-0034512", supplierIdxs: [2] },
    { code: "ANT-001", name: "Bravecto Masticable 20-40 kg",     category: ProductCategory.ANTIPARASITARIOS, brand: "MSD Animal Health",    unit: "tableta",      currentStock: 2,  minimumStock: 8,  reorderQuantity: 20,  purchasePrice: 82000,  salePrice: 145000, location: "Bodega A - Estante 2",      controlled: false, status: ProductStatus.STOCK_BAJO,   invima: "2018M-0056789", supplierIdxs: [0] },
    { code: "MED-001", name: "Amoxicilina 250 mg/5 ml Susp.",    category: ProductCategory.MEDICAMENTOS,     brand: "Genfar",               unit: "frasco",       currentStock: 18, minimumStock: 10, reorderQuantity: 25,  purchasePrice: 12500,  salePrice: 22000,  location: "Bodega A - Estante 1",      controlled: false, status: ProductStatus.ACTIVO,       invima: "2017M-0078901", requiresPrescription: true, supplierIdxs: [3] },
    { code: "MED-002", name: "Meloxicam 1.5 mg/ml Iny.",         category: ProductCategory.MEDICAMENTOS,     brand: "Boehringer Ingelheim", unit: "frasco 20ml",  currentStock: 7,  minimumStock: 5,  reorderQuantity: 15,  purchasePrice: 38000,  salePrice: 68000,  location: "Refrigerador B",            controlled: false, status: ProductStatus.ACTIVO,       invima: "2019M-0091234", requiresPrescription: true, supplierIdxs: [1] },
    { code: "MED-003", name: "Tramadol Clorhidrato 50 mg",       category: ProductCategory.MEDICAMENTOS,     brand: "Laboratorios Liomont", unit: "caja x30",     currentStock: 4,  minimumStock: 5,  reorderQuantity: 10,  purchasePrice: 55000,  salePrice: 95000,  location: "Caja fuerte - Controlados", controlled: true,  status: ProductStatus.STOCK_BAJO,   invima: "2016M-0045678", requiresPrescription: true, supplierIdxs: [3] },
    { code: "CON-001", name: "Suero Fisiológico NaCl 0.9% 250ml", category: ProductCategory.CONSUMIBLES,     brand: "Baxter",               unit: "bolsa",        currentStock: 0,  minimumStock: 15, reorderQuantity: 50,  purchasePrice: 8500,   salePrice: 16000,  location: "Bodega B - Estante 1",      controlled: false, status: ProductStatus.AGOTADO,      invima: "2015M-0023456", supplierIdxs: [4] },
    { code: "CON-002", name: "Jeringa Desechable 5ml c/aguja",   category: ProductCategory.CONSUMIBLES,     brand: "BD Plastipak",         unit: "caja x100",    currentStock: 15, minimumStock: 50, reorderQuantity: 100, purchasePrice: 28000,  salePrice: 45000,  location: "Bodega A - Estante 3",      controlled: false, status: ProductStatus.STOCK_BAJO,   supplierIdxs: [4] },
    { code: "ANT-002", name: "Frontline Spray 250ml",            category: ProductCategory.ANTIPARASITARIOS, brand: "Boehringer Ingelheim", unit: "frasco",       currentStock: 9,  minimumStock: 5,  reorderQuantity: 12,  purchasePrice: 45000,  salePrice: 79000,  location: "Bodega A - Estante 2",      controlled: false, status: ProductStatus.ACTIVO,       invima: "2018M-0067890", supplierIdxs: [1] },
    { code: "MED-004", name: "Dexametasona 4mg/ml Iny.",         category: ProductCategory.MEDICAMENTOS,     brand: "Pfizer Animal Health", unit: "frasco 10ml",  currentStock: 11, minimumStock: 6,  reorderQuantity: 18,  purchasePrice: 24000,  salePrice: 42000,  location: "Refrigerador B",            controlled: false, status: ProductStatus.ACTIVO,       invima: "2017M-0089012", requiresPrescription: true, supplierIdxs: [0] },
    { code: "CON-003", name: "Guantes de Látex Talla M",         category: ProductCategory.CONSUMIBLES,     brand: "Ansell",               unit: "caja x100",    currentStock: 6,  minimumStock: 4,  reorderQuantity: 10,  purchasePrice: 35000,  salePrice: 58000,  location: "Bodega A - Estante 3",      controlled: false, status: ProductStatus.ACTIVO,       supplierIdxs: [4] },
    { code: "ALI-001", name: "Hill's Prescription Diet k/d 4kg", category: ProductCategory.ALIMENTOS,        brand: "Hill's Pet Nutrition", unit: "bolsa",        currentStock: 5,  minimumStock: 3,  reorderQuantity: 10,  purchasePrice: 98000,  salePrice: 168000, location: "Bodega B - Estante 2",      controlled: false, status: ProductStatus.ACTIVO,       supplierIdxs: [5] },
  ]

  const products: { id: string; code: string; currentStock: number }[] = []
  for (const p of productsData) {
    const { supplierIdxs, ...prodData } = p
    const prod = await prisma.product.create({
      data: {
        ...prodData,
        requiresPrescription: prodData.requiresPrescription ?? false,
        suppliers: {
          create: supplierIdxs.map((idx, i) => ({
            supplierId: suppliers[idx].id,
            unitPrice: prodData.purchasePrice + (i === 0 ? 0 : 500),
            lastPurchaseDate: daysAgo(30 + i * 10),
          })),
        },
        lots: prodData.currentStock > 0 ? {
          create: [{
            lotNumber: `${prodData.code}-L${Math.floor(Math.random() * 1000)}`,
            quantity: prodData.currentStock,
            expiryDate: daysFromNow(180 + Math.floor(Math.random() * 360)),
            purchaseDate: daysAgo(30),
            supplierId: suppliers[supplierIdxs[0]].id,
          }],
        } : undefined,
      },
    })
    products.push({ id: prod.id, code: prod.code, currentStock: prod.currentStock })
  }

  // Movements
  const movs: any[] = []
  for (const p of products) {
    const admin = admins[0].id
    const vet   = users[0].id
    // Compra inicial
    movs.push({ productId: p.id, type: MovementType.ENTRADA, reason: MovementReason.COMPRA, quantity: p.currentStock + 20, stockBefore: 0, stockAfter: p.currentStock + 20, performedById: admin, createdAt: daysAgo(60) })
    // Algunas salidas
    movs.push({ productId: p.id, type: MovementType.SALIDA, reason: MovementReason.CITA, quantity: 5, stockBefore: p.currentStock + 20, stockAfter: p.currentStock + 15, reference: "CIT-00198", performedById: vet, createdAt: daysAgo(45) })
    movs.push({ productId: p.id, type: MovementType.SALIDA, reason: MovementReason.VENTA_DIRECTA, quantity: 15 - p.currentStock, stockBefore: p.currentStock + 15, stockAfter: p.currentStock, performedById: admin, createdAt: daysAgo(20) })
  }
  await prisma.stockMovement.createMany({ data: movs.filter(m => m.quantity > 0) })

  console.log(`   ✓ ${suppliers.length} proveedores, ${products.length} productos, ${movs.filter(m => m.quantity > 0).length} movimientos`)
}

// ═════════════════════════════════════════════════════════════
// 10. AUDIT LOG
// ═════════════════════════════════════════════════════════════
async function seedAuditLog(users: { id: string; role: Role; name: string }[]) {
  console.log("📜 Creando audit log…")
  const admin = users.find(u => u.role === "ADMIN")!
  const vet   = users.find(u => u.role === "VETERINARIO")!
  const recep = users.find(u => u.role === "RECEPCIONISTA")!

  const entries = [
    { userId: admin.id, actionType: AuditActionType.LOGIN,  module: "Sistema",           description: "Inicio de sesión exitoso",                          ip: "192.168.1.10", device: "Firefox / macOS",    createdAt: daysAgo(0, 8, 0) },
    { userId: vet.id,   actionType: AuditActionType.CREATE, module: "Historial Clínico", description: "Creó historial clínico para Max (Golden Retriever)", ip: "192.168.1.21", device: "Chrome / Windows",   createdAt: daysAgo(0, 9, 20) },
    { userId: recep.id, actionType: AuditActionType.CREATE, module: "Citas",             description: "Registró nueva cita para Luna — Dra. Jara",           ip: "192.168.1.41", device: "Chrome / Windows",   createdAt: daysAgo(0, 8, 10) },
    { userId: vet.id,   actionType: AuditActionType.UPDATE, module: "Historial Clínico", description: "Editó historial quirúrgico de Rocky",                 ip: "192.168.1.21", device: "Chrome / Windows",   createdAt: daysAgo(0, 10, 45) },
    { userId: admin.id, actionType: AuditActionType.EXPORT, module: "Reportes",          description: "Exportó informe de atenciones Mar-Abr 2026",         ip: "192.168.1.10", device: "Firefox / macOS",    createdAt: daysAgo(1, 11, 30) },
    { userId: vet.id,   actionType: AuditActionType.SIGN,   module: "Historial Clínico", description: "Firmó historial quirúrgico Rocky (CIR-00041)",         ip: "192.168.1.21", device: "Chrome / Windows",   createdAt: daysAgo(1, 13, 0) },
    { userId: recep.id, actionType: AuditActionType.UPDATE, module: "Citas",             description: "Canceló cita de Bella (solicitud del propietario)",   ip: "192.168.1.41", device: "Chrome / Android",   createdAt: daysAgo(1, 10, 0) },
    { userId: admin.id, actionType: AuditActionType.CREATE, module: "Usuarios",          description: "Creó cuenta de usuario para Valentina Castro",         ip: "192.168.1.10", device: "Firefox / macOS",    createdAt: daysAgo(14, 9, 0) },
    { userId: vet.id,   actionType: AuditActionType.VIEW,   module: "Reportes",          description: "Consultó reporte de diagnósticos de abril",            ip: "192.168.1.21", device: "Chrome / Windows",   createdAt: daysAgo(2, 14, 35) },
    { userId: admin.id, actionType: AuditActionType.LOGIN,  module: "Sistema",           description: "Inicio de sesión exitoso",                             ip: "192.168.1.10", device: "Firefox / macOS",    createdAt: daysAgo(1, 8, 15) },
    { userId: vet.id,   actionType: AuditActionType.UPDATE, module: "Pacientes",         description: "Actualizó peso y vacunas de Bella",                    ip: "192.168.1.21", device: "Chrome / Windows",   createdAt: daysAgo(2, 9, 0) },
    { userId: admin.id, actionType: AuditActionType.DELETE, module: "Usuarios",          description: "Eliminó usuario inactivo (cuenta de prueba)",          ip: "192.168.1.10", device: "Firefox / macOS",    createdAt: daysAgo(7, 11, 0) },
  ]
  await prisma.auditLog.createMany({ data: entries })
  console.log(`   ✓ ${entries.length} entradas de audit log`)
}

// ═════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════
async function main() {
  console.log("🌱 VetSmart — seed iniciando…\n")
  await reset()
  await seedClinic()
  const users = await seedUsers()
  await seedDiagnoses()
  const { patients } = await seedOwnersAndPatients(users.vets)
  const services = await seedServices(users.vets)

  // Obtener rooms de la clínica para appointments
  const rooms = await prisma.room.findMany()

  const appointments = await seedAppointments(patients, users.vets, services, rooms)
  await seedClinicalRecords(patients, users.vets, users.admins, appointments)
  await seedVaccinationsAndDewormings(patients, users.vets)
  await seedInventory([...users.vets, ...users.receps], users.admins)
  await seedAuditLog([...users.admins, ...users.vets, ...users.receps])

  // ─── Clinic config ──────────────────────────────────────────
  const clinicConfigs: Array<{ key: string; value: any }> = [
    { key: "clinic_info", value: {
      legalName: "SERMEC Veterinaria S.A.S.", tradeName: "SERMEC", nit: "901.234.567-8",
      taxRegime: "Régimen ordinario", slogan: "Cuidamos a quienes más quieres",
      website: "https://www.sermec.com.co", phone: "608-555-0100", whatsapp: "+57 310-555-0100",
      emailGeneral: "info@sermec.com.co", emailSupport: "soporte@sermec.com.co", emailBilling: "facturacion@sermec.com.co",
      instagram: "https://instagram.com/sermec_vet", facebook: "https://facebook.com/sermecveterinaria",
      country: "Colombia", department: "Meta", city: "Villavicencio", address: "Cra. 30 #42-15",
      postalCode: "500001", foundingYear: 2014, employees: 18, clinicType: "General",
      species: ["Caninos", "Felinos", "Aves", "Exóticos"],
    }},
    { key: "schedule", value: {
      Lunes: { isOpen: true, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }], maxPerHour: 4 },
      Martes: { isOpen: true, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }], maxPerHour: 4 },
      Miércoles: { isOpen: true, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }], maxPerHour: 4 },
      Jueves: { isOpen: true, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }], maxPerHour: 4 },
      Viernes: { isOpen: true, shifts: [{ start: "07:00", end: "12:00" }, { start: "14:00", end: "18:00" }], maxPerHour: 4 },
      Sábado: { isOpen: true, shifts: [{ start: "08:00", end: "13:00" }], maxPerHour: 3 },
      Domingo: { isOpen: false, shifts: [], maxPerHour: 0 },
    }},
  ]

  for (const cfg of clinicConfigs) {
    await prisma.clinicConfig.create({
      data: { key: cfg.key, value: JSON.stringify(cfg.value) },
    })
  }

  console.log("\n✅ Seed completado.")
  console.log(`\n🔑 Credenciales iniciales:`)
  console.log(`   admin@vetsmart.co / ${PASSWORD}`)
  console.log(`   carlos.poris@vetsmart.co / ${PASSWORD}`)
  console.log(`   marly.jara@sermec.com / ${PASSWORD}`)
  console.log(`   sandra.gutierrez@sermec.com / ${PASSWORD}`)
}

main()
  .catch(e => { console.error("❌ Seed error:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
