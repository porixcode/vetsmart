# VetSmart

Sistema de gestión veterinaria para **SERMEC Veterinaria**. Proyecto académico — Politécnico Grancolombiano, Gerencia de Proyectos Informáticos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| UI | Tailwind v4, shadcn/ui, lucide-react, Recharts |
| Backend | Server Actions, API Routes |
| ORM | Prisma 6 |
| BD | PostgreSQL 16 |
| Auth | Auth.js v5 (NextAuth), Credentials Provider, bcryptjs |
| Validación | Zod |
| Proxy/SSL | Caddy 2 (HTTPS automático, Let's Encrypt) |
| Infra | Docker Compose (app + postgres + caddy) |

## Setup desarrollo

```bash
# Requisitos: Node 22+, bun, Docker

git clone <repo>
cd vetsmart

# 1. Variables de entorno
cp .env.example .env
# Editar .env: NEXTAUTH_SECRET, CRON_SECRET (openssl rand -base64 32)

# 2. Instalar dependencias
bun install

# 3. Iniciar PostgreSQL
bun run dev:db

# 4. Migraciones + seed
bun run db:migrate
bun run db:seed

# 5. Iniciar dev server
bun dev
```

## Setup producción (VPS con Docker)

### 1. Clonar y configurar

```bash
git clone <repo>
cd vetsmart
cp .env.example .env
# Editar .env con valores de producción:
#   POSTGRES_PASSWORD  → contraseña segura
#   NEXTAUTH_URL       → https://tu-dominio.com
#   NEXTAUTH_SECRET    → $(openssl rand -base64 32)
#   CRON_SECRET        → $(openssl rand -base64 32)
```

### 2. Desplegar

```bash
# Agregar swap (recomendado para VPS con ≤2GB RAM)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile

# Construir y levantar todo
docker compose up -d --build

# Migraciones y seed
bunx prisma migrate deploy
bun prisma/seed.ts    # solo primera vez, idempotente
```

### 3. Arquitectura del despliegue

```
Usuario → puerto 80/443 → Caddy (HTTPS automático) → app:3000 (red interna Docker)
```

Caddy obtiene el certificado SSL de Let's Encrypt automáticamente. No requiere instalar nada en el host más que Docker.

### 4. Actualizar

```bash
git pull
docker compose up -d --build app
bunx prisma migrate deploy    # si hay migraciones nuevas
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_USER` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `POSTGRES_DB` | Nombre de la base de datos |
| `DATABASE_URL` | Conexión local (host: `localhost`). Compose la sobrescribe internamente con host `postgres` |
| `NEXTAUTH_SECRET` | Secreto para JWT (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL pública de la app (ej. `https://vetsmart.porix.cloud`) |
| `AUTH_TRUST_HOST` | `true` para despliegues auto-gestionados |
| `CRON_SECRET` | Secreto para proteger `/api/cron/notifications` |
| `APP_HOST_PORT` | Puerto que expone la app al host (por defecto `3000`) |
| `TZ` | Zona horaria (ej. `America/Bogota`) |

## Credenciales demo (seed)

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@vetsmart.co | Vetsmart2026! |
| Veterinario | marly.jara@sermec.com | Vetsmart2026! |
| Recepcionista | sandra.gutierrez@sermec.com | Vetsmart2026! |

## Mapeo RF → Implementación

| RF | Módulo | Server Actions | Estado |
|----|--------|---------------|--------|
| RF1 Gestión pacientes | Pacientes | `createPatient`, `updatePatient`, `archivePatient`, `bulkArchivePatients` | ✅ |
| RF2 Control citas | Citas | CRUD citas + detección conflictos horarios | ✅ |
| RF3 Historial médico | Historial Clínico | `createClinicalRecord`, `anularClinicalRecord`, SOAP + adjuntos | ✅ |
| RF4 Control inventario | Inventario | `createProduct`, `updateProduct`, `registerStockMovement` | ✅ |
| RF5 Reportes | Reportes | Queries agregadas, export CSV/PDF | ✅ |
| RF6 Gestión usuarios | Usuarios | `createUser`, `updateUser`, `updateUserStatus`, `resetPassword` | ✅ |
| RF7 Búsqueda avanzada | Todos los módulos | Filtros multi-criterio con búsqueda textual | ✅ |
| RF8 Notificaciones | Cron | `/api/cron/notifications` — citas 24h, vacunas 7d, stock crítico | ✅ |

## Decisiones de arquitectura

- **Server Actions sobre API Routes**: Las mutaciones usan Server Actions (zod + `requireRole` + AuditLog + `revalidatePath`). API routes solo para file uploads, cron y healthcheck.
- **RSC por defecto**: Las páginas son React Server Components asíncronos. Client Components solo para interactividad (formularios, modales, charts).
- **Separación auth**: `auth.config.ts` (edge-safe, middleware) vs `auth.ts` (Prisma + bcrypt). Middleware protege todo menos `/login`, `/api/auth`, `/api/cron`.
- **Login manual JWT**: Server Action genera el JWT y cookie manualmente (no usa `signIn` de NextAuth) para evitar dependencia de ruta API en middleware Edge.
- **Rate limiting**: In-memory, 5 intentos/min en login. Suficiente para SERMEC (on-premise con usuarios internos).
- **File upload**: Almacena en `./public/uploads/`, sirve vía `GET /api/files/[id]`. Metadata en `PatientDocument`.
- **Caddy en Docker**: Proxy reverso con HTTPS automático, sin instalar nada en el host.

## Comandos útiles

```bash
bun dev                        # Dev server
bun run build                  # Build producción + TS check
bun run dev:db                 # Solo PostgreSQL en Docker
bun run db:migrate             # Prisma migrate dev
bun run db:seed                # Seed idempotente
bun run db:studio              # Prisma Studio
bun run scripts/run-cron.ts    # Ejecutar notificaciones manualmente
docker compose logs -f caddy   # Logs de Caddy
docker compose logs -f app     # Logs de la app
docker compose exec app bun run db:migrate:deploy   # Migrar desde dentro del contenedor
```

## Cron en producción

```bash
# Ejecutar cada hora
0 * * * * curl -X POST http://localhost:3000/api/cron/notifications -H "Authorization: Bearer $CRON_SECRET"
```
