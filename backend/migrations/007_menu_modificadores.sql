-- ==========================================
-- 007 — Menú: Modificadores
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Grupos de modificadores (Término, Extras, Sin ingrediente)
CREATE TABLE IF NOT EXISTS grupos_modificadores (
    id                  SERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre              VARCHAR(150) NOT NULL,
    tipo                VARCHAR(20) DEFAULT 'opcional' CHECK(tipo IN (
                            'obligatorio','opcional'
                        )),
    seleccion_minima    INT DEFAULT 0,
    seleccion_maxima    INT DEFAULT 1,
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, nombre)
);

-- Opciones dentro de un grupo de modificadores
CREATE TABLE IF NOT EXISTS modificadores (
    id                  SERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    grupo_id            INT NOT NULL REFERENCES grupos_modificadores(id) ON DELETE CASCADE,
    nombre              VARCHAR(150) NOT NULL,
    precio_adicional    NUMERIC(12,2) DEFAULT 0,
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    orden               INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Relación producto-grupo de modificadores
CREATE TABLE IF NOT EXISTS producto_grupos_modificadores (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES productos_menu(id) ON DELETE CASCADE,
    grupo_id        INT NOT NULL REFERENCES grupos_modificadores(id) ON DELETE CASCADE,
    orden           INT DEFAULT 0,
    UNIQUE(tenant_id, producto_id, grupo_id)
);
