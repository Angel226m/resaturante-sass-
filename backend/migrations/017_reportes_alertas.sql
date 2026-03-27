-- ==========================================
-- 017 — Reportes
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Resumen diario (snapshot para dashboard rápido)
CREATE TABLE IF NOT EXISTS resumen_diario (
    id                              BIGSERIAL PRIMARY KEY,
    tenant_id                       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id                        INT REFERENCES locales(id),
    fecha                           DATE NOT NULL,
    total_ventas                    NUMERIC(14,2) DEFAULT 0,
    numero_ordenes                  INT DEFAULT 0,
    numero_ordenes_mesa             INT DEFAULT 0,
    numero_ordenes_delivery         INT DEFAULT 0,
    numero_ordenes_llevar           INT DEFAULT 0,
    ticket_promedio                 NUMERIC(12,2) DEFAULT 0,
    total_propinas                  NUMERIC(12,2) DEFAULT 0,
    total_descuentos                NUMERIC(12,2) DEFAULT 0,
    clientes_nuevos                 INT DEFAULT 0,
    producto_mas_vendido_id         BIGINT REFERENCES productos_menu(id),
    cantidad_producto_mas_vendido   INT DEFAULT 0,
    created_at                      TIMESTAMPTZ DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, local_id, fecha)
);
