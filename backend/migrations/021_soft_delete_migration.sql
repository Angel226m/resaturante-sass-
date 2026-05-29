-- ==========================================
-- Migration 021: Soft Delete (eliminado bool -> deleted_at TIMESTAMPTZ)
-- RestauFlow SaaS Multi-Tenant
-- Patron: deleted_at IS NULL = activo, deleted_at = timestamp = eliminado
-- Usa EXECUTE dinamico para no fallar si la columna eliminado no existe
-- ==========================================

DO $$
BEGIN

    -- ============ USUARIOS ============
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE usuarios SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE usuarios DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='usuarios' AND indexname='idx_usuarios_deleted_at') THEN
        CREATE INDEX idx_usuarios_deleted_at ON usuarios(tenant_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ SUPERADMINS ============
    ALTER TABLE superadmins ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='superadmins' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE superadmins SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE superadmins DROP COLUMN IF EXISTS eliminado;

    -- ============ TENANTS ============
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tenants' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE tenants SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE tenants DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='tenants' AND indexname='idx_tenants_deleted_at') THEN
        CREATE INDEX idx_tenants_deleted_at ON tenants(id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ LOCALES ============
    ALTER TABLE locales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='locales' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE locales SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE locales DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='locales' AND indexname='idx_locales_deleted_at') THEN
        CREATE INDEX idx_locales_deleted_at ON locales(tenant_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ ZONAS ============
    ALTER TABLE zonas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='zonas' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE zonas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE zonas DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='zonas' AND indexname='idx_zonas_deleted_at') THEN
        CREATE INDEX idx_zonas_deleted_at ON zonas(tenant_id, local_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ MESAS ============
    ALTER TABLE mesas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='mesas' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE mesas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE mesas DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='mesas' AND indexname='idx_mesas_deleted_at') THEN
        CREATE INDEX idx_mesas_deleted_at ON mesas(tenant_id, local_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ CATEGORIAS MENU ============
    ALTER TABLE categorias_menu ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categorias_menu' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE categorias_menu SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE categorias_menu DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='categorias_menu' AND indexname='idx_categorias_menu_deleted_at') THEN
        CREATE INDEX idx_categorias_menu_deleted_at ON categorias_menu(tenant_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ PRODUCTOS MENU ============
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='productos_menu' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE productos_menu SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE productos_menu DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='productos_menu' AND indexname='idx_productos_menu_deleted_at') THEN
        CREATE INDEX idx_productos_menu_deleted_at ON productos_menu(tenant_id, local_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ GRUPOS MODIFICADORES ============
    ALTER TABLE grupos_modificadores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='grupos_modificadores' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE grupos_modificadores SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE grupos_modificadores DROP COLUMN IF EXISTS eliminado;

    -- ============ COMBOS ============
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='combos' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE combos SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE combos DROP COLUMN IF EXISTS eliminado;

    -- ============ PROMOCIONES ============
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='promociones' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE promociones SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE promociones DROP COLUMN IF EXISTS eliminado;

    -- ============ CUPONES ============
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cupones' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE cupones SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE cupones DROP COLUMN IF EXISTS eliminado;

    -- ============ CLIENTES ============
    ALTER TABLE clientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clientes' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE clientes SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE clientes DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='clientes' AND indexname='idx_clientes_deleted_at') THEN
        CREATE INDEX idx_clientes_deleted_at ON clientes(tenant_id, local_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ RESERVAS ============
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE reservas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE reservas DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='reservas' AND indexname='idx_reservas_deleted_at') THEN
        CREATE INDEX idx_reservas_deleted_at ON reservas(tenant_id, local_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ ORDENES ============
    ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='ordenes' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE ordenes SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE ordenes DROP COLUMN IF EXISTS eliminado;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='ordenes' AND indexname='idx_ordenes_deleted_at') THEN
        CREATE INDEX idx_ordenes_deleted_at ON ordenes(tenant_id, local_id) WHERE deleted_at IS NULL;
    END IF;

    -- ============ PAGOS ============
    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pagos' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE pagos SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE pagos DROP COLUMN IF EXISTS eliminado;

    -- ============ METODOS DE PAGO ============
    ALTER TABLE metodos_pago ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='metodos_pago' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE metodos_pago SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE metodos_pago DROP COLUMN IF EXISTS eliminado;

    -- ============ COMPROBANTES ============
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comprobantes' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE comprobantes SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;
    ALTER TABLE comprobantes DROP COLUMN IF EXISTS eliminado;

END $$;
