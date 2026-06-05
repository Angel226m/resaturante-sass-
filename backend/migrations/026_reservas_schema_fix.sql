-- ==========================================
-- Migration 026: Schema compatibility fix
-- Aligns DB column names with Go struct expectations
-- Covers: reservas, items_orden, tickets_cocina
-- ==========================================

DO $$
BEGIN

    -- ================================================================
    -- 1. RESERVAS
    -- ================================================================

    -- 1a. Time columns: hora_reserva → hora_inicio, add hora_fin
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='reservas' AND column_name='hora_reserva'
    ) THEN
        ALTER TABLE reservas RENAME COLUMN hora_reserva TO hora_inicio;
    END IF;
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS hora_inicio TIME;
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS hora_fin TIME;
    UPDATE reservas SET hora_fin = hora_inicio + INTERVAL '1 hour' WHERE hora_fin IS NULL AND hora_inicio IS NOT NULL;
    ALTER TABLE reservas ALTER COLUMN hora_inicio SET NOT NULL;
    ALTER TABLE reservas ALTER COLUMN hora_fin SET NOT NULL;

    -- 1b. Contact columns rename
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='nombre_reserva') THEN
        ALTER TABLE reservas RENAME COLUMN nombre_reserva TO nombre_contacto;
    END IF;
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(200) NOT NULL DEFAULT '';

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='celular_reserva') THEN
        ALTER TABLE reservas RENAME COLUMN celular_reserva TO telefono_contacto;
    END IF;
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS telefono_contacto TEXT NOT NULL DEFAULT '';

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='correo_reserva') THEN
        ALTER TABLE reservas RENAME COLUMN correo_reserva TO correo_contacto;
    END IF;
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS correo_contacto TEXT;

    -- 1c. Merge notas columns
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS notas TEXT;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='notas_cliente') THEN
        UPDATE reservas SET notas = COALESCE(notas_cliente, '') WHERE notas IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='notas_internas') THEN
        UPDATE reservas SET notas = CONCAT_WS(' | ', notas, notas_internas) WHERE notas_internas IS NOT NULL AND notas_internas != '';
    END IF;

    -- 1d. Add motivo_cancelacion
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;

    -- 1e. Fix estado CHECK constraint to include no_asistio
    ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_estado_check;
    ALTER TABLE reservas ADD CONSTRAINT reservas_estado_check
        CHECK (estado IN ('pendiente','confirmada','sentada','completada','cancelada','no_show','no_asistio'));

    -- 1f. Add deleted_at if missing
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reservas' AND column_name='eliminado') THEN
        EXECUTE 'UPDATE reservas SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
        ALTER TABLE reservas DROP COLUMN IF EXISTS eliminado;
    END IF;

    -- 1g. Add recordatorio_enviado
    ALTER TABLE reservas ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN DEFAULT false;


    -- ================================================================
    -- 2. ITEMS_ORDEN
    -- ================================================================

    -- 2a. producto_id → producto_menu_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='items_orden' AND column_name='producto_id'
    ) THEN
        ALTER TABLE items_orden RENAME COLUMN producto_id TO producto_menu_id;
    END IF;
    ALTER TABLE items_orden ADD COLUMN IF NOT EXISTS producto_menu_id BIGINT;
    ALTER TABLE items_orden ALTER COLUMN producto_menu_id SET NOT NULL;

    -- 2b. descuento_porcentaje + descuento_monto → descuento (single column)
    ALTER TABLE items_orden ADD COLUMN IF NOT EXISTS descuento NUMERIC(12,2) DEFAULT 0;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='items_orden' AND column_name='descuento_porcentaje') THEN
        UPDATE items_orden SET descuento = COALESCE(descuento, descuento_porcentaje, 0) WHERE descuento IS NULL OR descuento = 0;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='items_orden' AND column_name='descuento_monto') THEN
        UPDATE items_orden SET descuento = COALESCE(descuento, descuento_monto, 0) WHERE descuento IS NULL OR descuento = 0;
    END IF;

    -- 2c. Add precio_modificadores
    ALTER TABLE items_orden ADD COLUMN IF NOT EXISTS precio_modificadores NUMERIC(12,2) DEFAULT 0;

    -- 2d. Add updated_at if missing
    ALTER TABLE items_orden ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


    -- ================================================================
    -- 3. TICKETS_COCINA
    -- ================================================================

    -- 3a. estacion → estacion_cocina
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='tickets_cocina' AND column_name='estacion'
    ) THEN
        ALTER TABLE tickets_cocina RENAME COLUMN estacion TO estacion_cocina;
    END IF;
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS estacion_cocina VARCHAR(50);

    -- 3b. Add prioridad
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS prioridad INT DEFAULT 0;

    -- 3c. tiempo_estimado_min → tiempo_estimado
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='tickets_cocina' AND column_name='tiempo_estimado_min'
    ) THEN
        ALTER TABLE tickets_cocina RENAME COLUMN tiempo_estimado_min TO tiempo_estimado;
    END IF;
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS tiempo_estimado INT DEFAULT 0;

    -- 3d. tiempo_inicio_preparacion → fecha_inicio
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='tickets_cocina' AND column_name='tiempo_inicio_preparacion'
    ) THEN
        ALTER TABLE tickets_cocina RENAME COLUMN tiempo_inicio_preparacion TO fecha_inicio;
    END IF;
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMPTZ;

    -- 3e. tiempo_listo → fecha_terminado
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='tickets_cocina' AND column_name='tiempo_listo'
    ) THEN
        ALTER TABLE tickets_cocina RENAME COLUMN tiempo_listo TO fecha_terminado;
    END IF;
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS fecha_terminado TIMESTAMPTZ;

    -- 3f. Add cocinero_id
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS cocinero_id INT REFERENCES usuarios(id);

    -- 3g. Add notas
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS notas TEXT;

    -- 3h. Add updated_at if missing
    ALTER TABLE tickets_cocina ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


    -- ================================================================
    -- 4. MODIFICADORES_ITEM_ORDEN
    -- ================================================================

    -- item_id → item_orden_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='modificadores_item_orden' AND column_name='item_id'
    ) THEN
        ALTER TABLE modificadores_item_orden RENAME COLUMN item_id TO item_orden_id;
    END IF;
    ALTER TABLE modificadores_item_orden ADD COLUMN IF NOT EXISTS item_orden_id BIGINT;

END $$;
