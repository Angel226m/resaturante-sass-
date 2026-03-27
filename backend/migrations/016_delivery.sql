-- ==========================================
-- 016 — Delivery
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Zonas de delivery (cobertura por local)
CREATE TABLE IF NOT EXISTS zonas_delivery (
    id                  SERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id            INT NOT NULL REFERENCES locales(id),
    nombre              VARCHAR(100) NOT NULL,
    radio_km            NUMERIC(5,2),
    costo_envio         NUMERIC(12,2) NOT NULL,
    tiempo_estimado_min INT DEFAULT 30,
    activo              BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, local_id, nombre)
);

-- Extensión de una orden tipo delivery
CREATE TABLE IF NOT EXISTS delivery_ordenes (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    orden_id                BIGINT NOT NULL UNIQUE REFERENCES ordenes(id),
    zona_delivery_id        INT REFERENCES zonas_delivery(id),
    repartidor_id           INT REFERENCES usuarios(id),
    direccion_entrega_id    BIGINT REFERENCES direcciones_cliente(id),
    estado_delivery         VARCHAR(20) DEFAULT 'pendiente' CHECK(estado_delivery IN (
                                'pendiente','asignado','recogido',
                                'en_camino','entregado','no_entregado','cancelado'
                            )),
    costo_envio             NUMERIC(12,2) NOT NULL,
    distancia_km            NUMERIC(6,2),
    instrucciones_entrega   TEXT,
    codigo_confirmacion     VARCHAR(10),
    latitud_entrega         NUMERIC(10,6),
    longitud_entrega        NUMERIC(10,6),
    tiempo_estimado_entrega TIMESTAMPTZ,
    tiempo_real_entrega     TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Seguimiento de delivery (INMUTABLE — historial de ubicaciones)
CREATE TABLE IF NOT EXISTS seguimiento_delivery (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    delivery_id     BIGINT NOT NULL REFERENCES delivery_ordenes(id) ON DELETE CASCADE,
    repartidor_id   INT NOT NULL REFERENCES usuarios(id),
    latitud         NUMERIC(10,6) NOT NULL,
    longitud        NUMERIC(10,6) NOT NULL,
    estado_delivery VARCHAR(20) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
