-- ==========================================
-- 018 — Audit Log
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Registro de auditoría (INMUTABLE)
CREATE TABLE IF NOT EXISTS audit_log (
    id                  BIGSERIAL PRIMARY KEY,
    tenant_id           UUID,
    usuario_id          INT,
    superadmin_id       INT,
    accion              VARCHAR(100) NOT NULL,
    tabla_afectada      VARCHAR(100),
    registro_id         VARCHAR(100),
    datos_anteriores    JSONB,
    datos_nuevos        JSONB,
    ip_origen           INET,
    user_agent          TEXT,
    metodo_http         VARCHAR(10),
    path                TEXT,
    status_code         INT,
    duracion_ms         INT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
