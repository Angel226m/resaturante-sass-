# RestauFlow SaaS

Sistema de gestión restaurantera **multi-tenant** con POS, menú digital, reservas, delivery, control de caja, reportes y más. Arquitectura desacoplada con clean architecture en el frontend y backend, aislamiento por tenant vía RLS de PostgreSQL, y despliegue Docker Compose hardened.

---

## Stack Tecnológico

### Backend
| Componente | Tecnología |
|---|---|
| Lenguaje | **Go 1.23** |
| Framework HTTP | **Gin Gonic v1.10** |
| Base de datos | **PostgreSQL 17** (con RLS) |
| Cache / Rate Limit | **Redis 7** (sliding window ZSET) |
| Autenticación | **JWT** (access 10min + refresh 1h/7d) en HttpOnly cookies |
| Cifrado | **AES-256-GCM** (modo determinista y seguro) |
| WebSockets | **Gorilla WebSocket** (cocina, mesas, delivery) |
| QR | **go-qrcode** (mesas y reservas) |
| Cron | **robfig/cron v3** |
| Migraciones | SQL planas en `migrations/` |
| Tests | **testing** estándar de Go |

### Frontend
| Componente | Tecnología |
|---|---|
| Framework | **React 19** |
| Build | **Vite 6** + SWC |
| Lenguaje | **TypeScript 5.7** |
| Routing | **React Router v7** |
| Estado global | **Zustand 5** (persist) |
| Server state | **TanStack Query 5** |
| Formularios | **React Hook Form** + **Zod** |
| Estilos | **Tailwind CSS 4** |
| Gráficos | **Recharts** |
| Notificaciones | **react-hot-toast** |
| HTTP | **Axios** (con refresh queue + CSRF) |
| Tests | **Vitest** + **Testing Library** |
| Iconos | **Lucide React** |

### Infraestructura
| Componente | Tecnología |
|---|---|
| Contenedores | **Docker Compose** |
| Proxy reverso | **nginx 1.27** (hardened) |
| TLS | **Let's Encrypt** (via certbot) |
| Backups | **pg_dump** → Backblaze B2 |
| Environment | 39 variables en `.env` |

---

## Estructura del Proyecto

```
restaurant-saas/
├── backend/                        # API REST en Go (Gin)
│   ├── cmd/main.go                # Entry point
│   ├── internal/
│   │   ├── config/                # Configuración (env vars)
│   │   ├── entidades/             # 10 dominios de negocio
│   │   │   ├── plataforma/        # Plan, Tenant, Suscripción, Factura
│   │   │   ├── auth/             # Credenciales, Usuario, Recuperación
│   │   │   ├── local/           # Local, Zona, Mesa, ConfigRestaurant
│   │   │   ├── menu/            # Categoría, Producto, Variante, Modificador, Combo, Promoción, Cupón
│   │   │   ├── clientes/        # Cliente, Dirección
│   │   │   ├── reservas/        # Reserva
│   │   │   ├── ordenes/         # Orden, ItemOrden, TicketCocina, HistorialEstado
│   │   │   ├── caja/            # TurnoCaja, MetodoPago, Pago, Comprobante
│   │   │   ├── delivery/        # ZonaDelivery, DeliveryOrden
│   │   │   └── reportes/        # ResumenDiario
│   │   ├── repositorios/         # 10 repos (SQL queries)
│   │   ├── servicios/            # 10 servicios (lógica de negocio)
│   │   ├── controladores/        # 10 controladores + helpers
│   │   ├── rutas/               # 11 archivos de rutas + router.go
│   │   ├── middleware/           # 8 middlewares
│   │   │   ├── auth.go          # JWT validation, HttpOnly cookies
│   │   │   ├── tenant.go        # Tenant isolation (SET LOCAL app.tenant_id)
│   │   │   ├── plan.go          # Feature flags por plan
│   │   │   ├── role.go          # RBAC (8 roles)
│   │   │   ├── rate_limit.go    # Sliding window via Redis
│   │   │   ├── audit.go         # Auditoría de cambios
│   │   │   ├── error.go         # Panic recovery OWASP A09
│   │   │   └── logger.go        # Request logging + security headers
│   │   ├── jobs/                # 5 cron jobs
│   │   │   ├── scheduler.go
│   │   │   ├── resumen_diario_job.go
│   │   │   ├── suscripcion_check_job.go
│   │   │   ├── verificar_reservas_job.go
│   │   │   ├── limpieza_tokens_job.go
│   │   │   └── backup_job.go
│   │   └── utils/               # 9 utilidades
│   │       ├── crypto.go       # AES-256-GCM dual-mode
│   │       ├── jwt.go          # Token generation/validation
│   │       ├── password.go     # bcrypt (cost 14)
│   │       ├── response.go     # APIResponse estandarizado
│   │       ├── validator.go    # Validaciones peruanas (RUC, DNI, celular)
│   │       ├── qr_generator.go
│   │       ├── pdf_generator.go
│   │       ├── numero_generador.go
│   │       └── websocket_hub.go
│   ├── migrations/              # 23 migraciones SQL
│   ├── Dockerfile               # Multi-stage (distroless)
│   ├── nginx.conf               # Reverse proxy hardened
│   ├── scripts/                 # backup-postgres-to-b2.sh
│   └── tests/                   # Tests Go
│
├── frontend/                    # SPA en React + TypeScript
│   ├── src/
│   │   ├── dominio/            # Capa de dominio
│   │   │   ├── entidades/      # 11 entidades
│   │   │   └── puertos/        # 10 interfaces de repositorio
│   │   ├── aplicacion/         # Capa de aplicación
│   │   │   └── casos-uso/      # 10 casos de uso
│   │   ├── infraestructura/    # Capa de infraestructura
│   │   │   ├── api/           # httpClient (Axios + refresh queue)
│   │   │   ├── store/         # Zustand (auth + UI)
│   │   │   ├── repositorios/  # 10 implementaciones HTTP
│   │   │   └── ui/
│   │   │       ├── layouts/   # Header, Sidebar, MainLayout
│   │   │       ├── componentes/comunes/  # Button, Input, Modal, DataTable, etc.
│   │   │       └── paginas/   # 28 páginas agrupadas por rol
│   │   ├── compartidos/       # demoData.ts, utilidades/
│   │   └── __tests__/         # 19 archivos de test
│   ├── Dockerfile             # Multi-stage (nginx-alpine)
│   ├── nginx.conf             # SPA config + security headers
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── docker-compose.yml          # Producción (5 servicios)
├── docker-compose.local.yml    # Desarrollo (4 servicios)
├── .env.example                # 39 variables de entorno
├── certbot/                    # TLS certificates
└── .gitignore
```

---

## Planes y Precios

| Plan | Precio | Características destacadas |
|---|---|---|
| **Básico** | $49/mes | 1 local, 3 usuarios, 50 productos, menú digital |
| **Pro** | $99/mes | 2 locales, 10 usuarios, 200 productos + reservas |
| **Premium** | $199/mes | 5 locales, 25 usuarios, producto ilimitado + delivery |
| **Enterprise** | $499/mes | Ilimitado + API pública + soporte prioritario |

22 feature flags en total controlan: `reservas`, `delivery`, `multi_local`, `reportes`, `api`, `insumos`, `compras`, `produccion`, `nomina`, `contabilidad`, `crm`, `fidelizacion`, `notificaciones_push`, `whatsapp`, `facturacion_electronica`, `pos`, `kiosko`, `menu_qr`, `cocina`, `inventario`, `auditoria`, `personalizacion`.

---

## Roles de Usuario

### Tenant (restaurante)
| Rol | Acceso |
|---|---|
| **OWNER** | Dueño — acceso total |
| **ADMIN** | Administrador — acceso total |
| **GERENTE** | Gerente — administrativo + reportes |
| **CAJERO** | Caja + pagos |
| **MESERO** | Mesas + órdenes + clientes |
| **COCINERO** | Tickets de cocina + menú |
| **ALMACENERO** | Insumos + inventario |
| **REPARTIDOR** | Delivery |

### SuperAdmin (plataforma)
| Nivel | Acceso |
|---|---|
| **superadmin** | Control total de la plataforma |
| **admin** | Gestión de planes y tenants |
| **soporte** | Soporte técnico (solo lectura) |

---

## API Endpoints

Todas las rutas bajo `/api/v1`. Middleware chain: `RateLimitAPI → Auth → Tenant → Plan`.

### Públicos
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Inicio de sesión (email + password) |
| POST | `/auth/login-pin` | Inicio rápido con PIN |
| POST | `/auth/refresh` | Refrescar tokens |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/recuperar-password` | Solicitar recuperación |
| POST | `/auth/resetear-password` | Resetear password |

### Módulos (requieren autenticación)
| Módulo | Rutas | Roles |
|---|---|---|
| **Locales** | `/locales/*`, `/zonas/*`, `/mesas/*`, `/configuracion/*` | admin, gerente |
| **Menú** | `/menu/categorias/*`, `/productos/*`, `/variantes/*`, `/modificadores/*`, `/combos/*`, `/promociones/*`, `/cupones/*`, `/imagenes/*`, `/horarios/*` | admin, gerente, mesero |
| **Órdenes** | `/ordenes/*`, `/cocina/tickets/*` | admin, gerente, mesero, cocinero |
| **Caja** | `/caja/turnos/*`, `/metodos-pago/*`, `/pagos/*`, `/comprobantes/*` | admin, gerente, cajero |
| **Clientes** | `/clientes/*` (CRUD + visitas + direcciones) | admin, gerente, mesero |
| **Reservas** | `/reservas/*` (feature: reservas) | admin, gerente, mesero |
| **Delivery** | `/delivery/zonas/*`, `/ordenes/*` (feature: delivery) | admin, gerente, repartidor |
| **Reportes** | `/reportes/dashboard`, `/resumen-diario/*`, `/audit-log/*` | admin, gerente |
| **Auth privado** | `/auth/perfil`, `/auth/usuarios/*` | admin |

### SuperAdmin
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/superadmin/login` | Login de superadmin |
| CRUD | `/superadmin/planes/*` | Gestión de planes |
| CRUD | `/superadmin/tenants/*` | Gestión de tenants |
| CRUD | `/superadmin/suscripciones/*` | Gestión de suscripciones |
| CRUD | `/superadmin/facturas/*` | Gestión de facturas |

### WebSocket
```
/ws?tenant_id={uuid}&canal={cocina|mesas|delivery}
```

### Health Check
```
GET /health  → { status, service, checks: { db, redis } }
```

---

## Seguridad

Baseline y checklist operativo completo: ver `SECURITY_OWASP_ISO27001.md`.

- **JWT en HttpOnly cookies** (access 10min, refresh 1h/7d) — doble secreto
- **AES-256-GCM** con modo determinista (correo, RUC, documento) y modo seguro (celular, teléfono)
- **bcrypt cost 14** para passwords
- **RLS en PostgreSQL** con `SET LOCAL app.tenant_id` en 55 tablas
- **Rate limiting** sliding window via Redis ZSET (5/login 15min, 100/API min, 200/superadmin min)
- **IP blacklist** via Redis
- **OWASP security headers** (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **Panic recovery** sin exponer stack traces (OWASP A09)
- **8 MB max body** (DoS prevention)
- **Trusted proxies** validados (RFC 1918)
- **Contenedores non-root** (appuser:1000) con read-only filesystem
- **Auditoría** en todas las operaciones POST/PUT/PATCH/DELETE en tablas críticas

---

## Bases de Datos

23 migraciones SQL con:
- 4 planes con 22 feature flags
- Tenants multi-tenant con RLS
- 8 roles de usuario + 3 niveles de superadmin
- Menú con categorías, productos, variantes, modificadores, combos, promociones, cupones
- Órdenes con 6 estados, tipos (mesa/barra/para_llevar/delivery)
- Turnos de caja, pagos, comprobantes
- Delivery con 8 estados y seguimiento GPS
- Reservas con 5 estados
- Soft delete con `deleted_at TIMESTAMPTZ`
- Índices especializados + seed demo con 7 días de historia

---

## Despliegue

### Producción
```bash
# Iniciar
docker compose --env-file .env up -d

# Servicios: nginx (80/443) → backend (8080) → db (5432), redis (6379)
# 2 redes: internal (aislada) + external (solo nginx)
```

### Desarrollo local
```bash
docker compose -f docker-compose.local.yml up -d
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# DB:       localhost:5432 (postgres/postgres)
# Redis:    localhost:6379
```

### Demo
```text
Admin:     admin@demo.com / admin123
Mesero:    mesero@demo.com / mesero123
Cocinero:  cocinero@demo.com / cocinero123
SuperAdmin: superadmin@restauflow.com / superadmin123
```

---

## Pruebas

```bash
# Frontend
npm run test          # Todos los tests
npm run test:unit     # Tests unitarios
npm run test:integracion  # Tests de integración
npm run test:e2e      # Tests end-to-end
npm run test:coverage # Cobertura

# Backend
go test ./tests/...
```

---

## Cron Jobs

| Horario | Job | Descripción |
|---|---|---|
| 23:55 | Resumen diario | Computa ventas diarias por local |
| 00:30 | Suscripciones vencidas | Marca vencidas y desactiva tenants |
| 03:00 | Limpieza de tokens | Elimina tokens expirados y audit_log >90 días |
| Cada 15 min | Verificar reservas | Marca no-asistió y libera mesas |
| 02:00 (prod) | Backup DB | pg_dump → Backblaze B2 |
