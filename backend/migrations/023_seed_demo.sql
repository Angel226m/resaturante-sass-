-- ==========================================
-- Migration 023: Seed demo data
-- Tenant "demo" + users, menu, orders (last 7 days)
-- Idempotent via "WHERE NOT EXISTS" guards
-- ==========================================

-- ── SuperAdmin ──────────────────────────────────────────────────────────────
-- Password: SuperAdmin1!   (bcrypt cost 14)
INSERT INTO superadmins (nombre, apellidos, correo, contrasena, nivel, activo)
SELECT 'Super', 'Admin', 'superadmin@restauflow.com',
       '$2b$14$HlLUBu6dkiVnSsfFWaRzJOrX9ah/XGCJuwkc6jR2seHaisECJAPje', 'superadmin', true
WHERE NOT EXISTS (
    SELECT 1 FROM superadmins WHERE correo = 'superadmin@restauflow.com'
);

-- ── Tenant ──────────────────────────────────────────────────────────────────
INSERT INTO tenants (id, nombre, slug, correo_contacto, tipo_restaurante, estado, dias_trial)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    'RestauDemo',
    'demo',
    'demo@restauflow.com',
    'restaurante',
    'activo',
    0
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'demo');

-- ── Suscripción (Plan Pro) ───────────────────────────────────────────────────
INSERT INTO suscripciones (tenant_id, plan_id, estado, tipo_facturacion, fecha_inicio, fecha_vencimiento, renovacion_automatica)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    2,
    'activa',
    'mensual',
    NOW(),
    NOW() + INTERVAL '1 year',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM suscripciones WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
);

-- ── Local ────────────────────────────────────────────────────────────────────
INSERT INTO locales (tenant_id, nombre, direccion, distrito, provincia, departamento,
                     es_principal, numero_pisos, horario_apertura, horario_cierre,
                     acepta_reservas, acepta_delivery)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Sede Central',
    'Av. Principal 123',
    'Miraflores',
    'Lima',
    'Lima',
    true, 1,
    '08:00'::time, '22:00'::time,
    true, true
WHERE NOT EXISTS (
    SELECT 1 FROM locales WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
);

-- ── Zona ─────────────────────────────────────────────────────────────────────
INSERT INTO zonas (tenant_id, local_id, nombre, piso, color, orden)
SELECT t.tenant_id, t.id, 'Salón Principal', 1, '#0d9488', 1
FROM locales t WHERE t.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM zonas z WHERE z.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- ── Mesas (12 mesas) ─────────────────────────────────────────────────────────
INSERT INTO mesas (tenant_id, local_id, zona_id, numero, capacidad, estado, forma, posicion_x, posicion_y)
SELECT
    l.tenant_id,
    l.id,
    z.id,
    nums.n::varchar,
    CASE WHEN nums.n <= 4 THEN 2 WHEN nums.n <= 8 THEN 4 ELSE 6 END,
    'disponible',
    CASE WHEN nums.n <= 4 THEN 'cuadrada' WHEN nums.n <= 8 THEN 'rectangular' ELSE 'redonda' END,
    ((nums.n - 1) % 4) * 120,
    ((nums.n - 1) / 4) * 100
FROM locales l
JOIN zonas z ON z.local_id = l.id AND z.tenant_id = l.tenant_id
CROSS JOIN generate_series(1, 12) AS nums(n)
WHERE l.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM mesas m WHERE m.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- ── Usuarios ─────────────────────────────────────────────────────────────────
-- admin@demo.com / Admin1234!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    l.id,
    'Carlos', 'García',
    'admin@demo.com',
    '$2b$14$ZQdT1z0G9cThhIN2OGhtyeuIfqnysVhVL7vFwxAuyYSYtNaAyHCs6',
    'ADMIN', '1111', '#0d9488', true
FROM locales l WHERE l.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM usuarios WHERE correo = 'admin@demo.com'
        AND tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- mesero@demo.com / Mesero123!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    l.id,
    'María', 'López',
    'mesero@demo.com',
    '$2b$14$.n3yGULxzRPDC6zgkOL9deLI7C6rq07KCmeq9.u25J8s.ejH/ZjFO',
    'MESERO', '2222', '#3b82f6', true
FROM locales l WHERE l.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM usuarios WHERE correo = 'mesero@demo.com'
        AND tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- cocinero@demo.com / Cocin1234!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    l.id,
    'Pedro', 'Ramírez',
    'cocinero@demo.com',
    '$2b$14$4tvCzLrjbNhOIDjPy48gjuY41UYPVzq4NlOEi38LaUDOgNvlOLoSq',
    'COCINERO', '3333', '#f59e0b', true
FROM locales l WHERE l.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM usuarios WHERE correo = 'cocinero@demo.com'
        AND tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- cajero@demo.com / Cajero123!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    l.id,
    'Luis', 'Torres',
    'cajero@demo.com',
    '$2b$14$gTroax63z46rrn52JW4MQeNKLbWZVgKb.9Zi0zqa0E/C87lBfTTUO',
    'CAJERO', '4444', '#8b5cf6', true
FROM locales l WHERE l.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM usuarios WHERE correo = 'cajero@demo.com'
        AND tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- ── Categorías del Menú ───────────────────────────────────────────────────────
INSERT INTO categorias_menu (tenant_id, nombre, slug, orden, activo)
SELECT '11111111-1111-1111-1111-111111111111'::uuid, cat.nombre, cat.slug, cat.ord, true
FROM (VALUES
    ('Entradas',         'entradas',         1),
    ('Platos de Fondo',  'platos-de-fondo',  2),
    ('Mariscos',         'mariscos',         3),
    ('Postres',          'postres',          4),
    ('Bebidas',          'bebidas',          5)
) AS cat(nombre, slug, ord)
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_menu WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
);

-- ── Productos del Menú ────────────────────────────────────────────────────────
INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    l.id,
    c.id,
    p.nombre,
    p."desc",
    p.precio,
    p.tiempo,
    true,
    p.ord,
    p.dest
FROM locales l
CROSS JOIN (VALUES
    -- Entradas (cat slug: entradas)
    ('entradas',        'Causa Limeña',          'Causa rellena de pollo o atún',                  20.00, 10, 1, true),
    ('entradas',        'Tequeños',               'Tequeños con queso derretido (6 und)',            18.00, 12, 2, false),
    ('entradas',        'Papa a la Huancaína',    'Papa sancochada con salsa huancaína',             16.00,  8, 3, false),
    -- Platos de Fondo
    ('platos-de-fondo', 'Lomo Saltado',           'Lomo fino con papas fritas y arroz',             38.00, 20, 1, true),
    ('platos-de-fondo', 'Pollo a la Brasa ½',     'Medio pollo a la brasa con guarnición',          35.00, 35, 2, true),
    ('platos-de-fondo', 'Ají de Gallina',          'Gallina en salsa de ají amarillo con arroz',     32.00, 20, 3, false),
    ('platos-de-fondo', 'Seco de Res',             'Seco de res con frijoles y arroz',               34.00, 25, 4, false),
    ('platos-de-fondo', 'Arroz con Leche de Coco','Arroz con mariscos en leche de coco',            42.00, 25, 5, false),
    -- Mariscos
    ('mariscos',        'Ceviche Clásico',         'Ceviche de pescado con leche de tigre',          45.00, 15, 1, true),
    ('mariscos',        'Tiradito',                'Tiradito de pescado en salsa amarilla',          42.00, 12, 2, false),
    ('mariscos',        'Arroz con Mariscos',      'Arroz con mix de mariscos frescos',              55.00, 30, 3, true),
    -- Postres
    ('postres',         'Picarones',               'Picarones con miel de caña',                     14.00, 15, 1, false),
    ('postres',         'Suspiro a la Limeña',     'Dulce tradicional limeño',                       12.00,  5, 2, false),
    -- Bebidas
    ('bebidas',         'Chicha Morada',            'Chicha morada helada 1 litro',                   12.00,  3, 1, false),
    ('bebidas',         'Inca Kola 600ml',          'Inca Kola individual',                            8.00,  1, 2, false)
) AS p(cat_slug, nombre, "desc", precio, tiempo, ord, dest)
JOIN categorias_menu c ON c.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid AND c.slug = p.cat_slug
WHERE l.tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  AND NOT EXISTS (
      SELECT 1 FROM productos_menu WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid
  );

-- ═══════════════════════════════════════════════════════════
-- Seed órdenes: 7 días de historial + órdenes de hoy
-- Usa generate_series para crear órdenes realistas por día
-- ═══════════════════════════════════════════════════════════
DO $$
DECLARE
    v_tenant    UUID   := '11111111-1111-1111-1111-111111111111'::uuid;
    v_local_id  INT;
    v_mesero_id INT;
    v_cajero_id INT;
    v_prod      RECORD;
    v_day_offset INT;
    v_ord_idx    INT;
    v_order_id   BIGINT;
    v_numero     VARCHAR(50);
    v_total      NUMERIC;
    v_hora       INT;
    v_mesa_id    INT;
    v_tipo       VARCHAR(20);
    v_subtotal   NUMERIC;
    v_qty        INT;
    v_precio     NUMERIC;
    prod_ids     BIGINT[];
    prod_prices  NUMERIC[];
    n_prods      INT;
    p_idx        INT;
BEGIN
    -- Skip if orders already seeded
    IF EXISTS (SELECT 1 FROM ordenes WHERE tenant_id = v_tenant) THEN
        RETURN;
    END IF;

    SELECT id INTO v_local_id  FROM locales  WHERE tenant_id = v_tenant LIMIT 1;
    SELECT id INTO v_mesero_id FROM usuarios WHERE tenant_id = v_tenant AND rol = 'MESERO' LIMIT 1;
    SELECT id INTO v_cajero_id FROM usuarios WHERE tenant_id = v_tenant AND rol = 'CAJERO'  LIMIT 1;

    -- Collect product ids and prices
    SELECT
        ARRAY_AGG(id ORDER BY id),
        ARRAY_AGG(precio ORDER BY id)
    INTO prod_ids, prod_prices
    FROM productos_menu
    WHERE tenant_id = v_tenant AND activo = true;

    n_prods := array_length(prod_ids, 1);
    IF n_prods IS NULL OR n_prods = 0 THEN RETURN; END IF;

    -- ── Past 6 days + today (offset 6..0) ──
    FOR v_day_offset IN REVERSE 6..0 LOOP
        -- 8–14 orders per day
        FOR v_ord_idx IN 1..( 8 + (v_day_offset % 3) * 2 ) LOOP

            -- Rotate through types: 60% mesa, 25% para_llevar, 15% delivery
            v_tipo := CASE
                        WHEN (v_ord_idx % 10) IN (1,2,3,4,5,6) THEN 'mesa'
                        WHEN (v_ord_idx % 10) IN (7,8,9)        THEN 'para_llevar'
                        ELSE                                        'delivery'
                      END;

            -- Pick a mesa for mesa orders
            v_mesa_id := NULL;
            IF v_tipo = 'mesa' THEN
                SELECT id INTO v_mesa_id
                FROM mesas
                WHERE tenant_id = v_tenant AND local_id = v_local_id
                ORDER BY id
                LIMIT 1 OFFSET (v_ord_idx % 12);
            END IF;

            -- Distribute orders over lunch (11-15) and dinner (18-22)
            v_hora := CASE
                WHEN v_ord_idx % 2 = 0 THEN 11 + (v_ord_idx % 5)
                ELSE                        18 + (v_ord_idx % 4)
            END;

            v_numero := 'ORD-' || TO_CHAR(CURRENT_DATE - v_day_offset, 'YYYYMMDD')
                        || '-' || LPAD(v_ord_idx::text, 3, '0');

            -- Pick 1-3 products for this order
            v_total := 0;
            INSERT INTO ordenes (
                tenant_id, local_id, mesa_id, mesero_id,
                numero_orden, numero_personas, tipo_orden, estado,
                subtotal, descuento, igv, total,
                notas, fecha_completada,
                created_at, updated_at
            ) VALUES (
                v_tenant, v_local_id, v_mesa_id, v_mesero_id,
                v_numero, 2, v_tipo, 'pagada',
                0, 0, 0, 0,
                '', (CURRENT_DATE - v_day_offset) + (v_hora + 1) * INTERVAL '1 hour',
                (CURRENT_DATE - v_day_offset) + v_hora * INTERVAL '1 hour',
                (CURRENT_DATE - v_day_offset) + v_hora * INTERVAL '1 hour'
            ) RETURNING id INTO v_order_id;

            -- Insert 1-3 items
            FOR p_idx IN 1..( 1 + (v_ord_idx % 3) ) LOOP
                -- Pick product by cycling through array
                v_qty    := 1 + (p_idx % 2);
                v_precio := prod_prices[ (( v_ord_idx + p_idx - 1 ) % n_prods) + 1 ];
                v_subtotal := v_qty * v_precio;
                v_total    := v_total + v_subtotal;

                INSERT INTO items_orden (
                    tenant_id, orden_id, producto_id,
                    cantidad, precio_unitario, subtotal, estado
                ) VALUES (
                    v_tenant, v_order_id,
                    prod_ids[ (( v_ord_idx + p_idx - 1 ) % n_prods) + 1 ],
                    v_qty, v_precio, v_subtotal, 'servido'
                );
            END LOOP;

            -- Update order totals (IGV 18%)
            UPDATE ordenes SET
                subtotal = v_total,
                igv      = ROUND(v_total * 0.18, 2),
                total    = ROUND(v_total * 1.18, 2)
            WHERE id = v_order_id;

        END LOOP; -- orders per day
    END LOOP;     -- days

    -- ── Active orders for TODAY ──
    FOR v_ord_idx IN 1..5 LOOP
        v_tipo := CASE WHEN v_ord_idx IN (1,2,3) THEN 'mesa' WHEN v_ord_idx = 4 THEN 'para_llevar' ELSE 'delivery' END;
        v_mesa_id := NULL;
        IF v_tipo = 'mesa' THEN
            SELECT id INTO v_mesa_id FROM mesas
            WHERE tenant_id = v_tenant AND local_id = v_local_id
            ORDER BY id LIMIT 1 OFFSET (v_ord_idx - 1);
        END IF;

        v_numero := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-A' || LPAD(v_ord_idx::text, 2, '0');

        INSERT INTO ordenes (
            tenant_id, local_id, mesa_id, mesero_id,
            numero_orden, numero_personas, tipo_orden,
            estado, subtotal, descuento, igv, total, notas,
            created_at, updated_at
        ) VALUES (
            v_tenant, v_local_id, v_mesa_id, v_mesero_id,
            v_numero, 2, v_tipo,
            CASE v_ord_idx WHEN 1 THEN 'en_cocina' WHEN 2 THEN 'nueva' WHEN 3 THEN 'listo' ELSE 'nueva' END,
            0, 0, 0, 0, '',
            NOW() - (v_ord_idx * 8) * INTERVAL '1 minute',
            NOW() - (v_ord_idx * 8) * INTERVAL '1 minute'
        ) RETURNING id INTO v_order_id;

        v_total := 0;
        FOR p_idx IN 1..2 LOOP
            v_qty      := 1;
            v_precio   := prod_prices[ ((v_ord_idx + p_idx) % n_prods) + 1 ];
            v_subtotal := v_precio;
            v_total    := v_total + v_subtotal;

            INSERT INTO items_orden (
                tenant_id, orden_id, producto_id,
                cantidad, precio_unitario, subtotal, estado
            ) VALUES (
                v_tenant, v_order_id,
                prod_ids[ ((v_ord_idx + p_idx) % n_prods) + 1 ],
                v_qty, v_precio, v_subtotal,
                CASE WHEN v_ord_idx IN (1,3) THEN 'en_preparacion' ELSE 'pendiente' END
            );
        END LOOP;

        UPDATE ordenes SET
            subtotal = v_total,
            igv      = ROUND(v_total * 0.18, 2),
            total    = ROUND(v_total * 1.18, 2)
        WHERE id = v_order_id;
    END LOOP;

    -- Mark mesas for active orders as occupied
    UPDATE mesas SET estado = 'ocupada'
    WHERE tenant_id = v_tenant AND local_id = v_local_id
      AND id IN (
          SELECT DISTINCT mesa_id FROM ordenes
          WHERE tenant_id = v_tenant AND estado IN ('nueva', 'en_cocina', 'listo')
            AND mesa_id IS NOT NULL
      );

END $$;
