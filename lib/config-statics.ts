export type ServiceCategory = "Consulta" | "Vacunación" | "Cirugía" | "Estética" | "Diagnóstico" | "Hospitalización"
export type ServiceStatus  = "Activo" | "Inactivo"

export interface ClinicService {
  id: string; code: string; name: string
  category: ServiceCategory; duration: number; price: number
  vets: Array<{ initials: string; color: string }>
  status: ServiceStatus; description: string
}

export interface DayShift  { start: string; end: string }
export interface DaySchedule { isOpen: boolean; shifts: DayShift[]; maxPerHour: number }

export interface ReminderTemplate {
  id: string; name: string; description: string
  channels: { whatsapp: boolean; email: boolean; sms: boolean }
  timing: string; subject: string; body: string
}

const V = {
  MJ: { initials:"MJ", color:"#3B82F6" },
  CM: { initials:"CM", color:"#10B981" },
  AR: { initials:"AR", color:"#F59E0B" },
  LP: { initials:"LP", color:"#8B5CF6" },
}

export const clinicServices: ClinicService[] = [
  { id:"s1",  code:"CON-001", name:"Consulta general",              category:"Consulta",       duration:30,   price:85_000,     vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Revisión general del estado de salud del paciente." },
  { id:"s2",  code:"CON-002", name:"Consulta de urgencia",          category:"Consulta",       duration:45,   price:150_000,    vets:[V.MJ,V.CM],           status:"Activo",   description:"Atención prioritaria para casos urgentes." },
  { id:"s3",  code:"CON-003", name:"Control post-consulta",         category:"Consulta",       duration:20,   price:45_000,     vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Seguimiento de tratamiento en curso." },
  { id:"s4",  code:"VAC-001", name:"Vacuna múltiple DA2PPL",        category:"Vacunación",     duration:20,   price:120_000,    vets:[V.MJ,V.AR],           status:"Activo",   description:"Vacuna combinada contra distemper, hepatitis, parvovirus y leptospirosis." },
  { id:"s5",  code:"VAC-002", name:"Vacuna antirrábica",            category:"Vacunación",     duration:15,   price:80_000,     vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Vacuna contra la rabia, aplicación obligatoria anual." },
  { id:"s6",  code:"VAC-003", name:"Vacuna triple felina",          category:"Vacunación",     duration:15,   price:100_000,    vets:[V.MJ,V.AR],           status:"Activo",   description:"Protección contra rinotraqueitis, calicivirus y panleucopenia." },
  { id:"s7",  code:"PAR-001", name:"Desparasitación interna",       category:"Diagnóstico",    duration:15,   price:65_000,     vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Tratamiento antiparasitario interno oral." },
  { id:"s8",  code:"PAR-002", name:"Desparasitación externa",       category:"Diagnóstico",    duration:20,   price:75_000,     vets:[V.MJ,V.AR],           status:"Activo",   description:"Aplicación tópica contra pulgas y garrapatas." },
  { id:"s9",  code:"EXA-001", name:"Examen físico completo",        category:"Consulta",       duration:40,   price:95_000,     vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Examen clínico exhaustivo con reporte escrito." },
  { id:"s10", code:"LAB-001", name:"Hemograma completo",            category:"Diagnóstico",    duration:30,   price:180_000,    vets:[V.MJ,V.AR],           status:"Activo",   description:"Análisis de sangre completo con recuento celular." },
  { id:"s11", code:"LAB-002", name:"Bioquímica sanguínea",          category:"Diagnóstico",    duration:30,   price:220_000,    vets:[V.MJ,V.LP],           status:"Activo",   description:"Panel bioquímico hepático, renal y pancreático." },
  { id:"s12", code:"DIA-001", name:"Ecografía abdominal",           category:"Diagnóstico",    duration:45,   price:280_000,    vets:[V.CM,V.LP],           status:"Activo",   description:"Ultrasonido de órganos abdominales." },
  { id:"s13", code:"DIA-002", name:"Radiografía (1 placa)",         category:"Diagnóstico",    duration:30,   price:220_000,    vets:[V.CM,V.LP],           status:"Activo",   description:"Imagen diagnóstica de una proyección." },
  { id:"s14", code:"DIA-003", name:"Electrocardiograma",            category:"Diagnóstico",    duration:30,   price:250_000,    vets:[V.LP],                status:"Activo",   description:"Evaluación de actividad eléctrica cardíaca." },
  { id:"s15", code:"DIA-004", name:"Citología auricular",           category:"Diagnóstico",    duration:20,   price:120_000,    vets:[V.AR,V.LP],           status:"Activo",   description:"Toma y análisis de muestra del conducto auricular." },
  { id:"s16", code:"CIR-001", name:"Esterilización OVH (hembra)",   category:"Cirugía",        duration:90,   price:850_000,    vets:[V.CM],                status:"Activo",   description:"Ovariohisterectomía electiva bajo anestesia general." },
  { id:"s17", code:"CIR-002", name:"Esterilización (macho)",        category:"Cirugía",        duration:60,   price:650_000,    vets:[V.CM],                status:"Activo",   description:"Orquiectomía electiva bajo anestesia general." },
  { id:"s18", code:"CIR-003", name:"Cirugía ortopédica",            category:"Cirugía",        duration:180,  price:2_500_000,  vets:[V.CM],                status:"Activo",   description:"Procedimientos óseos y articulares complejos." },
  { id:"s19", code:"DEN-001", name:"Limpieza dental ultrasónica",   category:"Diagnóstico",    duration:60,   price:380_000,    vets:[V.CM,V.AR],           status:"Activo",   description:"Detartraje y pulido dental bajo sedación." },
  { id:"s20", code:"HOS-001", name:"Hospitalización por día",       category:"Hospitalización", duration:1440, price:280_000,    vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Internación con monitoreo y tratamiento continuo." },
  { id:"s21", code:"EST-001", name:"Baño medicado",                 category:"Estética",       duration:60,   price:90_000,     vets:[V.AR],                status:"Activo",   description:"Baño terapéutico con champú según condición dermatológica." },
  { id:"s22", code:"EST-002", name:"Corte de pelo (raza)",          category:"Estética",       duration:90,   price:130_000,    vets:[V.AR],                status:"Activo",   description:"Grooming completo según estándar de raza." },
  { id:"s23", code:"PRE-001", name:"Microchipado",                  category:"Consulta",       duration:15,   price:95_000,     vets:[V.MJ,V.CM,V.AR,V.LP], status:"Activo",   description:"Implantación de microchip ISO 11784/11785." },
  { id:"s24", code:"EUT-001", name:"Eutanasia humanitaria",         category:"Consulta",       duration:45,   price:350_000,    vets:[V.MJ,V.CM],           status:"Inactivo", description:"Procedimiento de eutanasia asistida con protocolo de bienestar." },
]

export const categoryColors: Record<ServiceCategory, { bg: string; text: string }> = {
  "Consulta":       { bg:"bg-blue-50",   text:"text-blue-700" },
  "Vacunación":     { bg:"bg-emerald-50",text:"text-emerald-700" },
  "Cirugía":        { bg:"bg-red-50",    text:"text-red-700" },
  "Estética":       { bg:"bg-pink-50",   text:"text-pink-700" },
  "Diagnóstico":    { bg:"bg-violet-50", text:"text-violet-700" },
  "Hospitalización":{ bg:"bg-amber-50",  text:"text-amber-700" },
}

export const SERVICE_CATEGORIES: ServiceCategory[] = ["Consulta","Vacunación","Cirugía","Estética","Diagnóstico","Hospitalización"]

export const reminderTemplates: ReminderTemplate[] = [
  {
    id:"rt1", name:"Recordatorio de cita — 24h antes",
    description:"Se envía automáticamente 24 horas antes de cada cita programada.",
    channels:{whatsapp:true,email:true,sms:false},
    timing:"24 horas antes",
    subject:"Recordatorio: tu cita en SERMEC mañana",
    body:`Hola {nombre_dueño} 👋\n\nTe recordamos que mañana tienes una cita en SERMEC Veterinaria para {nombre_paciente}.\n\n📅 Fecha: {fecha_cita}\n🕐 Hora: {hora_cita}\n👨‍⚕️ Veterinario: {veterinario}\n🏥 Servicio: {servicio}\n\n📍 Nos encontramos en Cra. 30 #42-15, Villavicencio.\n\nSi necesitas reagendar, escríbenos con al menos 4 horas de anticipación.\n\n¡Hasta mañana! 🐾`,
  },
  {
    id:"rt2", name:"Confirmación de cita agendada",
    description:"Se envía inmediatamente cuando se registra una nueva cita.",
    channels:{whatsapp:true,email:true,sms:true},
    timing:"Inmediatamente al agendar",
    subject:"Cita confirmada en SERMEC Veterinaria",
    body:`Hola {nombre_dueño},\n\nTu cita ha sido confirmada exitosamente. 🎉\n\n📋 Detalles:\n• Paciente: {nombre_paciente}\n• Fecha: {fecha_cita}\n• Hora: {hora_cita}\n• Veterinario: {veterinario}\n• Servicio: {servicio}\n\nRecuerda llegar 10 minutos antes. ¡Te esperamos!`,
  },
  {
    id:"rt3", name:"Recordatorio de vacuna próxima a vencer",
    description:"Se envía 7 días antes del vencimiento de la próxima vacuna.",
    channels:{whatsapp:true,email:false,sms:false},
    timing:"7 días antes del vencimiento",
    subject:"",
    body:`Hola {nombre_dueño},\n\nLa vacuna de {nombre_vacuna} de {nombre_paciente} vence el {fecha_vencimiento}.\n\n¡Es hora de agendar el refuerzo! Escríbenos para programar la cita. 💉🐾`,
  },
  {
    id:"rt4", name:"Recordatorio de desparasitación",
    description:"Recordatorio trimestral de desparasitación interna y externa.",
    channels:{whatsapp:true,email:false,sms:false},
    timing:"Cada 3 meses",
    subject:"",
    body:`Hola {nombre_dueño},\n\nHan pasado 3 meses desde la última desparasitación de {nombre_paciente}. 🐛\n\nTe recomendamos agendar el próximo tratamiento preventivo para mantener a {nombre_paciente} protegido/a.\n\n¡Escríbenos para coordinar! 🐾`,
  },
  {
    id:"rt5", name:"Post-consulta: indicaciones de cuidado",
    description:"Resumen de indicaciones enviado tras cada consulta.",
    channels:{whatsapp:false,email:true,sms:false},
    timing:"1 hora después de la consulta",
    subject:"Indicaciones de cuidado para {nombre_paciente} — SERMEC",
    body:`Hola {nombre_dueño},\n\nA continuación un resumen de las indicaciones del {veterinario} tras la consulta de hoy:\n\n📋 Diagnóstico: {diagnostico}\n💊 Tratamiento: {tratamiento}\n📅 Próximo control: {fecha_control}\n\nAnte cualquier duda no dudes en contactarnos.\n\nSERMEC Veterinaria — {telefono_clinica}`,
  },
  {
    id:"rt6", name:"Recordatorio control post-cirugía",
    description:"Recordatorio de control a los 7 días de una cirugía.",
    channels:{whatsapp:true,email:true,sms:false},
    timing:"7 días después de cirugía",
    subject:"Control post-operatorio de {nombre_paciente}",
    body:`Hola {nombre_dueño},\n\nHan pasado 7 días desde la cirugía de {nombre_paciente}. 🏥\n\nEs el momento del control post-operatorio. Por favor agenda tu cita para revisión de la herida y evolución.\n\nLlámanos al {telefono_clinica} o escríbenos por WhatsApp. 🐾`,
  },
  {
    id:"rt7", name:"Felicitación de cumpleaños",
    description:"Mensaje de cumpleaños enviado el día de nacimiento del paciente.",
    channels:{whatsapp:true,email:false,sms:false},
    timing:"El día del cumpleaños",
    subject:"",
    body:`¡Hola {nombre_dueño}! 🎂🐾\n\nHoy es un día especial — ¡{nombre_paciente} cumple {edad} años!\n\nEn SERMEC queremos unirnos al festejo. Esperamos que {nombre_paciente} pase un día lleno de mimos y juegos.\n\n¡Muchas felicidades! 🎉`,
  },
  {
    id:"rt8", name:"Reactivación de paciente inactivo",
    description:"Se envía a propietarios sin visitas en más de 6 meses.",
    channels:{whatsapp:true,email:true,sms:false},
    timing:"A los 6 meses sin visita",
    subject:"¡Te echamos de menos en SERMEC!",
    body:`Hola {nombre_dueño},\n\nHa pasado un tiempo desde la última visita de {nombre_paciente} y queremos saber cómo está. 🐾\n\nRecuerda que los controles preventivos regulares son clave para la salud de tu mascota.\n\n¡Agenda tu próxima cita y obtén un 10% de descuento en consulta general! 🎁`,
  },
]
