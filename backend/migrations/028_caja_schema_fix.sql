DO $$
BEGIN

    -- ================================================================
    -- 1. TURNOS_CAJA - Fix column names to match Go struct
    -- ================================================================

    -- monto_inicial → monto_apertura
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='turnos_caja' AND column_name='monto_inicial'
    ) THEN
        ALTER TABLE turnos_caja RENAME COLUMN monto_inicial TO monto_apertura;
    END IF;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS monto_apertura NUMERIC(12,2) DEFAULT 0;

    -- monto_final_declarado → monto_cierre
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='turnos_caja' AND column_name='monto_final_declarado'
    ) THEN
        ALTER TABLE turnos_caja RENAME COLUMN monto_final_declarado TO monto_cierre;
    END IF;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS monto_cierre NUMERIC(12,2);

    -- monto_final_sistema → monto_esperado
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='turnos_caja' AND column_name='monto_final_sistema'
    ) THEN
        ALTER TABLE turnos_caja RENAME COLUMN monto_final_sistema TO monto_esperado;
    END IF;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS monto_esperado NUMERIC(12,2);

    -- Add new numeric columns
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS diferencia NUMERIC(12,2);
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS total_ventas NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS total_efectivo NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS total_tarjeta NUMERIC(12,2) DEFAULT 0;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS total_otros NUMERIC(12,2) DEFAULT 0;

    -- numero_ordenes → cantidad_ordenes
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='turnos_caja' AND column_name='numero_ordenes'
    ) THEN
        ALTER TABLE turnos_caja RENAME COLUMN numero_ordenes TO cantidad_ordenes;
    END IF;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS cantidad_ordenes INT DEFAULT 0;

    -- notas → observaciones
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='turnos_caja' AND column_name='notas'
    ) THEN
        ALTER TABLE turnos_caja RENAME COLUMN notas TO observaciones;
    END IF;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS observaciones TEXT;

    -- usuario_id may be INT, ensure it exists
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS local_id INT;
    ALTER TABLE turnos_caja ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- Copy local_id from locales if needed
    UPDATE turnos_caja t SET local_id = (
        SELECT l.id FROM locales l WHERE l.tenant_id = t.tenant_id LIMIT 1
    ) WHERE local_id IS NULL;

    -- Recreate FK to usuarios if column type is wrong
    ALTER TABLE turnos_caja ALTER COLUMN usuario_id TYPE INT USING usuario_id::INT;

    -- ================================================================
    -- 2. METODOS_PAGO - Fix to match Go struct
    -- ================================================================

    ALTER TABLE metodos_pago ADD COLUMN IF NOT EXISTS local_id INT;
    ALTER TABLE metodos_pago ADD COLUMN IF NOT EXISTS comision_porcentaje NUMERIC(5,2) DEFAULT 0;
    ALTER TABLE metodos_pago ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    ALTER TABLE metodos_pago ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

    UPDATE metodos_pago SET created_at = NOW() WHERE created_at IS NULL;

    -- ================================================================
    -- 3. PAGOS - Fix to match Go struct
    -- ================================================================

    -- cajero_id → usuario_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pagos' AND column_name='cajero_id'
    ) THEN
        ALTER TABLE pagos RENAME COLUMN cajero_id TO usuario_id;
    END IF;
    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS usuario_id INT;

    -- total_orden → monto_total
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pagos' AND column_name='total_orden'
    ) THEN
        ALTER TABLE pagos RENAME COLUMN total_orden TO monto_total;
    END IF;
    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS monto_total NUMERIC(12,2);

    -- total_pagado → monto_pagado
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pagos' AND column_name='total_pagado'
    ) THEN
        ALTER TABLE pagos RENAME COLUMN total_pagado TO monto_pagado;
    END IF;
    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS monto_pagado NUMERIC(12,2);

    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
    ALTER TABLE pagos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    UPDATE pagos SET updated_at = created_at WHERE updated_at IS NULL;

    -- ================================================================
    -- 4. COMPROBANTES - Fix to match Go struct
    -- ================================================================

    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS orden_id BIGINT;
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2);
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS igv NUMERIC(12,2);
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS total NUMERIC(12,2);
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS fecha_emision TIMESTAMPTZ DEFAULT NOW();

    -- tipo → tipo_comprobante
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='comprobantes' AND column_name='tipo'
    ) THEN
        ALTER TABLE comprobantes RENAME COLUMN tipo TO tipo_comprobante;
    END IF;
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS tipo_comprobante VARCHAR(20);

    -- razon_social_cliente → razon_social
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='comprobantes' AND column_name='razon_social_cliente'
    ) THEN
        ALTER TABLE comprobantes RENAME COLUMN razon_social_cliente TO razon_social;
    END IF;
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS razon_social TEXT;

    -- direccion_cliente → direccion_fiscal
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='comprobantes' AND column_name='direccion_cliente'
    ) THEN
        ALTER TABLE comprobantes RENAME COLUMN direccion_cliente TO direccion_fiscal;
    END IF;
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS direccion_fiscal TEXT;

    -- url_pdf → pdf_url
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='comprobantes' AND column_name='url_pdf'
    ) THEN
        ALTER TABLE comprobantes RENAME COLUMN url_pdf TO pdf_url;
    END IF;
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS pdf_url TEXT;

    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'emitido';
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS hash_sunat TEXT;
    ALTER TABLE comprobantes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

    -- Set CHECK constraint for estado
    ALTER TABLE comprobantes DROP CONSTRAINT IF EXISTS comprobantes_estado_check;
    ALTER TABLE comprobantes ADD CONSTRAINT comprobantes_estado_check
        CHECK (estado IN ('emitido','anulado','rechazado'));

    -- ================================================================
    -- 5. Ensure configuracion_restaurante exists for all locals
    -- ================================================================
    INSERT INTO configuracion_restaurante (tenant_id, local_id)
    SELECT l.tenant_id, l.id
    FROM locales l
    WHERE NOT EXISTS (
        SELECT 1 FROM configuracion_restaurante c
        WHERE c.tenant_id = l.tenant_id AND c.local_id = l.id
    );

END $$;
