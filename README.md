# GymSaaS 🏋️

Plataforma SaaS multi-tenant para gestión integral de gimnasios.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, React, TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Auth | JWT + Refresh Token |
| Pagos | Mercado Pago |
| Notificaciones | Email (SMTP/Resend), WhatsApp (Evolution API), Push (Firebase) |
| Infraestructura | Docker, Docker Compose |
| Deploy | Vercel (web) + Render/Railway (API) |

## Estructura del monorepo

```
GymSaaS/
├── apps/
│   ├── api/           # NestJS API
│   └── web/           # Next.js frontend (PWA)
├── packages/
│   ├── database/      # Prisma schema + seed
│   └── shared/        # Types y constantes compartidas
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

## Módulos

- **Dashboard** — KPIs, gráficos de ingresos, próximos vencimientos
- **Alumnos** — CRUD completo, QR personal, historial
- **Rutinas** — Creación con ejercicios, asignación a alumnos, renovación automática cada 90 días
- **Ejercicios** — Biblioteca 100+ ejercicios precargados por categorías
- **Pagos** — Mercado Pago + efectivo, webhooks automáticos, estados
- **Horarios** — Turnos, cupos, reservas, feriados
- **Asistencia** — Check-in por QR o manual
- **Nutrición** — Métricas corporales, IMC, evolución de peso
- **Notificaciones** — Email + WhatsApp automáticos (vencimientos, bienvenida)
- **Reportes** — Facturación, retención, asistencia
- **Administración** — Usuarios, roles, auditoría

## Setup rápido (desarrollo local)

### 1. Clonar y configurar entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 2. Levantar base de datos con Docker

```bash
npm run docker:dev
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Migrar base de datos y cargar datos demo

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Iniciar la aplicación

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000/api/v1
- **Swagger:** http://localhost:4000/api/docs

### Login demo

- Gimnasio: `demo-gym`
- Admin: `admin@fitpro.com` / `Admin1234!`
- Entrenador: `trainer@fitpro.com` / `Trainer123!`

## Deploy en producción

### Docker Compose completo

```bash
cp .env.example .env
# Configurar variables de producción
docker-compose up -d
```

### Vercel + Render (recomendado)

**API en Render:**
1. Crear servicio Web en Render
2. Build command: `cd apps/api && npm run build`
3. Start command: `npm run start`
4. Agregar variables de entorno del `.env.example`

**Web en Vercel:**
1. Conectar repositorio
2. Framework: Next.js
3. Root directory: `apps/web`
4. Agregar `NEXT_PUBLIC_API_URL` apuntando a la API de Render

## Variables de entorno clave

```bash
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
MP_ACCESS_TOKEN=...          # Mercado Pago
SMTP_HOST=smtp.resend.com    # Email
EVOLUTION_API_URL=...        # WhatsApp
NEXT_PUBLIC_API_URL=...      # URL pública de la API
```

## PWA

La aplicación es instalable en Android e iOS:
- Android: "Agregar a pantalla de inicio" desde Chrome
- iOS: Safari → Compartir → "Agregar a pantalla de inicio"

## Multi-tenant

Cada gimnasio tiene:
- Slug único (ej: `mi-gimnasio`)
- Sus propios alumnos, rutinas, pagos, usuarios y configuración
- Integración propia de Mercado Pago (opcional)
- URL de acceso: `https://app.gymsaas.com/login` + código del gimnasio

## Licencia

MIT — Comercializable, modificable, sin restricciones.
