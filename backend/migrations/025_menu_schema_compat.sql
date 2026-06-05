-- ==========================================
-- Migration 025: Menu schema compatibility
-- Alinea columnas esperadas por backend actual
-- ==========================================

DO $$
BEGIN
    -- ===============================
    -- categorias_menu
    -- ===============================
    ALTER TABLE categorias_menu ADD COLUMN IF NOT EXISTS local_id INT;

    ALTER TABLE categorias_menu ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='categorias_menu' AND column_name='eliminado'
    ) THEN
        EXECUTE 'UPDATE categorias_menu SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;

    -- ===============================
    -- productos_menu
    -- ===============================
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS categoria_menu_id INT;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS precio_base NUMERIC(12,2);
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS imagen_url TEXT;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS tiempo_preparacion INT;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS alergenos TEXT;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS es_gluten_free BOOLEAN DEFAULT false;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS es_popular BOOLEAN DEFAULT false;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS es_nuevo BOOLEAN DEFAULT false;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS orden INT DEFAULT 0;
    ALTER TABLE productos_menu ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

    UPDATE productos_menu
    SET
        categoria_menu_id = COALESCE(categoria_menu_id, categoria_id),
        precio_base = COALESCE(precio_base, precio),
        imagen_url = COALESCE(imagen_url, imagen_principal_url),
        tiempo_preparacion = COALESCE(tiempo_preparacion, tiempo_preparacion_min),
        alergenos = COALESCE(alergenos, contiene_alergenos),
        es_gluten_free = COALESCE(es_gluten_free, es_sin_gluten, false),
        es_popular = COALESCE(es_popular, destacado, false),
        es_nuevo = COALESCE(es_nuevo, false),
        disponible = COALESCE(disponible, (disponible_para_mesa OR disponible_para_llevar OR disponible_para_delivery), true),
        orden = COALESCE(orden, orden_display, 0)
    WHERE
        categoria_menu_id IS NULL
        OR precio_base IS NULL
        OR imagen_url IS NULL
        OR tiempo_preparacion IS NULL
        OR alergenos IS NULL
        OR orden IS NULL;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='productos_menu' AND column_name='eliminado'
    ) THEN
        EXECUTE 'UPDATE productos_menu SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;

    -- ===============================
    -- variantes_producto_menu
    -- ===============================
    ALTER TABLE variantes_producto_menu ADD COLUMN IF NOT EXISTS producto_menu_id BIGINT;
    ALTER TABLE variantes_producto_menu ADD COLUMN IF NOT EXISTS precio_adicional NUMERIC(12,2);
    ALTER TABLE variantes_producto_menu ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;
    ALTER TABLE variantes_producto_menu ADD COLUMN IF NOT EXISTS orden INT DEFAULT 0;

    UPDATE variantes_producto_menu
    SET
        producto_menu_id = COALESCE(producto_menu_id, producto_id),
        precio_adicional = COALESCE(precio_adicional, precio),
        disponible = COALESCE(disponible, true),
        orden = COALESCE(orden, 0)
    WHERE producto_menu_id IS NULL OR precio_adicional IS NULL;

    -- ===============================
    -- detalle_combos
    -- ===============================
    ALTER TABLE detalle_combos ADD COLUMN IF NOT EXISTS producto_menu_id BIGINT;
    UPDATE detalle_combos SET producto_menu_id = COALESCE(producto_menu_id, producto_id) WHERE producto_menu_id IS NULL;

    -- ===============================
    -- combos
    -- ===============================
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS local_id INT;
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS precio_combo NUMERIC(12,2);
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMPTZ;
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;
    ALTER TABLE combos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

    UPDATE combos
    SET
        precio_combo = COALESCE(precio_combo, precio),
        fecha_inicio = COALESCE(fecha_inicio, disponible_desde),
        fecha_fin = COALESCE(fecha_fin, disponible_hasta),
        disponible = COALESCE(disponible, true)
    WHERE precio_combo IS NULL OR fecha_inicio IS NULL OR fecha_fin IS NULL;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='combos' AND column_name='eliminado'
    ) THEN
        EXECUTE 'UPDATE combos SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;

    -- ===============================
    -- promociones
    -- ===============================
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS local_id INT;
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS tipo_descuento VARCHAR(30);
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS valor_descuento NUMERIC(10,2);
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS dias_aplicables VARCHAR(20);
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS producto_menu_id BIGINT;
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS usos_maximos INT;
    ALTER TABLE promociones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

    UPDATE promociones
    SET
        tipo_descuento = COALESCE(tipo_descuento,
            CASE
                WHEN tipo IN ('descuento_porcentaje') THEN 'porcentaje'
                ELSE 'monto'
            END
        ),
        valor_descuento = COALESCE(valor_descuento, valor, 0),
        dias_aplicables = COALESCE(dias_aplicables, dias_semana),
        producto_menu_id = COALESCE(producto_menu_id, producto_id),
        usos_maximos = COALESCE(usos_maximos, uso_maximo, 0)
    WHERE tipo_descuento IS NULL OR valor_descuento IS NULL;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='promociones' AND column_name='eliminado'
    ) THEN
        EXECUTE 'UPDATE promociones SET deleted_at = NOW() WHERE eliminado = true AND deleted_at IS NULL';
    END IF;

    -- ===============================
    -- cupones
    -- ===============================
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS local_id INT;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS descripcion TEXT;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS tipo_descuento VARCHAR(20);
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS valor_descuento NUMERIC(10,2);
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS monto_minimo NUMERIC(10,2);
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS monto_max_descuento NUMERIC(10,2);
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMPTZ;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS usos_maximos INT;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS usos_por_cliente INT;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS usos_actuales INT;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    ALTER TABLE cupones ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    UPDATE cupones
    SET
        tipo_descuento = COALESCE(tipo_descuento, 'monto'),
        valor_descuento = COALESCE(valor_descuento, 0),
        monto_minimo = COALESCE(monto_minimo, 0),
        monto_max_descuento = COALESCE(monto_max_descuento, 0),
        fecha_inicio = COALESCE(fecha_inicio, created_at),
        fecha_fin = COALESCE(fecha_fin, expires_at, created_at + INTERVAL '100 years'),
        usos_maximos = COALESCE(usos_maximos, 0),
        usos_por_cliente = COALESCE(usos_por_cliente, 1),
        usos_actuales = COALESCE(usos_actuales, CASE WHEN usado THEN 1 ELSE 0 END, 0),
        activo = COALESCE(activo, true),
        updated_at = COALESCE(updated_at, NOW())
    WHERE
        tipo_descuento IS NULL
        OR valor_descuento IS NULL
        OR fecha_inicio IS NULL
        OR fecha_fin IS NULL
        OR usos_actuales IS NULL;
END $$;

-- Índices de compatibilidad
CREATE INDEX IF NOT EXISTS idx_categorias_menu_tenant_local_deleted ON categorias_menu(tenant_id, local_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_productos_menu_tenant_local_deleted ON productos_menu(tenant_id, local_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_combos_tenant_local_deleted ON combos(tenant_id, local_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_promociones_tenant_local_deleted ON promociones(tenant_id, local_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_cupones_tenant_local_deleted ON cupones(tenant_id, local_id, deleted_at);
