-- ==========================================
-- 014 — Órdenes (Core del restaurante)
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Órdenes
-- Flujo: nueva → en_cocina → listo → servida → pagada / cancelada
CREATE TABLE IF NOT EXISTS ordenes (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id            INT NOT NULL REFERENCES locales(id),
    mesa_id             INT REFERENCES mesas(id),
    reserva_id          BIGINT REFERENCES reservas(id),
    cliente_id          BIGINT REFERENCES clientes(id),
    mesero_id           INT REFERENCES usuarios(id),
    cajero_id           INT REFERENCES usuarios(id),
    turno_caja_id       BIGINT,
    numero_orden        VARCHAR(50) UNIQUE NOT NULL,
    numero_comensales   INT DEFAULT 1,
    tipo                VARCHAR(20) DEFAULT 'mesa' CHECK(tipo IN (
                            'mesa','barra','para_llevar','delivery'
                        )),
    estado              VARCHAR(20) DEFAULT 'nueva' CHECK(estado IN (
                            'nueva','en_cocina','listo','servida','pagada','cancelada'
                        )),
    subtotal            NUMERIC(12,2) DEFAULT 0,
    descuento_total     NUMERIC(12,2) DEFAULT 0,
    igv                 NUMERIC(12,2) DEFAULT 0,
    propina             NUMERIC(12,2) DEFAULT 0,
    cubierto            NUMERIC(12,2) DEFAULT 0,
    costo_envio         NUMERIC(12,2) DEFAULT 0,
    total               NUMERIC(12,2) DEFAULT 0,
    puntos_acumulados   INT DEFAULT 0,
    puntos_canjeados    INT DEFAULT 0,
    nota_general        TEXT,
    motivo_cancelacion  TEXT,
    fecha_apertura      TIMESTAMPTZ DEFAULT NOW(),
    fecha_cierre        TIMESTAMPTZ,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Items de la orden (productos pedidos)
CREATE TABLE IF NOT EXISTS items_orden (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    orden_id                BIGINT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id             BIGINT NOT NULL REFERENCES productos_menu(id),
    variante_id             BIGINT REFERENCES variantes_producto_menu(id),
    cantidad                INT NOT NULL DEFAULT 1,
    precio_unitario         NUMERIC(12,2) NOT NULL,
    descuento_porcentaje    NUMERIC(5,2) DEFAULT 0,
    descuento_monto         NUMERIC(12,2) DEFAULT 0,
    subtotal                NUMERIC(12,2) NOT NULL,
    estado                  VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN (
                                'pendiente','en_preparacion','listo','servido','cancelado'
                            )),
    notas                   TEXT,
    numero_turno_cocina     INT DEFAULT 1,
    modificadores_json      JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Modificadores aplicados a cada item (INMUTABLE)
CREATE TABLE IF NOT EXISTS modificadores_item_orden (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id             BIGINT NOT NULL REFERENCES items_orden(id) ON DELETE CASCADE,
    modificador_id      INT NOT NULL REFERENCES modificadores(id),
    nombre_modificador  VARCHAR(150) NOT NULL,
    precio_adicional    NUMERIC(12,2) DEFAULT 0
);

-- Historial de estados de orden (INMUTABLE)
CREATE TABLE IF NOT EXISTS historial_estados_orden (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    orden_id        BIGINT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo    VARCHAR(20) NOT NULL,
    usuario_id      INT REFERENCES usuarios(id),
    notas           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets de cocina (comandas enviadas a cada estación)
CREATE TABLE IF NOT EXISTS tickets_cocina (
    id                          BIGSERIAL PRIMARY KEY,
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    orden_id                    BIGINT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    local_id                    INT NOT NULL REFERENCES locales(id),
    estacion                    VARCHAR(50),
    numero_ticket               INT NOT NULL,
    estado                      VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN (
                                    'pendiente','en_preparacion','listo','entregado'
                                )),
    impreso                     BOOLEAN DEFAULT false,
    leido_en_pantalla           BOOLEAN DEFAULT false,
    tiempo_estimado_min         INT,
    tiempo_inicio_preparacion   TIMESTAMPTZ,
    tiempo_listo                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);
