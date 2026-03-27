-- ==========================================
-- 013 — Reservas
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id                      BIGSERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id                INT NOT NULL REFERENCES locales(id),
    mesa_id                 INT REFERENCES mesas(id),
    cliente_id              BIGINT REFERENCES clientes(id),
    usuario_asignador_id    INT REFERENCES usuarios(id),
    nombre_reserva          VARCHAR(200) NOT NULL,
    celular_reserva         TEXT NOT NULL,
    correo_reserva          TEXT,
    numero_personas         INT NOT NULL,
    fecha_reserva           DATE NOT NULL,
    hora_reserva            TIME NOT NULL,
    estado                  VARCHAR(20) DEFAULT 'pendiente' CHECK(estado IN (
                                'pendiente','confirmada','sentada',
                                'completada','cancelada','no_show'
                            )),
    ocasion                 VARCHAR(50) CHECK(ocasion IN (
                                'cumpleanos','aniversario','negocios','familiar','otro'
                            )),
    notas_cliente           TEXT,
    notas_internas          TEXT,
    codigo_confirmacion     VARCHAR(20) UNIQUE,
    recordatorio_enviado    BOOLEAN DEFAULT false,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de estados de reserva (INMUTABLE)
CREATE TABLE IF NOT EXISTS historial_estados_reserva (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reserva_id      BIGINT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo    VARCHAR(20) NOT NULL,
    usuario_id      INT REFERENCES usuarios(id),
    motivo          TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
