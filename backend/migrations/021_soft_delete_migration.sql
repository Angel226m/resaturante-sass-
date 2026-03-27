-- ==========================================
-- Migration 021: Soft Delete (eliminado bool → deleted_at TIMESTAMPTZ)
-- RestauFlow SaaS Multi-Tenant
-- Patrón: deleted_at IS NULL = activo, deleted_at = timestamp = eliminado
-- ==========================================

-- ============ USUARIOS ============
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE usuarios SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE usuarios DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_usuarios_deleted_at ON usuarios(tenant_id) WHERE deleted_at IS NULL;

-- ============ SUPERADMINS ============
ALTER TABLE superadmins ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE superadmins SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE superadmins DROP COLUMN IF EXISTS eliminado;

-- ============ TENANTS ============
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE tenants SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE tenants DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(id) WHERE deleted_at IS NULL;

-- ============ LOCALES ============
ALTER TABLE locales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE locales SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE locales DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_locales_deleted_at ON locales(tenant_id) WHERE deleted_at IS NULL;

-- ============ ZONAS ============
ALTER TABLE zonas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE zonas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE zonas DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_zonas_deleted_at ON zonas(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ MESAS ============
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE mesas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE mesas DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_mesas_deleted_at ON mesas(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ CATEGORIAS MENÚ ============
ALTER TABLE categorias_menu ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE categorias_menu SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE categorias_menu DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_categorias_menu_deleted_at ON categorias_menu(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ PRODUCTOS MENÚ ============
ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE productos_menu SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE productos_menu DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_productos_menu_deleted_at ON productos_menu(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ GRUPOS MODIFICADORES ============
ALTER TABLE grupos_modificadores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE grupos_modificadores SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE grupos_modificadores DROP COLUMN IF EXISTS eliminado;

-- ============ COMBOS ============
ALTER TABLE combos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE combos SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE combos DROP COLUMN IF EXISTS eliminado;

-- ============ PROMOCIONES ============
ALTER TABLE promociones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE promociones SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE promociones DROP COLUMN IF EXISTS eliminado;

-- ============ CUPONES ============
ALTER TABLE cupones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE cupones SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE cupones DROP COLUMN IF EXISTS eliminado;

-- ============ CLIENTES ============
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE clientes SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE clientes DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_clientes_deleted_at ON clientes(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ RESERVAS ============
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE reservas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE reservas DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_reservas_deleted_at ON reservas(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ ORDENES ============
ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE ordenes SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE ordenes DROP COLUMN IF EXISTS eliminado;
CREATE INDEX IF NOT EXISTS idx_ordenes_deleted_at ON ordenes(tenant_id, local_id) WHERE deleted_at IS NULL;

-- ============ PAGOS ============
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE pagos SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE pagos DROP COLUMN IF EXISTS eliminado;

-- ============ MÉTODOS DE PAGO ============
ALTER TABLE metodos_pago ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE metodos_pago SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE metodos_pago DROP COLUMN IF EXISTS eliminado;

-- ============ COMPROBANTES ============
ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
UPDATE comprobantes SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS eliminado;

-- ============ ACTUALIZAR RLS POLICIES ============
-- Recrear las políticas RLS para usar deleted_at IS NULL en lugar de eliminado = false
-- (Las políticas existentes serán actualizadas al aplicar esta migración)

