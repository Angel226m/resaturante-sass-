-- ==========================================
-- Migration 030: Data compatibility backfill
-- Corrige precios 0 y columnas legacy en datos existentes
-- ==========================================

DO $$
BEGIN
    -- Normalizar productos_menu para el backend actual
    UPDATE productos_menu p
    SET
        categoria_menu_id = COALESCE(p.categoria_menu_id, p.categoria_id),
        precio_base = COALESCE(p.precio_base, p.precio),
        tiempo_preparacion = COALESCE(p.tiempo_preparacion, p.tiempo_preparacion_min),
        imagen_url = COALESCE(p.imagen_url, p.imagen_principal_url),
        alergenos = COALESCE(p.alergenos, p.contiene_alergenos),
        es_gluten_free = COALESCE(p.es_gluten_free, p.es_sin_gluten, false),
        es_popular = COALESCE(p.es_popular, p.destacado, false),
        disponible = COALESCE(p.disponible, (p.disponible_para_mesa OR p.disponible_para_llevar OR p.disponible_para_delivery), true),
        orden = COALESCE(p.orden, p.orden_display, 0)
    WHERE
        p.categoria_menu_id IS NULL
        OR p.precio_base IS NULL
        OR p.tiempo_preparacion IS NULL
        OR p.imagen_url IS NULL
        OR p.alergenos IS NULL
        OR p.orden IS NULL;

    -- Asegurar local_id cuando falte (usa el local principal del tenant)
    UPDATE productos_menu p
    SET local_id = (
        SELECT lx.id
        FROM locales lx
        WHERE lx.tenant_id = p.tenant_id
        ORDER BY lx.es_principal DESC, lx.id
        LIMIT 1
    )
    WHERE p.local_id IS NULL;

    -- Normalizar variantes
    UPDATE variantes_producto_menu v
    SET
        producto_menu_id = COALESCE(v.producto_menu_id, v.producto_id),
        precio_adicional = COALESCE(v.precio_adicional, v.precio)
    WHERE v.producto_menu_id IS NULL OR v.precio_adicional IS NULL;

    -- Reparar items de órdenes que quedaron con precio_unitario 0 por datos legacy
    UPDATE items_orden io
    SET
        precio_unitario = COALESCE(NULLIF(io.precio_unitario, 0), p.precio_base, p.precio, 0),
        subtotal = ROUND((COALESCE(NULLIF(io.precio_unitario, 0), p.precio_base, p.precio, 0) + COALESCE(io.precio_modificadores, 0)) * io.cantidad, 2)
    FROM productos_menu p
    WHERE io.producto_menu_id = p.id
      AND io.tenant_id = p.tenant_id
      AND io.precio_unitario = 0;

    -- Recalcular totales de ordenes en base a sus items
    UPDATE ordenes o
    SET
        subtotal = x.subtotal,
        igv = ROUND(x.subtotal * 0.18, 2),
        total = ROUND(x.subtotal * 1.18, 2),
        updated_at = NOW()
    FROM (
        SELECT tenant_id, orden_id, COALESCE(SUM(subtotal), 0) AS subtotal
        FROM items_orden
        GROUP BY tenant_id, orden_id
    ) x
    WHERE o.id = x.orden_id
      AND o.tenant_id = x.tenant_id;
END $$;
