-- ==========================================
-- Migration 029: Demo Data — Llena la BD con datos realistas
-- RestauFlow SaaS Multi-Tenant
-- Solo para tenant "La Buena Mesa" (slug: la-buena-mesa)
-- Idempotente via "WHERE NOT EXISTS"
-- ==========================================

DO $$
DECLARE
    tid uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  lid integer := 0;
    uid_admin integer := 0;
    uid_gerente integer := 0;
    uid_cajero integer := 0;
    uid_mesero1 integer := 0;
    uid_mesero2 integer := 0;
    uid_cocinero1 integer := 0;
    uid_repartidor integer := 0;
    cat_entradas integer := 0;
    cat_fondo integer := 0;
    cat_parrillas integer := 0;
    cat_postres integer := 0;
    cat_bebidas integer := 0;
    zona_salon integer := 0;
    turno_id bigint := 0;
BEGIN

  -- Resolver local_id real para evitar depender del valor de secuencia
  SELECT id INTO lid
  FROM locales
  WHERE tenant_id = tid
  ORDER BY es_principal DESC, id
  LIMIT 1;

  IF lid IS NULL OR lid = 0 THEN
    RAISE EXCEPTION 'No se encontró local para tenant %', tid;
  END IF;

-- ══════════════════════════════════════════════════════════════
-- 0. OBTENER IDs DE REFERENCIA
-- ══════════════════════════════════════════════════════════════

    SELECT id INTO uid_admin FROM usuarios WHERE correo = 'admin@labuenamese.com';
    SELECT id INTO uid_gerente FROM usuarios WHERE correo = 'gerente@labuenamese.com';
    SELECT id INTO uid_cajero FROM usuarios WHERE correo = 'cajero@labuenamese.com';
    SELECT id INTO uid_mesero1 FROM usuarios WHERE correo = 'mesero1@labuenamese.com';
    SELECT id INTO uid_mesero2 FROM usuarios WHERE correo = 'mesero2@labuenamese.com';
    SELECT id INTO uid_cocinero1 FROM usuarios WHERE correo = 'cocinero@labuenamese.com';

    -- Crear usuario repartidor si no existe
    INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
    SELECT tid, lid, 'Carlos', 'Ramos', 'repartidor@labuenamese.com', '$2a$14$bhzYbQt.mHLc8AQLN3DfRuT9j1t/9BBYEnWgHc1bIy/7Qbyxmm5YK', 'REPARTIDOR', '2001', '#f59e0b', true
    WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'repartidor@labuenamese.com');

    -- Obtener el id del repartidor (ya existía o se acaba de crear)
    SELECT id INTO uid_repartidor FROM usuarios WHERE correo = 'repartidor@labuenamese.com';

    -- Asignar las categorías al local_id=2 (se crearon sin local_id en seed)
    UPDATE categorias_menu SET local_id = lid WHERE tenant_id = tid AND local_id IS NULL;

    SELECT id INTO cat_entradas FROM categorias_menu WHERE tenant_id = tid AND slug = 'entradas-bm';
    SELECT id INTO cat_fondo FROM categorias_menu WHERE tenant_id = tid AND slug = 'platos-fondo-bm';
    SELECT id INTO cat_parrillas FROM categorias_menu WHERE tenant_id = tid AND slug = 'parrillas-bm';
    SELECT id INTO cat_postres FROM categorias_menu WHERE tenant_id = tid AND slug = 'postres-bm';
    SELECT id INTO cat_bebidas FROM categorias_menu WHERE tenant_id = tid AND slug = 'bebidas-bm';

    SELECT id INTO zona_salon FROM zonas WHERE tenant_id = tid AND local_id = lid AND nombre = 'Salón Principal';

-- ══════════════════════════════════════════════════════════════
-- 1. PRODUCTOS ADICIONALES
-- ══════════════════════════════════════════════════════════════

    -- Ceviche (entrada estrella)
    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, descripcion, precio, tiempo_preparacion_min, activo, orden_display, destacado, es_popular, es_nuevo)
    SELECT tid, lid, cat_entradas, 'Ceviche Clásico', 'Pescado fresco marinado en limón, cebolla roja y ají limo', 'Nuestro ceviche bandera: pescado fresco del día marinado en jugo de limón, con cebolla roja en corte pluma, ají limo, camote y choclo', 32.00, 12, true, 0, true, true, false
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Ceviche Clásico');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, descripcion, precio, tiempo_preparacion_min, activo, orden_display, destacado, es_popular)
    SELECT tid, lid, cat_entradas, 'Tiradito Nikkei', 'Pescado en finas láminas con salsa de ají amarillo y leche de tigre', 'Finas láminas de pescado fresco bañadas en salsa nikkei de ají amarillo, jengibre y cítricos', 35.00, 10, true, 1, true, true
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Tiradito Nikkei');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
    SELECT tid, lid, cat_entradas, 'Papa a la Huancaína', 'Papas sancochadas con crema de ají amarillo y queso', 18.00, 8, true, 2, false
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Papa a la Huancaína');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
    SELECT tid, lid, cat_entradas, 'Choros a la Chalaca', 'Mejillones frescos con salsa criolla y limón', 24.00, 10, true, 3, false
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Choros a la Chalaca');

    -- Más fondos
    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado, es_popular)
    SELECT tid, lid, cat_fondo, 'Tallarín Verde con Bistec', 'Tallarines verdes caseros con bistec a la plancha', 38.00, 20, true, 4, true, true
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Tallarín Verde con Bistec');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_fondo, 'Cau Cau', 'Mondongo en salsa amarilla con papas y hierbabuena', 32.00, 25, true, 5
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Cau Cau');

    -- Más parrillas
    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
    SELECT tid, lid, cat_parrillas, 'Bife Angosto 300g', 'Bife angosto argentino acompañado de papas y ensalada', 72.00, 25, true, 0, true
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Bife Angosto 300g');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_parrillas, 'Pechuga a la Plancha', 'Pechuga de pollo marinada con vegetales salteados', 38.00, 20, true, 1
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Pechuga a la Plancha');

    -- Más postres
    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
    SELECT tid, lid, cat_postres, 'Crema Volteada', 'Clásico flan peruano con caramelo', 14.00, 5, true, 2, true
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Crema Volteada');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_postres, 'Picarones con Miel', 'Picarones artesanales con miel de chancaca', 12.00, 8, true, 3
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Picarones con Miel');

    -- Más bebidas
    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_bebidas, 'Maracuyá Sour', 'Cóctel de maracuyá con pisco', 24.00, 5, true, 3
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Maracuyá Sour');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_bebidas, 'Cerveza Cusqueña 620ml', 'Cerveza artesanal peruana', 18.00, 2, true, 4
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Cerveza Cusqueña 620ml');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_bebidas, 'Agua Mineral 500ml', 'Agua mineral sin gas', 5.00, 1, true, 5
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Agua Mineral 500ml');

    INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display)
    SELECT tid, lid, cat_bebidas, 'Gaseosa Personal 355ml', 'Refresco Coca Cola, Sprite o Fanta', 6.00, 1, true, 6
    WHERE NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = tid AND nombre = 'Gaseosa Personal 355ml');

-- ══════════════════════════════════════════════════════════════
-- 2. VARIANTES DE PRODUCTO
-- ══════════════════════════════════════════════════════════════

    -- Variantes para Lomo Saltado (id 19): porción
    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Porción Regular', 'porcion', 'Regular', 0.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Lomo Saltado'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Regular');

    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Porción Grande', 'porcion', 'Grande', 12.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Lomo Saltado'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Grande');

    -- Variantes para Pisco Sour: con o sin huevo
    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Con Clara de Huevo', 'preparacion', 'Con Clara', 0.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Pisco Sour'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Con Clara');

    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Sin Clara de Huevo', 'preparacion', 'Sin Clara', 0.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Pisco Sour'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Sin Clara');

    -- Variantes para Churrasco: punto de cocción
    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Término Tres Cuartos', 'coccion', 'Tres Cuartos', 0.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Churrasco'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Tres Cuartos');

    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Término Jugoso', 'coccion', 'Jugoso', 0.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Churrasco'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Jugoso');

    INSERT INTO variantes_producto_menu (tenant_id, producto_id, nombre, tipo_variante, valor, precio, disponible)
    SELECT tid, pm.id, 'Término Bien Cocido', 'coccion', 'Bien Cocido', 0.00, true
    FROM productos_menu pm WHERE pm.tenant_id = tid AND pm.nombre = 'Churrasco'
    AND NOT EXISTS (SELECT 1 FROM variantes_producto_menu v WHERE v.tenant_id = tid AND v.producto_id = pm.id AND v.valor = 'Bien Cocido');

-- ══════════════════════════════════════════════════════════════
-- 3. GRUPOS DE MODIFICADORES Y MODIFICADORES
-- ══════════════════════════════════════════════════════════════

    -- Grupo: Acompañamiento (opcional, max 1)
    INSERT INTO grupos_modificadores (tenant_id, nombre, tipo, seleccion_minima, seleccion_maxima)
    SELECT tid, 'Acompañamiento', 'opcional', 0, 1
    WHERE NOT EXISTS (SELECT 1 FROM grupos_modificadores WHERE tenant_id = tid AND nombre = 'Acompañamiento');

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Papas Fritas', 0.00, 1
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Acompañamiento'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Papas Fritas' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Arroz Blanco', 0.00, 2
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Acompañamiento'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Arroz Blanco' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Ensalada Fresca', 0.00, 3
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Acompañamiento'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Ensalada Fresca' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Camote Frito', 3.00, 4
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Acompañamiento'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Camote Frito' AND m.grupo_id = g.id);

    -- Grupo: Salsa Adicional (opcional, max 3)
    INSERT INTO grupos_modificadores (tenant_id, nombre, tipo, seleccion_minima, seleccion_maxima)
    SELECT tid, 'Salsa Adicional', 'opcional', 0, 3
    WHERE NOT EXISTS (SELECT 1 FROM grupos_modificadores WHERE tenant_id = tid AND nombre = 'Salsa Adicional');

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Salsa de Rocoto', 2.00, 1
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Salsa Adicional'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Salsa de Rocoto' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Salsa de Huacatay', 2.00, 2
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Salsa Adicional'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Salsa de Huacatay' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Salsa Tartara', 1.50, 3
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Salsa Adicional'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Salsa Tartara' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Mayonesa Casera', 1.00, 4
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Salsa Adicional'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Mayonesa Casera' AND m.grupo_id = g.id);

    -- Grupo: Término de Cocción (obligatorio para carnes)
    INSERT INTO grupos_modificadores (tenant_id, nombre, tipo, seleccion_minima, seleccion_maxima)
    SELECT tid, 'Término de Cocción', 'obligatorio', 1, 1
    WHERE NOT EXISTS (SELECT 1 FROM grupos_modificadores WHERE tenant_id = tid AND nombre = 'Término de Cocción');

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Término Jugoso', 0.00, 1
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Término de Cocción'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Término Jugoso' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Término Tres Cuartos', 0.00, 2
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Término de Cocción'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Término Tres Cuartos' AND m.grupo_id = g.id);

    INSERT INTO modificadores (tenant_id, grupo_id, nombre, precio_adicional, orden)
    SELECT tid, g.id, 'Término Bien Cocido', 0.00, 3
    FROM grupos_modificadores g WHERE g.tenant_id = tid AND g.nombre = 'Término de Cocción'
    AND NOT EXISTS (SELECT 1 FROM modificadores m WHERE m.tenant_id = tid AND m.nombre = 'Término Bien Cocido' AND m.grupo_id = g.id);

-- ══════════════════════════════════════════════════════════════
-- 4. ASIGNAR MODIFICADORES A PRODUCTOS
-- ══════════════════════════════════════════════════════════════

    -- Acompañamiento para platos de fondo y parrillas
    INSERT INTO producto_grupos_modificadores (tenant_id, producto_id, grupo_id, orden)
    SELECT tid, pm.id, g.id, 1
    FROM productos_menu pm, grupos_modificadores g
    WHERE pm.tenant_id = tid AND g.tenant_id = tid
      AND pm.nombre IN ('Lomo Saltado', 'Ají de Gallina', 'Seco de Cordero', 'Arroz con Pollo', 'Parrilla Mixta p/2', 'Churrasco', 'Bife Angosto 300g', 'Pechuga a la Plancha', 'Tallarín Verde con Bistec')
      AND g.nombre = 'Acompañamiento'
      AND NOT EXISTS (SELECT 1 FROM producto_grupos_modificadores pg WHERE pg.tenant_id = tid AND pg.producto_id = pm.id AND pg.grupo_id = g.id);

    -- Término de cocción para carnes
    INSERT INTO producto_grupos_modificadores (tenant_id, producto_id, grupo_id, orden)
    SELECT tid, pm.id, g.id, 1
    FROM productos_menu pm, grupos_modificadores g
    WHERE pm.tenant_id = tid AND g.tenant_id = tid
      AND pm.nombre IN ('Churrasco', 'Bife Angosto 300g', 'Parrilla Mixta p/2')
      AND g.nombre = 'Término de Cocción'
      AND NOT EXISTS (SELECT 1 FROM producto_grupos_modificadores pg WHERE pg.tenant_id = tid AND pg.producto_id = pm.id AND pg.grupo_id = g.id);

-- ══════════════════════════════════════════════════════════════
-- 5. COMBOS
-- ══════════════════════════════════════════════════════════════

    -- Combo 1: Cena para Dos
    INSERT INTO combos (tenant_id, local_id, nombre, descripcion, precio, activo)
    SELECT tid, lid, 'Cena para Dos', 'Entrada + 2 platos de fondo + 2 postres + 2 bebidas', 89.00, true
    WHERE NOT EXISTS (SELECT 1 FROM combos WHERE tenant_id = tid AND nombre = 'Cena para Dos');

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Cena para Dos' AND pm.nombre = 'Causa Rellena'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Cena para Dos' AND pm.nombre = 'Lomo Saltado'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Cena para Dos' AND pm.nombre = 'Seco de Cordero'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Cena para Dos' AND pm.nombre = 'Suspiro Limeño'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Cena para Dos' AND pm.nombre = 'Pisco Sour'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    -- Combo 2: Almuerzo Ejecutivo
    INSERT INTO combos (tenant_id, local_id, nombre, descripcion, precio, activo)
    SELECT tid, lid, 'Almuerzo Ejecutivo', 'Plato de fondo + bebida + postre (válido lunes a viernes 12-4pm)', 28.00, true
    WHERE NOT EXISTS (SELECT 1 FROM combos WHERE tenant_id = tid AND nombre = 'Almuerzo Ejecutivo');

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Almuerzo Ejecutivo' AND pm.nombre = 'Ají de Gallina'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Almuerzo Ejecutivo' AND pm.nombre = 'Chicha Morada 1L'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Almuerzo Ejecutivo' AND pm.nombre = 'Suspiro Limeño'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    -- Combo 3: Parrilla Familiar
    INSERT INTO combos (tenant_id, local_id, nombre, descripcion, precio, activo)
    SELECT tid, lid, 'Parrilla Familiar (4 pers)', 'Parrilla mixta + 4 bebidas + papas fritas gigante', 165.00, true
    WHERE NOT EXISTS (SELECT 1 FROM combos WHERE tenant_id = tid AND nombre = 'Parrilla Familiar (4 pers)');

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Parrilla Familiar (4 pers)' AND pm.nombre = 'Parrilla Mixta p/2'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 1
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Parrilla Familiar (4 pers)' AND pm.nombre = 'Churrasco'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

    INSERT INTO detalle_combos (tenant_id, combo_id, producto_id, cantidad)
    SELECT tid, c.id, pm.id, 4
    FROM combos c, productos_menu pm
    WHERE c.tenant_id = tid AND pm.tenant_id = tid AND c.nombre = 'Parrilla Familiar (4 pers)' AND pm.nombre = 'Inca Kola 600ml'
    AND NOT EXISTS (SELECT 1 FROM detalle_combos d WHERE d.tenant_id = tid AND d.combo_id = c.id AND d.producto_id = pm.id);

-- ══════════════════════════════════════════════════════════════
-- 6. PROMOCIONES
-- ══════════════════════════════════════════════════════════════

    INSERT INTO promociones (tenant_id, local_id, nombre, descripcion, tipo, valor, aplica_a, hora_inicio, hora_fin, dias_semana, fecha_inicio, fecha_fin, activo)
    SELECT tid, lid, 'Happy Hour', '20% de descuento en bebidas de 5pm a 7pm', 'happy_hour', 20.00, 'categoria', '17:00', '19:00', '1,2,3,4,5', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true
    WHERE NOT EXISTS (SELECT 1 FROM promociones WHERE tenant_id = tid AND nombre = 'Happy Hour');

    INSERT INTO promociones (tenant_id, local_id, nombre, descripcion, tipo, valor, aplica_a, fecha_inicio, fecha_fin, activo)
    SELECT tid, lid, '2x1 en Anticuchos', 'Los jueves 2x1 en anticuchos', '2x1', 0, 'producto', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true
    WHERE NOT EXISTS (SELECT 1 FROM promociones WHERE tenant_id = tid AND nombre = '2x1 en Anticuchos');

    UPDATE promociones SET producto_menu_id = (SELECT id FROM productos_menu WHERE tenant_id = tid AND nombre = 'Anticuchos')
    WHERE tenant_id = tid AND nombre = '2x1 en Anticuchos' AND producto_menu_id IS NULL;

    INSERT INTO promociones (tenant_id, local_id, nombre, descripcion, tipo, valor, aplica_a, valor_descuento, fecha_inicio, fecha_fin, activo)
    SELECT tid, lid, 'Dscto. 15% en Lomo Saltado', '15% de descuento en Lomo Saltado al mediodía', 'descuento_porcentaje', 15.00, 'producto', 15.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '45 days', true
    WHERE NOT EXISTS (SELECT 1 FROM promociones WHERE tenant_id = tid AND nombre = 'Dscto. 15% en Lomo Saltado');

    UPDATE promociones SET producto_menu_id = (SELECT id FROM productos_menu WHERE tenant_id = tid AND nombre = 'Lomo Saltado')
    WHERE tenant_id = tid AND nombre = 'Dscto. 15% en Lomo Saltado' AND producto_menu_id IS NULL;

    -- Cupones activos
    INSERT INTO cupones (tenant_id, local_id, codigo, descripcion, tipo_descuento, valor_descuento, monto_minimo, fecha_inicio, fecha_fin, usos_maximos, usos_por_cliente, activo)
    SELECT tid, lid, 'BIENVENIDO2026', 'Descuento de S/15 en tu primera orden', 'monto_fijo', 15.00, 40.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100, 1, true
    WHERE NOT EXISTS (SELECT 1 FROM cupones WHERE tenant_id = tid AND codigo = 'BIENVENIDO2026');

    INSERT INTO cupones (tenant_id, local_id, codigo, descripcion, tipo_descuento, valor_descuento, monto_minimo, fecha_inicio, fecha_fin, usos_maximos, usos_por_cliente, activo)
    SELECT tid, lid, 'BUENAMESA10', '10% de descuento en toda la cuenta', 'porcentaje', 10.00, 50.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 50, 1, true
    WHERE NOT EXISTS (SELECT 1 FROM cupones WHERE tenant_id = tid AND codigo = 'BUENAMESA10');

-- ══════════════════════════════════════════════════════════════
-- 7. HORARIOS DEL MENÚ
-- ══════════════════════════════════════════════════════════════

    INSERT INTO menu_horarios (tenant_id, local_id, nombre, hora_inicio, hora_fin, dias_semana, activo)
    SELECT tid, lid, 'Almuerzo', '12:00', '16:00', '1,2,3,4,5,6,7', true
    WHERE NOT EXISTS (SELECT 1 FROM menu_horarios WHERE tenant_id = tid AND nombre = 'Almuerzo');

    INSERT INTO menu_horarios (tenant_id, local_id, nombre, hora_inicio, hora_fin, dias_semana, activo)
    SELECT tid, lid, 'Cena', '18:00', '23:00', '1,2,3,4,5,6,7', true
    WHERE NOT EXISTS (SELECT 1 FROM menu_horarios WHERE tenant_id = tid AND nombre = 'Cena');

    INSERT INTO menu_horarios (tenant_id, local_id, nombre, hora_inicio, hora_fin, dias_semana, activo)
    SELECT tid, lid, 'Happy Hour', '17:00', '19:00', '1,2,3,4,5', true
    WHERE NOT EXISTS (SELECT 1 FROM menu_horarios WHERE tenant_id = tid AND nombre = 'Happy Hour');

-- ══════════════════════════════════════════════════════════════
-- 8. ZONAS DELIVERY
-- ══════════════════════════════════════════════════════════════

    INSERT INTO zonas_delivery (tenant_id, local_id, nombre, radio_km, costo_envio, tiempo_estimado_min, activo)
    SELECT tid, lid, 'Miraflores Centro', 3.0, 5.00, 25, true
    WHERE NOT EXISTS (SELECT 1 FROM zonas_delivery WHERE tenant_id = tid AND local_id = lid AND nombre = 'Miraflores Centro');

    INSERT INTO zonas_delivery (tenant_id, local_id, nombre, radio_km, costo_envio, tiempo_estimado_min, activo)
    SELECT tid, lid, 'San Isidro', 5.0, 8.00, 35, true
    WHERE NOT EXISTS (SELECT 1 FROM zonas_delivery WHERE tenant_id = tid AND local_id = lid AND nombre = 'San Isidro');

    INSERT INTO zonas_delivery (tenant_id, local_id, nombre, radio_km, costo_envio, tiempo_estimado_min, activo)
    SELECT tid, lid, 'Barranco', 6.0, 10.00, 40, true
    WHERE NOT EXISTS (SELECT 1 FROM zonas_delivery WHERE tenant_id = tid AND local_id = lid AND nombre = 'Barranco');

-- ══════════════════════════════════════════════════════════════
-- 9. CLIENTES
-- ══════════════════════════════════════════════════════════════

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'María', 'García López', 'DNI', 320.00, 5, NOW() - INTERVAL '2 days', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'María' AND apellidos = 'García López');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'José', 'Martínez Ríos', 'DNI', 180.50, 3, NOW() - INTERVAL '5 days', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'José' AND apellidos = 'Martínez Ríos');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Carmen', 'Fernández Torres', 'DNI', 560.00, 8, NOW() - INTERVAL '1 day', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Carmen' AND apellidos = 'Fernández Torres');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Ricardo', 'Paredes Silva', 'CE', 45.00, 1, NOW() - INTERVAL '10 days', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Ricardo' AND apellidos = 'Paredes Silva');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Lucía', 'Vega Mendoza', 'DNI', 210.00, 4, NOW() - INTERVAL '3 days', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Lucía' AND apellidos = 'Vega Mendoza');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Pedro', 'Infante Castro', 'DNI', 0, 0, NULL, true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Pedro' AND apellidos = 'Infante Castro');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Ana', 'Romero Delgado', 'Pasaporte', 125.00, 2, NOW() - INTERVAL '7 days', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Ana' AND apellidos = 'Romero Delgado');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Diego', 'Sánchez Campos', 'DNI', 0, 0, NULL, true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Diego' AND apellidos = 'Sánchez Campos');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Rosa', 'Huamán Quispe', 'DNI', 890.00, 12, NOW() - INTERVAL '1 day', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Rosa' AND apellidos = 'Huamán Quispe');

    INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento, total_compras, cantidad_visitas, ultima_visita, activo)
    SELECT tid, lid, 'Luis', 'Alcántara Bravo', 'RUC', 1500.00, 6, NOW() - INTERVAL '4 days', true
    WHERE NOT EXISTS (SELECT 1 FROM clientes WHERE tenant_id = tid AND nombres = 'Luis' AND apellidos = 'Alcántara Bravo');

    -- Direcciones para algunos clientes
    INSERT INTO direcciones_cliente (tenant_id, cliente_id, etiqueta, direccion, referencia, distrito, es_principal)
    SELECT tid, c.id, 'Casa', 'Av. Larco 789, Dpto 402', 'Frente al parque Kennedy', 'Miraflores', true
    FROM clientes c WHERE c.tenant_id = tid AND c.nombres = 'María' AND c.apellidos = 'García López'
    AND NOT EXISTS (SELECT 1 FROM direcciones_cliente d WHERE d.tenant_id = tid AND d.cliente_id = c.id);

    INSERT INTO direcciones_cliente (tenant_id, cliente_id, etiqueta, direccion, referencia, distrito, es_principal)
    SELECT tid, c.id, 'Trabajo', 'Av. Pardo y Aliaga 350, Of. 501', 'Edificio corporativo', 'San Isidro', false
    FROM clientes c WHERE c.tenant_id = tid AND c.nombres = 'María' AND c.apellidos = 'García López'
    AND NOT EXISTS (SELECT 1 FROM direcciones_cliente d WHERE d.tenant_id = tid AND d.cliente_id = c.id AND d.etiqueta = 'Trabajo');

    INSERT INTO direcciones_cliente (tenant_id, cliente_id, etiqueta, direccion, referencia, distrito, es_principal)
    SELECT tid, c.id, 'Casa', 'Jr. Unión 250', 'Altura de la cdra 3 de Av. Brasil', 'Barranco', true
    FROM clientes c WHERE c.tenant_id = tid AND c.nombres = 'Carmen' AND c.apellidos = 'Fernández Torres'
    AND NOT EXISTS (SELECT 1 FROM direcciones_cliente d WHERE d.tenant_id = tid AND d.cliente_id = c.id);

    INSERT INTO direcciones_cliente (tenant_id, cliente_id, etiqueta, direccion, referencia, distrito, es_principal)
    SELECT tid, c.id, 'Oficina', 'Av. Canaval y Moreyra 580', '', 'San Isidro', true
    FROM clientes c WHERE c.tenant_id = tid AND c.nombres = 'Luis' AND c.apellidos = 'Alcántara Bravo'
    AND NOT EXISTS (SELECT 1 FROM direcciones_cliente d WHERE d.tenant_id = tid AND d.cliente_id = c.id);

-- ══════════════════════════════════════════════════════════════
-- 10. MÉTODOS DE PAGO
-- ══════════════════════════════════════════════════════════════

    INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia, orden_display, activo)
    SELECT tid, lid, 'Efectivo', 'efectivo', 0, false, 1, true
    WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = tid AND local_id = lid AND nombre = 'Efectivo');

    INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia, orden_display, activo)
    SELECT tid, lid, 'Yape', 'yape', 0, true, 2, true
    WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = tid AND local_id = lid AND nombre = 'Yape');

    INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia, orden_display, activo)
    SELECT tid, lid, 'Plin', 'plin', 0, true, 3, true
    WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = tid AND local_id = lid AND nombre = 'Plin');

    INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia, orden_display, activo)
    SELECT tid, lid, 'Tarjeta Débito', 'tarjeta_debito', 2.50, false, 4, true
    WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = tid AND local_id = lid AND nombre = 'Tarjeta Débito');

    INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia, orden_display, activo)
    SELECT tid, lid, 'Tarjeta Crédito', 'tarjeta_credito', 3.00, false, 5, true
    WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = tid AND local_id = lid AND nombre = 'Tarjeta Crédito');

    INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia, orden_display, activo)
    SELECT tid, lid, 'Mercado Pago', 'mercadopago', 4.00, false, 6, true
    WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE tenant_id = tid AND local_id = lid AND nombre = 'Mercado Pago');

-- ══════════════════════════════════════════════════════════════
-- 11. TURNO DE CAJA (ABIERTO)
-- ══════════════════════════════════════════════════════════════

    INSERT INTO turnos_caja (tenant_id, local_id, usuario_id, estado, fecha_apertura, monto_apertura, observaciones)
    SELECT tid, lid, uid_cajero, 'abierto', NOW() - INTERVAL '4 hours', 200.00, 'Turno mañana - apertura normal'
    WHERE NOT EXISTS (SELECT 1 FROM turnos_caja WHERE tenant_id = tid AND local_id = lid AND estado = 'abierto')
    RETURNING id INTO turno_id;

-- ══════════════════════════════════════════════════════════════
-- 12. ÓRDENES CON ITEMS Y PAGOS
-- ══════════════════════════════════════════════════════════════

    -- Orden 1: Pagada (mesa 1, ayer)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, mesa_id, cliente_id, mesero_id, cajero_id, turno_caja_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, igv, total, notas, fecha_apertura, fecha_completada)
        SELECT tid, lid, m.id, c.id, uid_mesero1, uid_cajero, turno_id, 'BM-ORD-0001', 'mesa', 'pagada', 2, 64.00, 11.52, 75.52, 'Todo excelente', NOW() - INTERVAL '1 day' - INTERVAL '4 hours', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'
        FROM mesas m, clientes c
        WHERE m.tenant_id = tid AND m.local_id = lid AND m.numero = '1'
          AND c.tenant_id = tid AND c.nombres = 'María' AND c.apellidos = 'García López'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado, notas)
    SELECT tid, ord.id, pm.id, 2, pm.precio, pm.precio * 2, CASE WHEN pm.nombre = 'Lomo Saltado' THEN 'listo' ELSE 'servido' END, 'Sin cebolla por favor'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre IN ('Causa Rellena', 'Lomo Saltado');

    -- Items para orden 1 (repite el segundo item en una segunda iteración)
    WITH ord AS (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0001')
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, 'servido'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre = 'Pisco Sour'
      AND NOT EXISTS (SELECT 1 FROM items_orden i WHERE i.tenant_id = tid AND i.orden_id = ord.id AND i.producto_menu_id = pm.id);

    -- Pago para orden 1
    WITH ord AS (SELECT id, total FROM ordenes WHERE numero_orden = 'BM-ORD-0001')
    INSERT INTO pagos (tenant_id, orden_id, turno_caja_id, usuario_id, monto_total, monto_pagado, propina, vuelto, estado)
    SELECT tid, ord.id, turno_id, uid_cajero, ord.total, 80.00, 4.48, 0, 'completado'
    FROM ord
    WHERE NOT EXISTS (SELECT 1 FROM pagos p WHERE p.tenant_id = tid AND p.orden_id = ord.id);

    -- Historial estados orden 1
    INSERT INTO historial_estados_orden (tenant_id, orden_id, estado_anterior, estado_nuevo, usuario_id)
    SELECT tid, o.id, NULL, 'nueva', uid_mesero1 FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    UNION ALL SELECT tid, o.id, 'nueva', 'en_cocina', uid_mesero1 FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    UNION ALL SELECT tid, o.id, 'en_cocina', 'listo', uid_cocinero1 FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    UNION ALL SELECT tid, o.id, 'listo', 'servida', uid_mesero1 FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    UNION ALL SELECT tid, o.id, 'servida', 'pagada', uid_cajero FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001';

    -- Ticket cocina para orden 1
    INSERT INTO tickets_cocina (tenant_id, orden_id, local_id, cocinero_id, estacion_cocina, numero_ticket, estado)
    SELECT tid, o.id, lid, uid_cocinero1, 'Cocina Principal', 1, 'entregado'
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    AND NOT EXISTS (SELECT 1 FROM tickets_cocina t WHERE t.tenant_id = tid AND t.orden_id = o.id);

    -- Orden 2: En cocina (mesa 5, hoy)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, mesa_id, mesero_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, total, notas, fecha_apertura)
        SELECT tid, lid, m.id, uid_mesero2, 'BM-ORD-0002', 'mesa', 'en_cocina', 4, 132.00, 132.00, 'Entradas primero, fondos después', NOW() - INTERVAL '30 minutes'
        FROM mesas m
        WHERE m.tenant_id = tid AND m.local_id = lid AND m.numero = '5'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, CASE WHEN pm.nombre IN ('Ceviche Clásico','Anticuchos') THEN 'en_preparacion' ELSE 'pendiente' END
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre IN ('Ceviche Clásico', 'Anticuchos', 'Lomo Saltado', 'Seco de Cordero');

    -- Historial orden 2
    INSERT INTO historial_estados_orden (tenant_id, orden_id, estado_anterior, estado_nuevo, usuario_id)
    SELECT tid, o.id, NULL, 'nueva', uid_mesero2 FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0002';

    -- Orden 3: Nueva (recién abierta, mesa 3)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, mesa_id, cliente_id, mesero_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, total, notas, fecha_apertura)
        SELECT tid, lid, m.id, c.id, uid_mesero1, 'BM-ORD-0003', 'mesa', 'nueva', 3, 46.00, 46.00, '', NOW() - INTERVAL '5 minutes'
        FROM mesas m, clientes c
        WHERE m.tenant_id = tid AND m.local_id = lid AND m.numero = '3'
          AND c.tenant_id = tid AND c.nombres = 'Rosa' AND c.apellidos = 'Huamán Quispe'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, 'pendiente'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre IN ('Ceviche Clásico', 'Ají de Gallina');

    -- Orden 4: Pagada con delivery (ayer)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, cliente_id, cajero_id, turno_caja_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, costo_envio, total, notas, fecha_apertura, fecha_completada)
        SELECT tid, lid, c.id, uid_cajero, turno_id, 'BM-ORD-0004', 'delivery', 'pagada', 2, 56.00, 5.00, 71.00, 'Llamar antes de llegar', NOW() - INTERVAL '1 day' - INTERVAL '3 hours', NOW() - INTERVAL '1 day' - INTERVAL '1 hour'
        FROM clientes c
        WHERE c.tenant_id = tid AND c.nombres = 'Carmen' AND c.apellidos = 'Fernández Torres'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 2, pm.precio, pm.precio * 2, 'servido'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre IN ('Tequeños con Guacamole', 'Arroz con Pollo', 'Inca Kola 600ml');

    -- Pago orden 4
    WITH ord AS (SELECT id, total FROM ordenes WHERE numero_orden = 'BM-ORD-0004')
    INSERT INTO pagos (tenant_id, orden_id, turno_caja_id, usuario_id, monto_total, monto_pagado, vuelto, estado)
    SELECT tid, ord.id, turno_id, uid_cajero, ord.total, ord.total, 0, 'completado'
    FROM ord
    WHERE NOT EXISTS (SELECT 1 FROM pagos p WHERE p.tenant_id = tid AND p.orden_id = ord.id);

    -- Delivery orden 4
    INSERT INTO delivery_ordenes (tenant_id, orden_id, repartidor_id, estado_delivery, costo_envio, distancia_km, instrucciones_entrega, tiempo_real_entrega)
    SELECT tid, o.id, uid_repartidor, 'entregado', 5.00, 2.5, 'Dejar en recepción', NOW() - INTERVAL '1 day' - INTERVAL '30 minutes'
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0004';

    -- Orden 5: Delivery en camino (hoy)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, cliente_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, costo_envio, total, notas, fecha_apertura)
        SELECT tid, lid, c.id, 'BM-ORD-0005', 'delivery', 'pagada', 3, 82.00, 8.00, 100.00, 'Tocar timbre', NOW() - INTERVAL '45 minutes'
        FROM clientes c
        WHERE c.tenant_id = tid AND c.nombres = 'Luis' AND c.apellidos = 'Alcántara Bravo'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, 'listo'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre IN ('Parrilla Mixta p/2', 'Crema Volteada', 'Inca Kola 600ml');

    -- Pago orden 5 (Mercado Pago)
    WITH ord AS (SELECT id, total FROM ordenes WHERE numero_orden = 'BM-ORD-0005')
    INSERT INTO pagos (tenant_id, orden_id, turno_caja_id, usuario_id, monto_total, monto_pagado, estado)
    SELECT tid, ord.id, turno_id, uid_cajero, ord.total, ord.total, 'completado'
    FROM ord
    WHERE NOT EXISTS (SELECT 1 FROM pagos p WHERE p.tenant_id = tid AND p.orden_id = ord.id);

    -- Delivery orden 5
    INSERT INTO delivery_ordenes (tenant_id, orden_id, repartidor_id, estado_delivery, costo_envio, distancia_km, instrucciones_entrega)
    SELECT tid, o.id, uid_repartidor, 'en_camino', 8.00, 4.2, 'Edificio corporativo, piso 5'
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0005';

    -- Orden 6: Para llevar (pagada, ayer)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, cliente_id, cajero_id, turno_caja_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, total, notas, fecha_apertura, fecha_completada)
        SELECT tid, lid, c.id, uid_cajero, turno_id, 'BM-ORD-0006', 'para_llevar', 'pagada', 1, 22.00, 22.00, 'Salsa adicional por favor', NOW() - INTERVAL '1 day' - INTERVAL '5 hours', NOW() - INTERVAL '1 day' - INTERVAL '4 hours'
        FROM clientes c WHERE c.tenant_id = tid AND c.nombres = 'José' AND c.apellidos = 'Martínez Ríos'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, 'servido'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre = 'Causa Rellena'
    UNION ALL
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, 'servido'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre = 'Chicha Morada 1L';

    -- Pago orden 6
    WITH ord AS (SELECT id, total FROM ordenes WHERE numero_orden = 'BM-ORD-0006')
    INSERT INTO pagos (tenant_id, orden_id, turno_caja_id, usuario_id, monto_total, monto_pagado, estado)
    SELECT tid, ord.id, turno_id, uid_cajero, ord.total, ord.total, 'completado'
    FROM ord
    WHERE NOT EXISTS (SELECT 1 FROM pagos p WHERE p.tenant_id = tid AND p.orden_id = ord.id);

    -- Orden 7: Cancelada (ayer)
    WITH ord AS (
        INSERT INTO ordenes (tenant_id, local_id, mesa_id, mesero_id, numero_orden, tipo_orden, estado, numero_personas, subtotal, total, notas, motivo_cancelacion, fecha_apertura, fecha_completada)
        SELECT tid, lid, m.id, uid_mesero1, 'BM-ORD-0007', 'mesa', 'cancelada', 2, 56.00, 56.00, 'Cliente insatisfecho', 'Cliente se retiró antes de ordenar', NOW() - INTERVAL '1 day' - INTERVAL '6 hours', NOW() - INTERVAL '1 day' - INTERVAL '5 hours'
        FROM mesas m WHERE m.tenant_id = tid AND m.local_id = lid AND m.numero = '8'
        RETURNING id
    )
    INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, cantidad, precio_unitario, subtotal, estado)
    SELECT tid, ord.id, pm.id, 1, pm.precio, pm.precio, 'cancelado'
    FROM ord, productos_menu pm
    WHERE pm.tenant_id = tid AND pm.nombre IN ('Tequeños con Guacamole');
    -- Nota: solo pidieron tequeños y cancelaron

-- ══════════════════════════════════════════════════════════════
-- 13. RESERVAS
-- ══════════════════════════════════════════════════════════════

    -- Reserva 1: Confirmada para hoy
    INSERT INTO reservas (tenant_id, local_id, mesa_id, cliente_id, usuario_asignador_id, nombre_contacto, telefono_contacto, numero_personas, fecha_reserva, hora_inicio, hora_fin, estado, ocasion, notas_cliente)
    SELECT tid, lid, m.id, c.id, uid_admin, c.nombres || ' ' || c.apellidos, '999888777', 4, CURRENT_DATE, '20:00', '22:00', 'confirmada', 'cumpleanos', 'Es mi cumpleaños, ¿pueden decorar la mesa?'
    FROM mesas m, clientes c
    WHERE m.tenant_id = tid AND m.local_id = lid AND m.numero = '6'
      AND c.tenant_id = tid AND c.nombres = 'Carmen' AND c.apellidos = 'Fernández Torres'
      AND NOT EXISTS (SELECT 1 FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Carmen Fernández Torres' AND r.fecha_reserva = CURRENT_DATE);

    -- Reserva 2: Pendiente para mañana
    INSERT INTO reservas (tenant_id, local_id, nombre_contacto, telefono_contacto, numero_personas, fecha_reserva, hora_inicio, hora_fin, estado, ocasion)
    SELECT tid, lid, 'Roberto Gómez', '987654321', 6, CURRENT_DATE + 1, '13:00', '15:00', 'pendiente', 'familiar'
    WHERE NOT EXISTS (SELECT 1 FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Roberto Gómez' AND r.fecha_reserva = CURRENT_DATE + 1);

    -- Reserva 3: Completada (ayer)
    INSERT INTO reservas (tenant_id, local_id, mesa_id, cliente_id, usuario_asignador_id, nombre_contacto, telefono_contacto, numero_personas, fecha_reserva, hora_inicio, hora_fin, estado, ocasion)
    SELECT tid, lid, m.id, c.id, uid_admin, c.nombres || ' ' || c.apellidos, '999111222', 2, CURRENT_DATE - 1, '19:00', '20:30', 'completada', 'aniversario'
    FROM mesas m, clientes c
    WHERE m.tenant_id = tid AND m.local_id = lid AND m.numero = '10'
      AND c.tenant_id = tid AND c.nombres = 'Lucía' AND c.apellidos = 'Vega Mendoza'
      AND NOT EXISTS (SELECT 1 FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Lucía Vega Mendoza' AND r.fecha_reserva = CURRENT_DATE - 1);

    -- Historial para reserva completada
    INSERT INTO historial_estados_reserva (tenant_id, reserva_id, estado_anterior, estado_nuevo, usuario_id)
    SELECT tid, r.id, NULL, 'pendiente', uid_admin
    FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Lucía Vega Mendoza' AND r.fecha_reserva = CURRENT_DATE - 1
    UNION ALL
    SELECT tid, r.id, 'pendiente', 'confirmada', uid_admin
    FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Lucía Vega Mendoza' AND r.fecha_reserva = CURRENT_DATE - 1
    UNION ALL
    SELECT tid, r.id, 'confirmada', 'sentada', uid_mesero1
    FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Lucía Vega Mendoza' AND r.fecha_reserva = CURRENT_DATE - 1
    UNION ALL
    SELECT tid, r.id, 'sentada', 'completada', uid_mesero1
    FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Lucía Vega Mendoza' AND r.fecha_reserva = CURRENT_DATE - 1;

    -- Reserva 4: No show (ayer)
    INSERT INTO reservas (tenant_id, local_id, nombre_contacto, telefono_contacto, numero_personas, fecha_reserva, hora_inicio, hora_fin, estado, notas_internas)
    SELECT tid, lid, 'Martín Castillo', '955566677', 3, CURRENT_DATE - 1, '12:30', '14:00', 'no_show', 'Cliente no llegó ni llamó'
    WHERE NOT EXISTS (SELECT 1 FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Martín Castillo' AND r.fecha_reserva = CURRENT_DATE - 1);

    -- Reserva 5: Cancelada (ayer)
    INSERT INTO reservas (tenant_id, local_id, nombre_contacto, telefono_contacto, numero_personas, fecha_reserva, hora_inicio, hora_fin, estado, motivo_cancelacion)
    SELECT tid, lid, 'Diana Torres', '944433322', 5, CURRENT_DATE - 1, '20:00', '22:00', 'cancelada', 'Cambio de planes'
    WHERE NOT EXISTS (SELECT 1 FROM reservas r WHERE r.tenant_id = tid AND r.nombre_contacto = 'Diana Torres' AND r.fecha_reserva = CURRENT_DATE - 1);

-- ══════════════════════════════════════════════════════════════
-- 14. ACTUALIZAR CONTADORES DE TURNO
-- ══════════════════════════════════════════════════════════════

    UPDATE turnos_caja
    SET total_ventas = COALESCE((SELECT SUM(total) FROM ordenes o WHERE o.tenant_id = tid AND o.local_id = lid AND o.estado = 'pagada' AND o.turno_caja_id = turno_id), 0),
        cantidad_ordenes = COALESCE((SELECT COUNT(*) FROM ordenes o WHERE o.tenant_id = tid AND o.local_id = lid AND o.estado = 'pagada' AND o.turno_caja_id = turno_id), 0),
        updated_at = NOW()
    WHERE id = turno_id AND tenant_id = tid;

-- ══════════════════════════════════════════════════════════════
-- 15. ACTUALIZAR ESTADO DE MESAS
-- ══════════════════════════════════════════════════════════════

    -- Mesa 1 (orden 1 pagada) -> disponible
    UPDATE mesas SET estado = 'disponible', updated_at = NOW()
    WHERE tenant_id = tid AND local_id = lid AND numero = '1';

    -- Mesa 3 (orden 3 nueva) -> ocupada
    UPDATE mesas SET estado = 'ocupada', updated_at = NOW()
    WHERE tenant_id = tid AND local_id = lid AND numero = '3';

    -- Mesa 5 (orden 2 en cocina) -> ocupada
    UPDATE mesas SET estado = 'ocupada', updated_at = NOW()
    WHERE tenant_id = tid AND local_id = lid AND numero = '5';

    -- Mesa 6 (reserva para hoy) -> reservada
    UPDATE mesas SET estado = 'reservada', updated_at = NOW()
    WHERE tenant_id = tid AND local_id = lid AND numero = '6';

-- ══════════════════════════════════════════════════════════════
-- 16. DETALLE PAGOS (medios de pago por orden)
-- ══════════════════════════════════════════════════════════════

    -- Orden 1: pagó S/75.52 en efectivo (recibió S/80, vuelto S/4.48)
    INSERT INTO detalle_pagos (tenant_id, pago_id, metodo_pago_id, monto, referencia)
    SELECT tid, p.id, mp.id, p.monto_pagado, NULL
    FROM pagos p, metodos_pago mp
    WHERE p.tenant_id = tid AND mp.tenant_id = tid
      AND p.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0001')
      AND mp.nombre = 'Efectivo' AND mp.local_id = lid
      AND NOT EXISTS (SELECT 1 FROM detalle_pagos dp WHERE dp.tenant_id = tid AND dp.pago_id = p.id);

    -- Orden 4: pagó S/71.00 con Yape
    INSERT INTO detalle_pagos (tenant_id, pago_id, metodo_pago_id, monto, referencia)
    SELECT tid, p.id, mp.id, p.monto_pagado, 'yape-987654'
    FROM pagos p, metodos_pago mp
    WHERE p.tenant_id = tid AND mp.tenant_id = tid
      AND p.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0004')
      AND mp.nombre = 'Yape' AND mp.local_id = lid
      AND NOT EXISTS (SELECT 1 FROM detalle_pagos dp WHERE dp.tenant_id = tid AND dp.pago_id = p.id);

    -- Orden 5: pagó S/100.00 con Mercado Pago
    INSERT INTO detalle_pagos (tenant_id, pago_id, metodo_pago_id, monto, referencia)
    SELECT tid, p.id, mp.id, p.monto_pagado, 'MP-2026-00001'
    FROM pagos p, metodos_pago mp
    WHERE p.tenant_id = tid AND mp.tenant_id = tid
      AND p.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0005')
      AND mp.nombre = 'Mercado Pago' AND mp.local_id = lid
      AND NOT EXISTS (SELECT 1 FROM detalle_pagos dp WHERE dp.tenant_id = tid AND dp.pago_id = p.id);

    -- Orden 6: pagó S/22.00 en efectivo
    INSERT INTO detalle_pagos (tenant_id, pago_id, metodo_pago_id, monto, referencia)
    SELECT tid, p.id, mp.id, p.monto_pagado, NULL
    FROM pagos p, metodos_pago mp
    WHERE p.tenant_id = tid AND mp.tenant_id = tid
      AND p.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0006')
      AND mp.nombre = 'Efectivo' AND mp.local_id = lid
      AND NOT EXISTS (SELECT 1 FROM detalle_pagos dp WHERE dp.tenant_id = tid AND dp.pago_id = p.id);

-- ══════════════════════════════════════════════════════════════
-- 17. MODIFICADORES EN ITEMS DE ORDEN
-- ══════════════════════════════════════════════════════════════

    -- Orden 1: Lomo Saltado con Acompañamiento = Papas Fritas
    INSERT INTO modificadores_item_orden (tenant_id, item_orden_id, modificador_id, nombre_modificador, precio_adicional)
    SELECT tid, io.id, m.id, m.nombre, 0.00
    FROM items_orden io, productos_menu pm, modificadores m, grupos_modificadores g
    WHERE io.tenant_id = tid AND pm.tenant_id = tid
      AND io.producto_menu_id = pm.id AND pm.nombre = 'Lomo Saltado'
      AND io.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0001')
      AND m.nombre = 'Papas Fritas' AND g.nombre = 'Acompañamiento'
      AND m.grupo_id = g.id
      AND NOT EXISTS (SELECT 1 FROM modificadores_item_orden mio WHERE mio.tenant_id = tid AND mio.item_orden_id = io.id);

    -- Orden 2: Ceviche Clásico con Salsa de Rocoto
    INSERT INTO modificadores_item_orden (tenant_id, item_orden_id, modificador_id, nombre_modificador, precio_adicional)
    SELECT tid, io.id, m.id, m.nombre, 2.00
    FROM items_orden io, productos_menu pm, modificadores m, grupos_modificadores g
    WHERE io.tenant_id = tid AND pm.tenant_id = tid
      AND io.producto_menu_id = pm.id AND pm.nombre = 'Ceviche Clásico'
      AND io.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0002')
      AND m.nombre = 'Salsa de Rocoto' AND g.nombre = 'Salsa Adicional'
      AND m.grupo_id = g.id
      AND NOT EXISTS (SELECT 1 FROM modificadores_item_orden mio WHERE mio.tenant_id = tid AND mio.item_orden_id = io.id AND mio.modificador_id = m.id);

    -- Orden 2: Anticuchos con Acompañamiento = Camote Frito
    INSERT INTO modificadores_item_orden (tenant_id, item_orden_id, modificador_id, nombre_modificador, precio_adicional)
    SELECT tid, io.id, m.id, m.nombre, 3.00
    FROM items_orden io, productos_menu pm, modificadores m, grupos_modificadores g
    WHERE io.tenant_id = tid AND pm.tenant_id = tid
      AND io.producto_menu_id = pm.id AND pm.nombre = 'Anticuchos'
      AND io.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0002')
      AND m.nombre = 'Camote Frito' AND g.nombre = 'Acompañamiento'
      AND m.grupo_id = g.id
      AND NOT EXISTS (SELECT 1 FROM modificadores_item_orden mio WHERE mio.tenant_id = tid AND mio.item_orden_id = io.id AND mio.modificador_id = m.id);

-- ══════════════════════════════════════════════════════════════
-- 18. COMPROBANTES (boletas/facturas)
-- ══════════════════════════════════════════════════════════════

    INSERT INTO comprobantes (tenant_id, orden_id, pago_id, tipo_comprobante, serie, numero, subtotal, igv, total, estado, hash_sunat, fecha_emision)
    SELECT tid, o.id, p.id, 'boleta', 'B001', LPAD(ROW_NUMBER() OVER (ORDER BY o.id)::text, 8, '0'), o.subtotal, o.igv, o.total, 'emitido', NULL, o.fecha_completada
    FROM ordenes o
    JOIN pagos p ON p.orden_id = o.id AND p.tenant_id = tid
    WHERE o.tenant_id = tid AND o.local_id = lid AND o.estado = 'pagada'
      AND NOT EXISTS (SELECT 1 FROM comprobantes c WHERE c.tenant_id = tid AND c.orden_id = o.id);

-- ══════════════════════════════════════════════════════════════
-- 19. SEGUIMIENTO DELIVERY
-- ══════════════════════════════════════════════════════════════

    -- Orden 4 (entregado): historial completo
    INSERT INTO seguimiento_delivery (tenant_id, delivery_id, repartidor_id, latitud, longitud, estado_delivery, created_at)
    SELECT tid, d.id, COALESCE(d.repartidor_id, uid_repartidor), -12.1234, -77.0300, 'asignado', NOW() - INTERVAL '1 day' - INTERVAL '1 hour'
    FROM delivery_ordenes d WHERE d.tenant_id = tid AND d.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0004')
    UNION ALL
    SELECT tid, d.id, COALESCE(d.repartidor_id, uid_repartidor), -12.1250, -77.0320, 'en_camino', NOW() - INTERVAL '1 day' - INTERVAL '50 minutes'
    FROM delivery_ordenes d WHERE d.tenant_id = tid AND d.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0004')
    UNION ALL
    SELECT tid, d.id, COALESCE(d.repartidor_id, uid_repartidor), -12.1280, -77.0280, 'entregado', NOW() - INTERVAL '1 day' - INTERVAL '30 minutes'
    FROM delivery_ordenes d WHERE d.tenant_id = tid AND d.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0004');

    -- Orden 5 (en camino): estados
    INSERT INTO seguimiento_delivery (tenant_id, delivery_id, repartidor_id, latitud, longitud, estado_delivery, created_at)
    SELECT tid, d.id, COALESCE(d.repartidor_id, uid_repartidor), -12.0980, -77.0370, 'asignado', NOW() - INTERVAL '45 minutes'
    FROM delivery_ordenes d WHERE d.tenant_id = tid AND d.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0005')
    UNION ALL
    SELECT tid, d.id, COALESCE(d.repartidor_id, uid_repartidor), -12.1000, -77.0350, 'en_camino', NOW() - INTERVAL '20 minutes'
    FROM delivery_ordenes d WHERE d.tenant_id = tid AND d.orden_id = (SELECT id FROM ordenes WHERE numero_orden = 'BM-ORD-0005');

-- ══════════════════════════════════════════════════════════════
-- 20. AUDIT LOG (actividades recientes)
-- ══════════════════════════════════════════════════════════════

    INSERT INTO audit_log (tenant_id, usuario_id, accion, tabla_afectada, registro_id, ip_origen)
    SELECT tid, uid_cajero, 'pago.registrar', 'ordenes', o.id::text, '192.168.1.10'::inet
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    UNION ALL
    SELECT tid, uid_cajero, 'pago.registrar', 'ordenes', o.id::text, '192.168.1.10'::inet
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0004'
    UNION ALL
    SELECT tid, uid_cajero, 'pago.registrar', 'ordenes', o.id::text, '192.168.1.10'::inet
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0005'
    UNION ALL
    SELECT tid, uid_mesero1, 'orden.crear', 'ordenes', o.id::text, '192.168.1.10'::inet
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0001'
    UNION ALL
    SELECT tid, uid_mesero2, 'orden.crear', 'ordenes', o.id::text, '192.168.1.11'::inet
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0002'
    UNION ALL
    SELECT tid, uid_admin, 'reserva.crear', 'reservas', r.id::text, '192.168.1.100'::inet
    FROM reservas r WHERE r.estado = 'confirmada' AND r.fecha_reserva = CURRENT_DATE;

-- ══════════════════════════════════════════════════════════════
-- 21. TICKETS COCINA adicionales (para KDS)
-- ══════════════════════════════════════════════════════════════

    -- Ticket para Orden 2 (en cocina) — Ceviche Clásico + Anticuchos en preparación, Lomo Saltado + Seco pendientes
    INSERT INTO tickets_cocina (tenant_id, orden_id, local_id, cocinero_id, estacion_cocina, numero_ticket, estado, prioridad, notas)
    SELECT tid, o.id, lid, uid_cocinero1, 'Cocina Principal', 2, 'en_preparacion', 2, 'Entradas primero, fondos después — Ceviche y Anticuchos salen primero'
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0002'
      AND NOT EXISTS (SELECT 1 FROM tickets_cocina t WHERE t.tenant_id = tid AND t.orden_id = o.id AND t.numero_ticket = 2);

    -- Ticket para Orden 3 (nueva) — Ceviche Clásico + Ají de Gallina pendientes
    INSERT INTO tickets_cocina (tenant_id, orden_id, local_id, cocinero_id, estacion_cocina, numero_ticket, estado, prioridad)
    SELECT tid, o.id, lid, uid_cocinero1, 'Cocina Principal', 3, 'pendiente', 1
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0003'
      AND NOT EXISTS (SELECT 1 FROM tickets_cocina t WHERE t.tenant_id = tid AND t.orden_id = o.id AND t.numero_ticket = 3);

    -- Ticket para Orden 5 (delivery pagada) — Parrilla Mixta + Crema Volteada + Inca Kola (ya listos)
    INSERT INTO tickets_cocina (tenant_id, orden_id, local_id, cocinero_id, estacion_cocina, numero_ticket, estado, prioridad)
    SELECT tid, o.id, lid, uid_cocinero1, 'Cocina Principal', 4, 'listo', 3
    FROM ordenes o WHERE o.numero_orden = 'BM-ORD-0005'
      AND NOT EXISTS (SELECT 1 FROM tickets_cocina t WHERE t.tenant_id = tid AND t.orden_id = o.id AND t.numero_ticket = 4);

  -- ══════════════════════════════════════════════════════════════
  -- 22. COMPATIBILIDAD DE COLUMNAS LEGACY/NUEVAS
  -- ══════════════════════════════════════════════════════════════

    -- Garantizar que productos recién sembrados funcionen con el backend actual.
    UPDATE productos_menu
    SET
      categoria_menu_id = COALESCE(categoria_menu_id, categoria_id),
      precio_base = COALESCE(precio_base, precio),
      tiempo_preparacion = COALESCE(tiempo_preparacion, tiempo_preparacion_min),
      imagen_url = COALESCE(imagen_url, imagen_principal_url),
      alergenos = COALESCE(alergenos, contiene_alergenos),
      es_gluten_free = COALESCE(es_gluten_free, es_sin_gluten, false),
      es_popular = COALESCE(es_popular, destacado, false),
      disponible = COALESCE(disponible, (disponible_para_mesa OR disponible_para_llevar OR disponible_para_delivery), true),
      orden = COALESCE(orden, orden_display, 0)
    WHERE tenant_id = tid;

    UPDATE variantes_producto_menu
    SET
      producto_menu_id = COALESCE(producto_menu_id, producto_id),
      precio_adicional = COALESCE(precio_adicional, precio)
    WHERE tenant_id = tid;

END $$;
