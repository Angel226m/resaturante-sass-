-- ==========================================
-- 015 — Caja y Pagos
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Turnos de caja (sesión por cajero/local/día)
CREATE TABLE IF NOT EXISTS turnos_caja (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id                INT NOT NULL REFERENCES locales(id),
    usuario_id              INT NOT NULL REFERENCES usuarios(id),
    estado                  VARCHAR(20) DEFAULT 'abierto' CHECK(estado IN (
                                'abierto','cerrado'
                            )),
    fecha_apertura          TIMESTAMPTZ DEFAULT NOW(),
    fecha_cierre            TIMESTAMPTZ,
    monto_inicial           NUMERIC(12,2) DEFAULT 0,
    monto_final_declarado   NUMERIC(12,2),
    monto_final_sistema     NUMERIC(12,2),
    diferencia              NUMERIC(12,2),
    total_ventas            NUMERIC(12,2) DEFAULT 0,
    total_propinas          NUMERIC(12,2) DEFAULT 0,
    numero_ordenes          INT DEFAULT 0,
    notas                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar FK de ordenes.turno_caja_id ahora
ALTER TABLE ordenes ADD CONSTRAINT fk_ordenes_turno_caja
    FOREIGN KEY (turno_caja_id) REFERENCES turnos_caja(id);

-- Métodos de pago configurables por tenant
CREATE TABLE IF NOT EXISTS metodos_pago (
    id                  SERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre              VARCHAR(100) NOT NULL,
    tipo                VARCHAR(30) NOT NULL CHECK(tipo IN (
                            'efectivo','yape','plin','tarjeta_credito','tarjeta_debito',
                            'transferencia','mercadopago','credito_cliente','otro'
                        )),
    requiere_referencia BOOLEAN DEFAULT false,
    activo              BOOLEAN DEFAULT true,
    orden_display       INT DEFAULT 0,
    UNIQUE(tenant_id, nombre)
);

-- Pagos (pago de una orden completa)
CREATE TABLE IF NOT EXISTS pagos (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    orden_id        BIGINT NOT NULL REFERENCES ordenes(id),
    turno_caja_id   BIGINT REFERENCES turnos_caja(id),
    cajero_id       INT NOT NULL REFERENCES usuarios(id),
    total_orden     NUMERIC(12,2) NOT NULL,
    total_pagado    NUMERIC(12,2) NOT NULL,
    propina         NUMERIC(12,2) DEFAULT 0,
    vuelto          NUMERIC(12,2) DEFAULT 0,
    estado          VARCHAR(20) DEFAULT 'completado' CHECK(estado IN (
                        'completado','parcial','anulado','devuelto'
                    )),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Detalle de pagos (split bill — múltiples métodos, INMUTABLE)
CREATE TABLE IF NOT EXISTS detalle_pagos (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pago_id         BIGINT NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
    metodo_pago_id  INT NOT NULL REFERENCES metodos_pago(id),
    monto           NUMERIC(12,2) NOT NULL,
    referencia      VARCHAR(200),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Comprobantes (ticket, boleta, factura)
CREATE TABLE IF NOT EXISTS comprobantes (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pago_id                 BIGINT NOT NULL REFERENCES pagos(id),
    tipo                    VARCHAR(20) DEFAULT 'ticket' CHECK(tipo IN (
                                'ticket','boleta','factura','nota_venta'
                            )),
    serie                   VARCHAR(10),
    numero                  VARCHAR(20),
    ruc_cliente             TEXT,
    razon_social_cliente    TEXT,
    direccion_cliente       TEXT,
    url_pdf                 TEXT,
    enviado_por_email       BOOLEAN DEFAULT false,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);
