-- ==========================================
-- 002 — Plataforma: Tenants y Suscripciones
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Tenants (restaurantes que compran el SaaS)
CREATE TABLE IF NOT EXISTS tenants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              VARCHAR(200) NOT NULL,
    slug                VARCHAR(100) UNIQUE NOT NULL,
    ruc                 TEXT,
    correo_contacto     TEXT NOT NULL,
    telefono            TEXT,
    direccion           TEXT,
    logo_url            TEXT,
    color_primario      VARCHAR(7) DEFAULT '#EF4444',
    color_secundario    VARCHAR(7) DEFAULT '#991B1B',
    tipo_restaurante    VARCHAR(50) CHECK(tipo_restaurante IN (
                            'restaurante','polleria','cevicheria','pizzeria',
                            'hamburgueseria','cafeteria','bar','fusion','otro'
                        )),
    estado              VARCHAR(20) DEFAULT 'trial' CHECK(estado IN (
                            'activo','suspendido','cancelado','trial'
                        )),
    dias_trial          INT DEFAULT 14,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Suscripciones (relación tenant-plan)
CREATE TABLE IF NOT EXISTS suscripciones (
    id                          BIGSERIAL PRIMARY KEY,
    tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id                     INT NOT NULL REFERENCES planes(id),
    estado                      VARCHAR(20) DEFAULT 'trial' CHECK(estado IN (
                                    'activa','vencida','cancelada','trial','pausada'
                                )),
    tipo_facturacion            VARCHAR(10) DEFAULT 'mensual' CHECK(tipo_facturacion IN (
                                    'mensual','anual'
                                )),
    fecha_inicio                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_vencimiento           TIMESTAMPTZ NOT NULL,
    fecha_cancelacion           TIMESTAMPTZ,
    precio_pagado               NUMERIC(10,2),
    mercadopago_subscription_id VARCHAR(200),
    renovacion_automatica       BOOLEAN DEFAULT true,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Facturas de la plataforma hacia los tenants
CREATE TABLE IF NOT EXISTS facturas_plataforma (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    suscripcion_id          BIGINT REFERENCES suscripciones(id),
    numero_factura          VARCHAR(50) UNIQUE,
    concepto                TEXT NOT NULL,
    monto                   NUMERIC(10,2) NOT NULL,
    estado                  VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN (
                                'pendiente','pagada','vencida','anulada'
                            )),
    fecha_emision           TIMESTAMPTZ DEFAULT NOW(),
    fecha_vencimiento       TIMESTAMPTZ,
    fecha_pago              TIMESTAMPTZ,
    mercadopago_payment_id  VARCHAR(200),
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de cambios de plan (INMUTABLE)
CREATE TABLE IF NOT EXISTS historial_cambios_plan (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    suscripcion_id      BIGINT REFERENCES suscripciones(id),
    plan_anterior_id    INT REFERENCES planes(id),
    plan_nuevo_id       INT NOT NULL REFERENCES planes(id),
    motivo              VARCHAR(300),
    realizado_por       VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
