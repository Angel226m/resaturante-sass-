-- ==========================================
-- Migration 022: Fix ordenes table column names
-- Align DB schema with Go struct expectations
-- ==========================================

DO $$
BEGIN

    -- tipo → tipo_orden
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE ordenes RENAME COLUMN tipo TO tipo_orden;
    END IF;

    -- numero_comensales → numero_personas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'numero_comensales'
    ) THEN
        ALTER TABLE ordenes RENAME COLUMN numero_comensales TO numero_personas;
    END IF;

    -- descuento_total → descuento
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'descuento_total'
    ) THEN
        ALTER TABLE ordenes RENAME COLUMN descuento_total TO descuento;
    END IF;

    -- nota_general → notas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'nota_general'
    ) THEN
        ALTER TABLE ordenes RENAME COLUMN nota_general TO notas;
    END IF;

    -- fecha_cierre → fecha_completada
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'ordenes' AND column_name = 'fecha_cierre'
    ) THEN
        ALTER TABLE ordenes RENAME COLUMN fecha_cierre TO fecha_completada;
    END IF;

    -- Add missing columns
    ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS promocion_id  BIGINT;
    ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS cupon_id      BIGINT;
    ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS tiempo_estimado INT DEFAULT 0;

END $$;
