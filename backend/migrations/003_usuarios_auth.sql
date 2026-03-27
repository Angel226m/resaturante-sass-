-- ==========================================
-- 003 — Usuarios y Auth
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Usuarios de cada tenant (meseros, cajeros, cocineros, etc.)
CREATE TABLE IF NOT EXISTS usuarios (
    id                      SERIAL PRIMARY KEY,
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    local_id                INT,
    nombre                  VARCHAR(100) NOT NULL,
    apellidos               VARCHAR(100) NOT NULL,
    correo                  TEXT NOT NULL,
    numero_celular          TEXT,
    contrasena              VARCHAR(200) NOT NULL,
    rol                     VARCHAR(20) NOT NULL CHECK(rol IN (
                                'OWNER','ADMIN','GERENTE','CAJERO',
                                'MESERO','COCINERO','ALMACENERO','REPARTIDOR'
                            )),
    pin_acceso              VARCHAR(6),
    avatar_url              TEXT,
    color_identificacion    VARCHAR(7),
    activo                  BOOLEAN DEFAULT true,
    eliminado               BOOLEAN DEFAULT false,
    ultimo_login            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- SuperAdmins de la plataforma (tabla separada, no pertenecen a ningún tenant)
CREATE TABLE IF NOT EXISTS superadmins (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellidos           VARCHAR(100) NOT NULL,
    correo              TEXT NOT NULL UNIQUE,
    numero_celular      TEXT,
    contrasena          VARCHAR(200) NOT NULL,
    nivel               VARCHAR(20) DEFAULT 'admin' CHECK(nivel IN (
                            'superadmin','admin','soporte'
                        )),
    activo              BOOLEAN DEFAULT true,
    eliminado           BOOLEAN DEFAULT false,
    ultimo_login        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens de recuperación, verificación e invitación
CREATE TABLE IF NOT EXISTS tokens_recuperacion (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id      INT,
    superadmin_id   INT,
    token           VARCHAR(200) NOT NULL UNIQUE,
    tipo            VARCHAR(20) DEFAULT 'recuperacion' CHECK(tipo IN (
                        'recuperacion','verificacion','invitacion'
                    )),
    usado           BOOLEAN DEFAULT false,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
