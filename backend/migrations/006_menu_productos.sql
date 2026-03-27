-- ==========================================
-- 006 — Menú: Productos
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Productos del menú
CREATE TABLE IF NOT EXISTS productos_menu (
    id                          BIGSERIAL PRIMARY KEY,
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id                    INT REFERENCES locales(id),
    categoria_id                INT NOT NULL REFERENCES categorias_menu(id),
    nombre                      VARCHAR(300) NOT NULL,
    descripcion                 TEXT,
    descripcion_corta           VARCHAR(500),
    codigo_interno              VARCHAR(50),
    precio                      NUMERIC(12,2) NOT NULL,
    precio_delivery             NUMERIC(12,2),
    calorias                    INT,
    tiempo_preparacion_min      INT DEFAULT 15,
    imagen_principal_url        TEXT,
    es_vegetariano              BOOLEAN DEFAULT false,
    es_vegano                   BOOLEAN DEFAULT false,
    es_sin_gluten               BOOLEAN DEFAULT false,
    es_picante                  BOOLEAN DEFAULT false,
    nivel_picante               INT DEFAULT 0,
    contiene_alergenos          TEXT,
    disponible_para_delivery    BOOLEAN DEFAULT true,
    disponible_para_llevar      BOOLEAN DEFAULT true,
    disponible_para_mesa        BOOLEAN DEFAULT true,
    visible_en_qr               BOOLEAN DEFAULT true,
    orden_display               INT DEFAULT 0,
    destacado                   BOOLEAN DEFAULT false,
    activo                      BOOLEAN DEFAULT true,
    eliminado                   BOOLEAN DEFAULT false,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Galería de imágenes por producto
CREATE TABLE IF NOT EXISTS producto_menu_imagenes (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES productos_menu(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    alt_text        VARCHAR(200),
    es_principal    BOOLEAN DEFAULT false,
    orden           INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Variantes de producto (tamaños: personal, mediano, familiar)
CREATE TABLE IF NOT EXISTS variantes_producto_menu (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    producto_id         BIGINT NOT NULL REFERENCES productos_menu(id) ON DELETE CASCADE,
    nombre              VARCHAR(100) NOT NULL,
    tipo_variante       VARCHAR(50),
    valor               VARCHAR(100) NOT NULL,
    precio              NUMERIC(12,2) NOT NULL,
    precio_delivery     NUMERIC(12,2),
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, producto_id, tipo_variante, valor)
);
