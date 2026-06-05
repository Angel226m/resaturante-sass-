# Architecture — RestauFlow SaaS

## Visión General

RestauFlow es un sistema SaaS multi-tenant para gestión restaurantera. Sigue **Arquitectura Limpia (Clean Architecture)** tanto en backend (Go) como en frontend (React/TypeScript), con aislamiento de datos por tenant via **Row-Level Security (RLS)** de PostgreSQL, cifrado AES-256-GCM de datos sensibles, rate limiting distribuido con Redis, y comunicación en tiempo real via WebSockets.

```
┌──────────────────────────────────────────────────────────────┐
│                        DNS / CDN                             │
└─────────────────────┬────────────────────────────────────────┘
                      │ 80/443
┌─────────────────────▼────────────────────────────────────────┐
│              nginx Reverse Proxy (hardened)                  │
│     OWASP headers · TLS 1.3 · Rate limit · MaxBody 8MB      │
└───────┬──────────────────────────────────┬───────────────────┘
        │ /api/*                            │ /* (SPA)
┌───────▼────────────────┐     ┌────────────▼──────────────────┐
│   Go Backend (Gin)     │     │  React SPA (Vite + TS)       │
│   :8080                │     │  nginx-alpine :80             │
│                        │     │                               │
│   Clean Architecture:  │     │   Clean Architecture:         │
│   ┌──────────────┐     │     │   ┌──────────────┐           │
│   │  Rutas       │     │     │   │  Páginas/UI  │           │
│   ├──────────────┤     │     │   ├──────────────┤           │
│   │ Controladores│     │     │   │  Casos de Uso│           │
│   ├──────────────┤     │     │   ├──────────────┤           │
│   │  Servicios   │     │     │   │  Puertos     │           │
│   ├──────────────┤     │     │   ├──────────────┤           │
│   │ Repositorios │     │     │   │  HTTP Repos  │           │
│   └──────────────┘     │     │   └──────────────┘           │
└───────┬────────────────┘     └──────────────────────────────┘
        │
┌───────▼────────────────┐
│   PostgreSQL 17 (RLS)  │
│   Redis 7              │
└────────────────────────┘
```

---

## Backend Architecture (Go)

### Capas

```
cmd/main.go
    │
    ▼
Rutas (router.go + 10 archivos de rutas)
    │
    ▼
Middleware Chain:
    RateLimitAPI → Auth (JWT) → Tenant (RLS) → Plan (Features) → Role
    │
    ▼
Controladores (10 dominios)
    │
    ▼
Servicios (10 dominios) — Lógica de negocio
    │
    ▼
Repositorios (10 dominios) — SQL queries
    │
    ▼
PostgreSQL + Redis
```

### Flujo de Middleware

1. **Recovery** — Captura pánicos sin exponer stack traces
2. **ErrorHandler** — Manejo centralizado de errores
3. **SecurityHeaders** — OWASP headers (HSTS, CSP, XFO, etc.)
4. **RequestID** — UUID por request para trazabilidad
5. **Logger** — Método, ruta, status, latencia, IP, RequestID
6. **CheckBlacklist** — Verifica IP en blacklist de Redis
7. **CORS** — Origen único configurado, credenciales true
8. **RequireHTTPS** — Redirección a HTTPS en producción
9. **RateLimitAPI** — Sliding window via Redis ZSET
10. **Auth** — Valida JWT access token (HttpOnly cookie o Bearer)
11. **Tenant** — Verifica tenant activo y establece `SET LOCAL app.tenant_id`
12. **Plan** — Verifica suscripción activa y carga feature flags
13. **Role** — Verifica rol del usuario vs. ruta

### Dominios de Negocio (10)

| Dominio | Entidades | Features |
|---|---|---|
| **Plataforma** | Plan, Tenant, Suscripción, Factura | Gestión de planes, multi-tenant, facturación MercadoPago |
| **Auth** | Credenciales, Usuario, Recuperación | Login email/PIN, JWT, refresh tokens, recuperación password |
| **Local** | Local, Zona, Mesa, ConfigRestaurant | Sucursales, pisos/áreas, estado/forma/posición XY de mesas, QR por mesa |
| **Menú** | Categoría, Producto, Variante, GrupoModificador, Modificador, Combo, Promoción, Cupón | Menú jerárquico con horarios, imágenes, modificadores, combos |
| **Clientes** | Cliente, Dirección | Fidelidad (puntos), historial de visitas, direcciones |
| **Reservas** | Reserva | 5 estados, historial, liberación automática por no-show |
| **Órdenes** | Orden, ItemOrden, TicketCocina, HistorialEstado | 6 estados, 4 tipos, integración cocina, historial completo |
| **Caja** | TurnoCaja, MetodoPago, Pago, Comprobante | Apertura/cierre de turno, múltiples métodos de pago, comprobantes |
| **Delivery** | ZonaDelivery, DeliveryOrden | 8 estados, asignación de repartidores, seguimiento |
| **Reportes** | ResumenDiario | Dashboard, resumen diario, auditoría |

### Jobs (Cron)

```go
jobs.IniciarJobs(db, rdb, cfg)  // scheduler.go
    ├── ResumenDiarioJob     ─ 23:55  ─ UPSERT resumen_diario por local
    ├── SuscripcionCheckJob  ─ 00:30  ─ Marca vencidas, desactiva tenants
    ├── LimpiezaTokensJob    ─ 03:00  ─ Tokens expirados + audit_log >90d
    ├── VerificarReservasJob ─ */15m  ─ No-shows + liberar mesas
    └── BackupJob            ─ 02:00  ─ pg_dump → B2 (solo producción)
```

### Utilidades Clave

| Utilidad | Propósito |
|---|---|
| `crypto.go` | AES-256-GCM dual-mode: `EncryptFast` (nonce determinista para búsquedas) y `EncryptSecure` (nonce aleatorio para datos sensibles) |
| `jwt.go` | Generación y validación de access/refresh tokens con doble secreto |
| `password.go` | bcrypt con costo 14, mínimo 8 caracteres |
| `response.go` | `APIResponse` estandarizado: Success, Created, Error, Paginated, etc. |
| `validator.go` | Validaciones peruanas: RUC (10/20 + 9 dígitos), DNI (8), celular (9XX), email, slug, PIN, hex color |
| `websocket_hub.go` | Hub singleton con canales por tenant, broadcast a cocina/mesas/delivery |
| `qr_generator.go` | Generación de QR para mesas y reservas |
| `numero_generador.go` | Secuenciales mutex-protegidos: ORD-2026-000001, FACT-2026-000001 |
| `pdf_generator.go` | Stub para generación de tickets PDF |

---

## Frontend Architecture (React/TypeScript)

### Capas

```
src/
├── dominio/                    # Capa más interna — sin dependencias
│   ├── entidades/             # Interfaces del dominio
│   └── puertos/               # Interfaces de repositorio (contratos)
│
├── aplicacion/                 # Casos de uso — orquestan lógica
│   └── casos-uso/             # 10 casos de uso
│
├── infraestructura/            # Capa externa — implementaciones
│   ├── api/httpClient.ts      # Axios con refresh queue + CSRF
│   ├── store/                 # Zustand (auth + UI)
│   ├── repositorios/          # 10 implementaciones HTTP
│   └── ui/
│       ├── layouts/           # Header, Sidebar, MainLayout
│       ├── componentes/       # 12 componentes comunes
│       └── paginas/           # 28 páginas
│
└── compartidos/               # Demo data, utilidades
```

### Flujo de Autenticación

```
LoginForm
    ↓ dispatch
useAuthStore.login(email, password)
    ↓
POST /api/v1/auth/login  →  HttpOnly cookies (access_token + refresh_token)
    ↓
useAuthStore.checkAuth()
    ↓
GET /api/v1/auth/perfil  →  usuario + rol + tenant
    ↓
Zustand store (persist)  →  isAuthenticated, usuario, rol, tenant
```

### Manejo de Tokens (httpClient.ts)

```
Request
    ↓
Interceptor: ¿tiene cookie access_token?
    ├── Sí → enviar request
    └── No → 401
            ↓
        ¿hay refresh en cola?
            ├── No → POST /auth/refresh
            │         ├── OK → reintentar request original
            │         └── Fail → logout
            └── Sí → encolar y esperar refresh
```

### Routing (App.tsx)

```
BrowserRouter
├── GuestRoute (landing, login, registro, recuperar)
└── ProtectedRoute
    ├── RoleRoute(admin|gerente) → /dashboard, /menu, /ordenes, /cocina, /mesas,
    │                                /caja, /clientes, /reservas, /delivery,
    │                                /locales, /reportes, /usuarios, /configuracion
    ├── RoleRoute(mesero) → /mesero, /mesero/ordenes, /mesero/mesas, ...
    ├── RoleRoute(cocinero) → /cocinero, /cocinero/ordenes, /cocinero/menu, ...
    └── SuperAdminRoute → /superadmin, /superadmin/tenants, /superadmin/planes
```

### Estado Global (Zustand)

| Store | Estado |
|---|---|
| `useAuthStore` | isAuthenticated, isLoading, isSuperAdmin, usuario, login(), logout(), checkAuth(), hasRole() |
| `useUIStore` | theme (dark/light), sidebarOpen |

### Demo Mode

El auth store incluye un modo demo con 3 usuarios hardcodeados y un superadmin, activo cuando el backend no responde, permitiendo desarrollo y pruebas sin infraestructura.

---

## Base de Datos

### Migraciones (23 archivos SQL)

```
001_plataforma_planes.sql         Planes, características, feature flags (22)
002_tenants_suscripciones.sql     Tenants, suscripciones, facturas, historial
003_usuarios_auth.sql             Usuarios, 8 roles, 3 niveles superadmin, PIN
004_local_mesas.sql              Locales, zonas, mesas (QR), config restaurante
005_menu_categorias.sql           Categorías de menú, horarios
006_menu_productos.sql            Productos, imágenes, variantes
007_menu_modificadores.sql        Grupos modificadores, modificadores, asignación
008_menu_combos_promociones.sql   Combos, promociones, cupones
009-011                           (espacio reservado)
012_clientes.sql                  Clientes, direcciones, puntos fidelidad
013_reservas.sql                  Reservas, historial
014_ordenes.sql                   Órdenes, items, tickets cocina, historial estados
015_caja_pagos.sql                Turnos caja, métodos pago, pagos, comprobantes
016_delivery.sql                  Zonas delivery, órdenes delivery, seguimiento
017_reportes_alertas.sql          Resumen diario, alertas stock
018_audit_log.sql                 Auditoría (acción, tabla, datos anterior/nuevo, IP, UA)
019_rls_policies.sql              RLS en 55 tablas + políticas tenant_isolation
020_indices_especializados.sql    Índices de performance
021_soft_delete_migration.sql     Migración eliminado → deleted_at
022_ordenes_schema_fix.sql        Correcciones de esquema
023_seed_demo.sql                 Datos de demostración (7 días de órdenes)
```

### RLS (Row-Level Security)

```sql
-- Política base en cada tabla con tenant_id
CREATE POLICY tenant_isolation ON <tabla>
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Aplicado en 55 tablas via DO block
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
```

El middleware `Tenant` ejecuta `SET LOCAL app.tenant_id = $1` al inicio de cada request autenticado, y todos los repositorios usan esa variable para filtrar automáticamente.

### Soft Delete

Todas las entidades usan `deleted_at TIMESTAMPTZ` en lugar de `eliminado BOOLEAN`:
- `NULL` = activo
- `NOT NULL` = eliminado (timestamp de eliminación)
- Los repositorios filtran automáticamente `WHERE deleted_at IS NULL`
- Permite recuperación de datos y auditoría de eliminaciones

### Seed Demo

El seed (`023_seed_demo.sql`) crea:
- 1 superadmin (superadmin@restauflow.com)
- 1 tenant "RestauDemo" con Plan Pro
- 1 local, 1 zona, 12 mesas
- 4 usuarios (admin, mesero, cocinero, cajero)
- 5 categorías de menú, 15 productos
- ~80 órdenes diarias por 7 días de historia
- 5 órdenes activas para el día actual

---

## Seguridad

### Encriptación AES-256-GCM

Dos modos de operación para balancear seguridad y funcionalidad:

| Modo | Nonce | Uso | Buscable |
|---|---|---|---|
| `EncryptFast` | Determinista (HMAC(contenido)) | Correo, RUC, documento | Sí |
| `EncryptSecure` | Aleatorio (crypto/rand) | Celular, teléfono, cuenta bancaria | No |

Tipos helper: `EncryptCorreo`, `EncryptRUC`, `EncryptNumeroCelular`, `EncryptNumeroDocumento`, `EncryptCuentaBancaria`, `CifrarDatosPersona`/`DescifrarDatosPersona`.

### JWT

```go
AccessToken:      10 min,  JWT_SECRET,       HttpOnly cookie
RefreshToken:     1h (7d si rememberMe),     JWT_REFRESH_SECRET, HttpOnly cookie
SuperAdminAccess: 15 min,  JWT_SECRET
SuperAdminRefresh: 2h,     JWT_REFRESH_SECRET
```

### Rate Limiting

| Endpoint | Límite | Ventana | Almacenamiento |
|---|---|---|---|
| Login | 5 | 15 min | Redis ZSET |
| API general | 100 | 1 min | Redis ZSET |
| SuperAdmin | 200 | 1 min | Redis ZSET |
| Password recovery | 3 | 30 min | Redis ZSET |
| Webhook | 50 | 1 min | Redis ZSET |
| IP Blacklist | Manual | Persistente | Redis SET |

### Contenedores

- Todos los servicios corren como **non-root** (appuser:1000)
- **Filesystem read-only** con tmpfs para escritura temporal
- **no-new-privileges** = true
- **Healthchecks** en todos los servicios
- Límites de memoria y CPU por servicio
- Logging con rotación (json-file, max 3-5 archivos de 10-50MB)

---

## WebSockets

Conexión vía `GET /ws?tenant_id={uuid}&canal={nombre}` con el hub singleton:

```go
WSHub{
    register:   chan Connection
    unregister: chan Connection
    broadcast:  chan Message
    connections: map[string]map[*websocket.Conn]bool  // canal → conexiones
}
```

Canales predefinidos: `cocina`, `mesas`, `delivery`

Métodos helper: `PublicarOrdenCocina`, `PublicarEstadoMesa`, `PublicarDelivery`

---

## DevOps

### Docker Compose — Producción

```
5 servicios, 2 redes (internal + external)
┌──────────────────────────────────────────────────┐
│  nginx:1.27-alpine (256M)                        │
│  Puertos: 80:80, 443:443                         │
│  Redes: internal + external                      │
│  Vol: nginx.conf, certbot/conf, certbot/www      │
├──────────────────────────────────────────────────┤
│  backend (512M) — distroless/base                │
│  frontend (256M) — nginx-alpine                  │
│  db (1G) — postgres:17-alpine, readonly+tmpfs    │
│  redis (512M) — 7-alpine, renamed commands       │
└──────────────────────────────────────────────────┘
```

### Docker Compose — Desarrollo

```
4 servicios (sin nginx proxy)
Puertos expuestos: 5432, 6379, 8080, 3000
Secrets hardcodeados para dev
Sin restricciones de seguridad (read_only, no-new-privileges)
```

### Backup

Script `scripts/backup-postgres-to-b2.sh`:
```bash
pg_dump --no-owner --no-acl | gzip → sube a Backblaze B2 via b2 CLI
```

---

## Configuración de Entorno

39 variables en `.env` categorizadas:

| Grupo | Variables |
|---|---|
| Entorno | ENV, GIN_MODE, SERVER_PORT, SERVER_HOST |
| PostgreSQL | DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD |
| Redis | REDIS_HOST, REDIS_PORT, REDIS_PASSWORD |
| CORS | CORS_ORIGIN |
| JWT | JWT_SECRET, JWT_REFRESH_SECRET |
| Cifrado | ENCRYPTION_KEY |
| Email | RESEND_API_KEY |
| WebSocket | ENABLE_WEBSOCKETS |

---

## Decisiones Técnicas

| Decisión | Alternativa | Razón |
|---|---|---|
| RLS vs. schema-per-tenant | Esquemas separados | RLS: menor complejidad operativa, backups más simples, consultas cross-tenant para superadmin |
| AES-256-GCM vs. AES-256-CBC | CBC | GCM: autenticación integrada (AEAD), sin padding, misma performance |
| HttpOnly cookies vs. localStorage | localStorage | Cookies: inmunes a XSS, same-site, refresh token rotación automática |
| Gin vs. Echo/Fiber | Fiber, Echo | Gin: ecosistema maduro, mejor documentación, más estable |
| Zustand vs. Redux/Context | Redux Toolkit | Zustand: mínimo boilerplate, bundle pequeño, persist integrado |
| TanStack Query vs. SWR | SWR | TanStack Query: más maduro, mejor soporte devtools, paginación inline |
| Tailwind 4 vs. CSS Modules/SCSS | CSS Modules | Tailwind 4: zero-config, JIT engine, CSS first-class |
| Vitest vs. Jest | Jest | Vitest: compatible con Vite, más rápido, ESM nativo |
