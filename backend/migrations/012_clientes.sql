-- ==========================================
-- 012 — Clientes y Direcciones
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Clientes del restaurante
CREATE TABLE IF NOT EXISTS clientes (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id            INT NOT NULL REFERENCES locales(id) ON DELETE CASCADE,
    nombres             VARCHAR(200) NOT NULL,
    apellidos           VARCHAR(200),
    tipo_documento      VARCHAR(20) CHECK(tipo_documento IN (
                            'DNI','CE','Pasaporte','RUC'
                        )),
    correo_cifrado      TEXT,
    celular_cifrado     TEXT,
    documento_cifrado   TEXT,
    fecha_nacimiento    DATE,
    genero              VARCHAR(20),
    total_compras       NUMERIC(14,2) DEFAULT 0,
    cantidad_visitas    INT DEFAULT 0,
    ultima_visita       TIMESTAMPTZ,
    notas               TEXT,
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar FK de cupones.cliente_id ahora que la tabla existe
ALTER TABLE cupones ADD CONSTRAINT fk_cupones_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id);

-- Direcciones de cliente (para delivery)
CREATE TABLE IF NOT EXISTS direcciones_cliente (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cliente_id      BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    etiqueta        VARCHAR(50) DEFAULT 'Mi dirección',
    direccion       TEXT NOT NULL,
    referencia      TEXT,
    distrito        VARCHAR(100),
    latitud         NUMERIC(10,6),
    longitud        NUMERIC(10,6),
    es_principal    BOOLEAN DEFAULT false,
    activo          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
