-- ==========================================
-- 008 — Menú: Combos y Promociones
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Combos (menú del día, combo familiar, etc.)
CREATE TABLE IF NOT EXISTS combos (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre              VARCHAR(300) NOT NULL,
    descripcion         TEXT,
    imagen_url          TEXT,
    precio              NUMERIC(12,2) NOT NULL,
    precio_delivery     NUMERIC(12,2),
    disponible_desde    TIMESTAMPTZ,
    disponible_hasta    TIMESTAMPTZ,
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle de combos (productos que componen el combo)
CREATE TABLE IF NOT EXISTS detalle_combos (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    combo_id        BIGINT NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES productos_menu(id),
    variante_id     BIGINT REFERENCES variantes_producto_menu(id),
    cantidad        INT NOT NULL DEFAULT 1,
    orden           INT DEFAULT 0
);

-- Promociones
CREATE TABLE IF NOT EXISTS promociones (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre              VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    tipo                VARCHAR(30) NOT NULL CHECK(tipo IN (
                            'descuento_porcentaje','descuento_monto','2x1',
                            'producto_gratis','combo_especial','happy_hour'
                        )),
    valor               NUMERIC(10,2),
    codigo              VARCHAR(50),
    uso_maximo          INT,
    usos_actuales       INT DEFAULT 0,
    aplica_a            VARCHAR(20) DEFAULT 'toda_la_orden' CHECK(aplica_a IN (
                            'toda_la_orden','categoria','producto'
                        )),
    categoria_id        INT REFERENCES categorias_menu(id),
    producto_id         BIGINT REFERENCES productos_menu(id),
    solo_primera_vez    BOOLEAN DEFAULT false,
    solo_delivery       BOOLEAN DEFAULT false,
    hora_inicio         TIME,
    hora_fin            TIME,
    dias_semana         VARCHAR(20),
    fecha_inicio        DATE,
    fecha_fin           DATE,
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Cupones de descuento individuales
CREATE TABLE IF NOT EXISTS cupones (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo          VARCHAR(50) NOT NULL UNIQUE,
    promocion_id    BIGINT REFERENCES promociones(id),
    cliente_id      BIGINT,
    usado           BOOLEAN DEFAULT false,
    fecha_uso       TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
