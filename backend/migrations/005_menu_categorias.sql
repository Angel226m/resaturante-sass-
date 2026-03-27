-- ==========================================
-- 005 — Menú: Categorías
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Categorías del menú (árbol con subcategorías)
CREATE TABLE IF NOT EXISTS categorias_menu (
    id                      SERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    categoria_padre_id      INT REFERENCES categorias_menu(id),
    nombre                  VARCHAR(150) NOT NULL,
    descripcion             TEXT,
    imagen_url              TEXT,
    icono                   VARCHAR(50),
    color                   VARCHAR(7),
    slug                    VARCHAR(200),
    orden                   INT DEFAULT 0,
    disponible_lunes        BOOLEAN DEFAULT true,
    disponible_martes       BOOLEAN DEFAULT true,
    disponible_miercoles    BOOLEAN DEFAULT true,
    disponible_jueves       BOOLEAN DEFAULT true,
    disponible_viernes      BOOLEAN DEFAULT true,
    disponible_sabado       BOOLEAN DEFAULT true,
    disponible_domingo      BOOLEAN DEFAULT true,
    hora_inicio_disponible  TIME,
    hora_fin_disponible     TIME,
    activo                  BOOLEAN DEFAULT true,
    eliminado               BOOLEAN DEFAULT false,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, nombre, categoria_padre_id)
);

-- Horarios de disponibilidad de menú
CREATE TABLE IF NOT EXISTS menu_horarios (
    id          SERIAL PRIMARY KEY,
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id    INT REFERENCES locales(id),
    nombre      VARCHAR(100) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    dias_semana VARCHAR(20) NOT NULL,
    activo      BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
