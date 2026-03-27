-- ==========================================
-- 004 — Local, Zonas (pisos) y Mesas
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Locales (sucursales del restaurante)
CREATE TABLE IF NOT EXISTS locales (
    id                  SERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre              VARCHAR(200) NOT NULL,
    direccion           TEXT NOT NULL,
    distrito            VARCHAR(100),
    provincia           VARCHAR(100),
    departamento        VARCHAR(100),
    telefono            TEXT,
    correo              TEXT,
    latitud             NUMERIC(10,6),
    longitud            NUMERIC(10,6),
    es_principal        BOOLEAN DEFAULT false,
    numero_pisos        INT DEFAULT 1,
    horario_apertura    TIME,
    horario_cierre      TIME,
    acepta_reservas     BOOLEAN DEFAULT true,
    acepta_delivery     BOOLEAN DEFAULT true,
    radio_delivery_km   NUMERIC(5,2) DEFAULT 5.00,
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar FK de usuarios a locales ahora que la tabla existe
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_local
    FOREIGN KEY (local_id) REFERENCES locales(id);

-- Zonas (pisos/áreas del local: Piso 1 - Salón, Piso 2 - Terraza, VIP, Bar)
CREATE TABLE IF NOT EXISTS zonas (
    id          SERIAL PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id    INT NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    piso        INT DEFAULT 1,
    color       VARCHAR(7),
    orden       INT DEFAULT 0,
    activo      BOOLEAN DEFAULT true,
    eliminado   BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, local_id, nombre)
);

-- Mesas
CREATE TABLE IF NOT EXISTS mesas (
    id          SERIAL PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id    INT NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
    zona_id     INT REFERENCES zonas(id),
    numero      VARCHAR(10) NOT NULL,
    capacidad   INT NOT NULL DEFAULT 4,
    estado      VARCHAR(20) DEFAULT 'disponible' CHECK(estado IN (
                    'disponible','ocupada','reservada','bloqueada','limpieza'
                )),
    forma       VARCHAR(20) DEFAULT 'cuadrada' CHECK(forma IN (
                    'cuadrada','redonda','rectangular','barra','otro'
                )),
    posicion_x  INT DEFAULT 0,
    posicion_y  INT DEFAULT 0,
    qr_codigo   TEXT,
    qr_url      TEXT,
    activo      BOOLEAN DEFAULT true,
    eliminado   BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, local_id, numero)
);

-- Configuración del restaurante (por local)
CREATE TABLE IF NOT EXISTS configuracion_restaurante (
    id                              SERIAL PRIMARY KEY,
    tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id                        INT REFERENCES locales(id) ON DELETE CASCADE,
    moneda                          VARCHAR(3) DEFAULT 'PEN',
    simbolo_moneda                  VARCHAR(5) DEFAULT 'S/.',
    zona_horaria                    VARCHAR(50) DEFAULT 'America/Lima',
    formato_fecha                   VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    igv_porcentaje                  NUMERIC(5,2) DEFAULT 18.00,
    precio_incluye_igv              BOOLEAN DEFAULT true,
    propina_sugerida                BOOLEAN DEFAULT false,
    propina_porcentaje              NUMERIC(5,2) DEFAULT 0,
    cobrar_cubierto                 BOOLEAN DEFAULT false,
    precio_cubierto                 NUMERIC(12,2) DEFAULT 0,
    mensaje_ticket                  TEXT,
    mensaje_wifi                    TEXT,
    correo_notificaciones           TEXT,
    enviar_email_reserva            BOOLEAN DEFAULT true,
    enviar_email_orden              BOOLEAN DEFAULT false,
    tiempo_preparacion_default_min  INT DEFAULT 20,
    minutos_alerta_orden_demorada   INT DEFAULT 30,
    permite_ordenar_sin_mesero      BOOLEAN DEFAULT false,
    permitir_reservas               BOOLEAN DEFAULT true,
    tiempo_max_reserva              INT DEFAULT 120,
    permitir_delivery               BOOLEAN DEFAULT true,
    updated_at                      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, local_id)
);
