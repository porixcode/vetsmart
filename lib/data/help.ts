export interface HelpCategory {
  id: string
  name: string
  icon: string
  description: string
  articleCount: number
  color: string
}

export interface HelpArticle {
  slug: string
  title: string
  category: string
  categoryId: string
  lastUpdated: string
  readTime: number
  author: string
  views: number
  sections: ArticleSection[]
  related: string[]
}

export interface ArticleSection {
  id: string
  title: string
  content: ArticleBlock[]
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "tip"; text: string }
  | { type: "warning"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "image"; alt: string; caption: string }
  | { type: "code"; lang: string; text: string }

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "primeros-pasos",
    name: "Primeros pasos",
    icon: "Rocket",
    description: "Configuración inicial, primer login, recorrido por la interfaz.",
    articleCount: 8,
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "pacientes",
    name: "Gestión de pacientes",
    icon: "PawPrint",
    description: "Registrar, editar, archivar e importar pacientes y propietarios.",
    articleCount: 12,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "citas",
    name: "Citas y agenda",
    icon: "CalendarDays",
    description: "Agendar, reagendar, recordatorios automáticos y resolución de conflictos.",
    articleCount: 10,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "historial",
    name: "Historial clínico",
    icon: "FileText",
    description: "Crear registros SOAP, plantillas, firmas digitales y adjuntos.",
    articleCount: 15,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "inventario",
    name: "Inventario",
    icon: "Package",
    description: "Movimientos de stock, alertas de mínimo, proveedores y vencimientos.",
    articleCount: 9,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    id: "reportes",
    name: "Reportes y analytics",
    icon: "BarChart2",
    description: "Generar, programar, exportar e interpretar reportes del sistema.",
    articleCount: 7,
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
]

export const POPULAR_ARTICLES: Pick<HelpArticle, "slug" | "title" | "category" | "categoryId" | "lastUpdated" | "readTime">[] = [
  { slug: "crear-primera-cita",       title: "Cómo agendar tu primera cita en VetSmart",             category: "Citas y agenda",        categoryId: "citas",           lastUpdated: "12 abr 2026", readTime: 3 },
  { slug: "plantillas-recordatorio",  title: "Configurar plantillas de recordatorios por WhatsApp",  category: "Primeros pasos",        categoryId: "primeros-pasos",  lastUpdated: "8 abr 2026",  readTime: 4 },
  { slug: "resetear-contrasena",      title: "Resetear la contraseña de un usuario",                 category: "Primeros pasos",        categoryId: "primeros-pasos",  lastUpdated: "15 abr 2026", readTime: 2 },
  { slug: "reporte-mensual",          title: "Generar reporte mensual de atenciones",                category: "Reportes y analytics",  categoryId: "reportes",        lastUpdated: "10 abr 2026", readTime: 3 },
  { slug: "importar-pacientes",       title: "Importar pacientes desde Excel",                       category: "Gestión de pacientes",  categoryId: "pacientes",       lastUpdated: "5 abr 2026",  readTime: 5 },
  { slug: "alertas-stock",            title: "Configurar alertas de stock crítico",                  category: "Inventario",            categoryId: "inventario",      lastUpdated: "3 abr 2026",  readTime: 3 },
  { slug: "firma-digital-historial",  title: "Firmar digitalmente un historial clínico",             category: "Historial clínico",     categoryId: "historial",       lastUpdated: "18 abr 2026", readTime: 4 },
  { slug: "horarios-partidos",        title: "Crear horarios partidos en la agenda",                 category: "Citas y agenda",        categoryId: "citas",           lastUpdated: "1 abr 2026",  readTime: 3 },
  { slug: "exportar-historial",       title: "Exportar historial completo de un paciente",           category: "Historial clínico",     categoryId: "historial",       lastUpdated: "20 abr 2026", readTime: 2 },
  { slug: "conectar-whatsapp",        title: "Conectar WhatsApp Business para recordatorios",        category: "Primeros pasos",        categoryId: "primeros-pasos",  lastUpdated: "14 abr 2026", readTime: 6 },
]

export const ARTICLES: Record<string, HelpArticle> = {
  "crear-primera-cita": {
    slug: "crear-primera-cita",
    title: "Cómo agendar tu primera cita en VetSmart",
    category: "Citas y agenda",
    categoryId: "citas",
    lastUpdated: "12 de abril de 2026",
    readTime: 3,
    author: "Equipo VetSmart",
    views: 1842,
    related: ["plantillas-recordatorio", "horarios-partidos", "conectar-whatsapp"],
    sections: [
      {
        id: "introduccion",
        title: "Introducción",
        content: [
          {
            type: "paragraph",
            text: "Agendar una cita en VetSmart toma menos de 60 segundos una vez que conoces el flujo. El módulo de Citas está diseñado para minimizar la fricción del recepcionista y garantizar que el propietario reciba una confirmación automática por WhatsApp o correo electrónico.",
          },
          {
            type: "tip",
            text: "Antes de agendar, asegúrate de que el paciente y el propietario ya estén registrados en el sistema. Si no lo están, puedes crearlos directamente desde el formulario de nueva cita.",
          },
        ],
      },
      {
        id: "acceder-modulo",
        title: "Paso 1 — Acceder al módulo de Citas",
        content: [
          {
            type: "paragraph",
            text: "En el menú lateral izquierdo, haz clic en \"Citas\". Se abrirá la vista de agenda, que por defecto muestra la semana actual. Puedes cambiar entre vistas: Día, Semana, Mes o Lista usando los botones en la esquina superior derecha.",
          },
          {
            type: "image",
            alt: "Vista semanal del módulo de citas",
            caption: "Vista semanal del módulo de Citas. Los bloques de colores representan citas activas por veterinario.",
          },
        ],
      },
      {
        id: "nueva-cita",
        title: "Paso 2 — Crear la nueva cita",
        content: [
          {
            type: "paragraph",
            text: "Tienes dos formas de iniciar una nueva cita:",
          },
          {
            type: "steps",
            items: [
              "Haz clic en el botón azul \"Nueva cita\" (esquina superior derecha de la pantalla).",
              "O haz clic directamente en un bloque horario vacío en la vista de semana o día — el formulario se abrirá prellenado con esa hora.",
            ],
          },
          {
            type: "paragraph",
            text: "Se desplegará un panel lateral (drawer) con el formulario de nueva cita.",
          },
        ],
      },
      {
        id: "completar-formulario",
        title: "Paso 3 — Completar el formulario",
        content: [
          {
            type: "paragraph",
            text: "El formulario de cita tiene los siguientes campos obligatorios:",
          },
          {
            type: "steps",
            items: [
              "Paciente: busca por nombre del paciente o del propietario. Si el paciente no existe, el campo tiene un link \"Crear paciente\" que abre un mini-formulario.",
              "Veterinario: selecciona el veterinario responsable. El sistema mostrará solo los veterinarios disponibles en el horario seleccionado.",
              "Servicio: elige el tipo de servicio (consulta general, vacunación, cirugía, etc.). Esto determina la duración estimada de la cita.",
              "Fecha y hora: selecciona con el date picker. Los bloques ocupados se muestran en gris.",
              "Sala (opcional): si la clínica tiene múltiples consultorios, puedes asignar uno.",
            ],
          },
          {
            type: "tip",
            text: "El campo \"Motivo de consulta\" es opcional pero muy recomendado — ayuda al veterinario a prepararse antes de la cita y aparece en la vista de agenda.",
          },
          {
            type: "warning",
            text: "Si el veterinario seleccionado ya tiene una cita en ese horario, verás una alerta de conflicto. El sistema NO bloqueará el guardado, pero sí te avisará para que puedas reasignar.",
          },
        ],
      },
      {
        id: "confirmacion",
        title: "Paso 4 — Confirmar y guardar",
        content: [
          {
            type: "paragraph",
            text: "Una vez completados los campos obligatorios, el botón \"Guardar cita\" se habilitará. Al hacer clic:",
          },
          {
            type: "steps",
            items: [
              "La cita aparece inmediatamente en la agenda con el color del veterinario asignado.",
              "El sistema genera automáticamente un recordatorio para 24 horas antes (configurable en Configuración → Plantillas de recordatorios).",
              "El propietario recibe una confirmación por WhatsApp y/o email, según los canales configurados.",
            ],
          },
          {
            type: "image",
            alt: "Confirmación de cita agendada",
            caption: "Notificación de éxito al guardar la cita. La cita aparece en la agenda con indicador de color del veterinario.",
          },
        ],
      },
      {
        id: "editar-cancelar",
        title: "Editar o cancelar una cita",
        content: [
          {
            type: "paragraph",
            text: "Para modificar una cita existente, haz clic sobre el bloque en la agenda o encuéntrala en la vista Lista y usa el menú de tres puntos (⋯). Las opciones disponibles son:",
          },
          {
            type: "steps",
            items: [
              "Editar — abre el mismo formulario con los datos actuales.",
              "Reagendar — mueve la cita a un nuevo horario manteniendo el resto de datos.",
              "Marcar como completada — cierra la cita y abre el historial clínico.",
              "Cancelar — pide un motivo de cancelación y puede enviar notificación al propietario.",
            ],
          },
          {
            type: "warning",
            text: "Las citas canceladas no se eliminan del sistema — quedan registradas con estado \"Cancelada\" y son visibles en el historial del paciente.",
          },
        ],
      },
    ],
  },
}
