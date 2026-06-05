-- ==========================================
-- Migration 024: Seed Real — Reemplaza demo
-- 3 restaurantes reales, credenciales seguras
-- Hashes generados con golang.org/x/crypto/bcrypt cost 14 (idéntico al backend)
-- Idempotente via "WHERE NOT EXISTS"
-- ==========================================

-- ══════════════════════════════════════════════════════════════
-- 0. ELIMINAR DATOS DEMO
-- ══════════════════════════════════════════════════════════════
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM tenants WHERE slug = 'demo') THEN
        -- Eliminar en orden por FK (RLS policies bloquean CASCADE en algunos casos)
        DELETE FROM items_orden      WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM ordenes          WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM pagos            WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM reservas         WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM productos_menu   WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM categorias_menu  WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM mesas            WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM zonas            WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM usuarios         WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM locales          WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM suscripciones    WHERE tenant_id = '11111111-1111-1111-1111-111111111111'::uuid;
        DELETE FROM tenants          WHERE id        = '11111111-1111-1111-1111-111111111111'::uuid;
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 1. ACTUALIZAR SUPERADMIN DE PLATAFORMA
--    superadmin@restauflow.com  /  SuperAdmin.2026!
-- ══════════════════════════════════════════════════════════════
-- Hash: SuperAdmin.2026! — Go bcrypt cost 14
UPDATE superadmins
SET contrasena = '$2a$14$WTThhccCDUOk3dKvwLCgpOKAZa5jj5.wZIY7tpVPNA26IdUCsgz7G',
    nombre     = 'Alejandro',
    apellidos  = 'Vásquez',
    updated_at = NOW()
WHERE correo = 'superadmin@restauflow.com';

-- Si no existe aún, insertarlo
INSERT INTO superadmins (nombre, apellidos, correo, contrasena, nivel, activo)
SELECT 'Alejandro', 'Vásquez', 'superadmin@restauflow.com',
       '$2a$14$WTThhccCDUOk3dKvwLCgpOKAZa5jj5.wZIY7tpVPNA26IdUCsgz7G', 'superadmin', true
WHERE NOT EXISTS (SELECT 1 FROM superadmins WHERE correo = 'superadmin@restauflow.com');


-- ══════════════════════════════════════════════════════════════
-- ██████████████████████████████████████████████████████████████
-- RESTAURANTE 1: "La Buena Mesa"
-- Restaurante peruano clásico — Miraflores, Lima
-- Plan Pro  |  UUID: 22222222-2222-2222-2222-222222222222
-- ██████████████████████████████████████████████████████████████
-- ══════════════════════════════════════════════════════════════

-- ── Tenant ──────────────────────────────────────────────────
INSERT INTO tenants (id, nombre, slug, correo_contacto, tipo_restaurante, estado, dias_trial)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    'La Buena Mesa',
    'la-buena-mesa',
    'contacto@labuenamese.com',
    'restaurante',
    'activo',
    0
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'la-buena-mesa');

-- ── Suscripción Plan Pro ─────────────────────────────────────
INSERT INTO suscripciones (tenant_id, plan_id, estado, tipo_facturacion, fecha_inicio, fecha_vencimiento, renovacion_automatica)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    2, 'activa', 'mensual', NOW(), NOW() + INTERVAL '1 year', true
WHERE NOT EXISTS (SELECT 1 FROM suscripciones WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid);

-- ── Local ────────────────────────────────────────────────────
INSERT INTO locales (tenant_id, nombre, direccion, distrito, provincia, departamento,
                     es_principal, numero_pisos, horario_apertura, horario_cierre,
                     acepta_reservas, acepta_delivery)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Sede Miraflores',
    'Av. Larco 456',
    'Miraflores', 'Lima', 'Lima',
    true, 2, '12:00'::time, '23:00'::time, true, true
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid);

-- ── Zona ─────────────────────────────────────────────────────
INSERT INTO zonas (tenant_id, local_id, nombre, piso, color, orden)
SELECT t.tenant_id, t.id, 'Salón Principal', 1, '#16a34a', 1
FROM locales t WHERE t.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM zonas WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid AND nombre = 'Salón Principal');

INSERT INTO zonas (tenant_id, local_id, nombre, piso, color, orden)
SELECT t.tenant_id, t.id, 'Terraza', 2, '#84cc16', 2
FROM locales t WHERE t.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM zonas WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid AND nombre = 'Terraza');

-- ── Mesas (16 mesas) ─────────────────────────────────────────
INSERT INTO mesas (tenant_id, local_id, zona_id, numero, capacidad, estado, forma, posicion_x, posicion_y)
SELECT
    l.tenant_id, l.id, z.id,
    nums.n::varchar,
    CASE WHEN nums.n <= 4 THEN 2 WHEN nums.n <= 12 THEN 4 ELSE 6 END,
    'disponible',
    CASE WHEN nums.n % 3 = 0 THEN 'redonda' WHEN nums.n % 3 = 1 THEN 'cuadrada' ELSE 'rectangular' END,
    ((nums.n - 1) % 4) * 130,
    ((nums.n - 1) / 4) * 110
FROM locales l
JOIN zonas z ON z.local_id = l.id AND z.tenant_id = l.tenant_id AND z.nombre = 'Salón Principal'
CROSS JOIN generate_series(1, 16) AS nums(n)
WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM mesas WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid);

-- ── Usuarios ─────────────────────────────────────────────────
-- ADMIN: admin@labuenamese.com / BuenaMesa.Admin2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid, l.id,
    'Roberto', 'Quispe',
    'admin@labuenamese.com',
    '$2a$14$bhzYbQt.mHLc8AQLN3DfRuT9j1t/9BBYEnWgHc1bIy/7Qbyxmm5YK',
    'ADMIN', '1001', '#16a34a', true
FROM locales l WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@labuenamese.com');

-- GERENTE: gerente@labuenamese.com / BuenaMesa.Gerente2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid, l.id,
    'Sofía', 'Mendoza',
    'gerente@labuenamese.com',
    '$2a$14$LTB.ldJgS3pXDvLwAVYQLe8aLejnjx.PHXaRlFguoP6cdKOccxa1K',
    'GERENTE', '1002', '#4ade80', true
FROM locales l WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'gerente@labuenamese.com');

-- MESERO 1: mesero1@labuenamese.com / BuenaMesa.Mesero2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid, l.id,
    'Diego', 'Flores',
    'mesero1@labuenamese.com',
    '$2a$14$AX2eEmVqeUGuEJnobq6lj.wBOudco7fkOgwpluVh/qadmttPGxgFy',
    'MESERO', '1003', '#3b82f6', true
FROM locales l WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'mesero1@labuenamese.com');

-- MESERO 2: mesero2@labuenamese.com / BuenaMesa.Mesero2.2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid, l.id,
    'Valeria', 'Chávez',
    'mesero2@labuenamese.com',
    '$2a$14$6USIUxyhLUfJfxdab24SxuuH1p3LFoueOHdsC4ZFqurN4NNPOgY6W',
    'MESERO', '1004', '#60a5fa', true
FROM locales l WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'mesero2@labuenamese.com');

-- CAJERO: cajero@labuenamese.com / BuenaMesa.Cajero2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid, l.id,
    'Lucía', 'Paredes',
    'cajero@labuenamese.com',
    '$2a$14$EJXqHEW5zlcQKw/3PEzBqeIAjI./LMuYSxlxdsDzMeNZh3LMnGH2u',
    'CAJERO', '1005', '#a855f7', true
FROM locales l WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cajero@labuenamese.com');

-- COCINERO: cocinero@labuenamese.com / BuenaMesa.Cocina2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid, l.id,
    'Andrés', 'Sánchez',
    'cocinero@labuenamese.com',
    '$2a$14$NeGxlmYjQEOy1vWo9W06xOLMWGw627EIe9XJyt59VYUElSl4ydOcK',
    'COCINERO', '1006', '#f97316', true
FROM locales l WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cocinero@labuenamese.com');

-- ── Categorías del Menú ───────────────────────────────────────
INSERT INTO categorias_menu (tenant_id, nombre, slug, orden, activo)
SELECT '22222222-2222-2222-2222-222222222222'::uuid, cat.nombre, cat.slug, cat.ord, true
FROM (VALUES
    ('Entradas',         'entradas-bm',        1),
    ('Platos de Fondo',  'platos-fondo-bm',    2),
    ('Parrillas',        'parrillas-bm',       3),
    ('Postres',          'postres-bm',         4),
    ('Bebidas',          'bebidas-bm',         5)
) AS cat(nombre, slug, ord)
WHERE NOT EXISTS (SELECT 1 FROM categorias_menu WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid);

-- ── Productos del Menú ────────────────────────────────────────
INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    l.id, c.id, p.nombre, p.descrip, p.precio, p.tiempo, true, p.ord, p.dest
FROM locales l
CROSS JOIN (VALUES
    ('entradas-bm',     'Causa Rellena',          'Causa de papa amarilla con pollo y palta',        22.00, 10, 1, true),
    ('entradas-bm',     'Anticuchos',              'Anticuchos de corazón con choclo y papa',         28.00, 15, 2, true),
    ('entradas-bm',     'Tequeños con Guacamole',  'Tequeños crujientes con dip de guacamole',        20.00, 12, 3, false),
    ('platos-fondo-bm', 'Lomo Saltado',            'Lomo fino salteado con papas y arroz',            42.00, 20, 1, true),
    ('platos-fondo-bm', 'Ají de Gallina',          'Gallina en crema de ají amarillo con arroz',      36.00, 20, 2, false),
    ('platos-fondo-bm', 'Seco de Cordero',         'Cordero con chicha, cilantro y frijoles',         45.00, 25, 3, true),
    ('platos-fondo-bm', 'Arroz con Pollo',         'Arroz verde con pechuga al jugo',                 34.00, 22, 4, false),
    ('parrillas-bm',    'Parrilla Mixta p/2',      'Pollo, lomo, chorizo, chuleta con guarnición',    85.00, 35, 1, true),
    ('parrillas-bm',    'Churrasco',               'Churrasco de res al carbón con ensalada',         58.00, 30, 2, false),
    ('postres-bm',      'Suspiro Limeño',          'Manjar blanco con merengue de oporto',            14.00,  5, 1, false),
    ('postres-bm',      'Tres Leches',             'Bizcocho bañado en tres leches',                  16.00,  5, 2, true),
    ('bebidas-bm',      'Pisco Sour',              'Cóctel clásico de pisco quebranta',               22.00,  5, 1, true),
    ('bebidas-bm',      'Chicha Morada 1L',        'Chicha morada artesanal',                         14.00,  3, 2, false),
    ('bebidas-bm',      'Inca Kola 600ml',         'Inca Kola personal',                               8.00,  1, 3, false)
) AS p(cat_slug, nombre, descrip, precio, tiempo, ord, dest)
JOIN categorias_menu c ON c.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid AND c.slug = p.cat_slug
WHERE l.tenant_id = '22222222-2222-2222-2222-222222222222'::uuid
  AND NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = '22222222-2222-2222-2222-222222222222'::uuid);


-- ══════════════════════════════════════════════════════════════
-- ██████████████████████████████████████████████████████████████
-- RESTAURANTE 2: "El Rincón Criollo"
-- Comida criolla peruana — San Isidro, Lima
-- Plan Pro  |  UUID: 33333333-3333-3333-3333-333333333333
-- ██████████████████████████████████████████████████████████████
-- ══════════════════════════════════════════════════════════════

-- ── Tenant ──────────────────────────────────────────────────
INSERT INTO tenants (id, nombre, slug, correo_contacto, tipo_restaurante, estado, dias_trial)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    'El Rincón Criollo',
    'rincon-criollo',
    'contacto@rinconcriollo.com',
    'restaurante',
    'activo',
    0
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'rincon-criollo');

-- ── Suscripción Plan Pro ─────────────────────────────────────
INSERT INTO suscripciones (tenant_id, plan_id, estado, tipo_facturacion, fecha_inicio, fecha_vencimiento, renovacion_automatica)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    2, 'activa', 'mensual', NOW(), NOW() + INTERVAL '1 year', true
WHERE NOT EXISTS (SELECT 1 FROM suscripciones WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid);

-- ── Local ────────────────────────────────────────────────────
INSERT INTO locales (tenant_id, nombre, direccion, distrito, provincia, departamento,
                     es_principal, numero_pisos, horario_apertura, horario_cierre,
                     acepta_reservas, acepta_delivery)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Local San Isidro',
    'Calle Los Álamos 892',
    'San Isidro', 'Lima', 'Lima',
    true, 1, '11:00'::time, '22:30'::time, true, true
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid);

-- ── Zona ─────────────────────────────────────────────────────
INSERT INTO zonas (tenant_id, local_id, nombre, piso, color, orden)
SELECT t.tenant_id, t.id, 'Comedor', 1, '#dc2626', 1
FROM locales t WHERE t.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM zonas WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid AND nombre = 'Comedor');

INSERT INTO zonas (tenant_id, local_id, nombre, piso, color, orden)
SELECT t.tenant_id, t.id, 'Bar', 1, '#f97316', 2
FROM locales t WHERE t.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM zonas WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid AND nombre = 'Bar');

-- ── Mesas (14 mesas) ─────────────────────────────────────────
INSERT INTO mesas (tenant_id, local_id, zona_id, numero, capacidad, estado, forma, posicion_x, posicion_y)
SELECT
    l.tenant_id, l.id, z.id,
    nums.n::varchar,
    CASE WHEN nums.n <= 6 THEN 4 ELSE 6 END,
    'disponible',
    CASE WHEN nums.n % 2 = 0 THEN 'redonda' ELSE 'cuadrada' END,
    ((nums.n - 1) % 4) * 130,
    ((nums.n - 1) / 4) * 110
FROM locales l
JOIN zonas z ON z.local_id = l.id AND z.tenant_id = l.tenant_id AND z.nombre = 'Comedor'
CROSS JOIN generate_series(1, 14) AS nums(n)
WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM mesas WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid);

-- ── Usuarios ─────────────────────────────────────────────────
-- ADMIN: admin@rinconcriollo.com / Criollo.Admin2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid, l.id,
    'Patricia', 'Huanca',
    'admin@rinconcriollo.com',
    '$2a$14$zInBNeSJcO9ovbSyE9J8zeW9zjg1DFfRlTfeQ0sVhgRiZDVKgD4l6',
    'ADMIN', '2001', '#dc2626', true
FROM locales l WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@rinconcriollo.com');

-- MESERO 1: mesero1@rinconcriollo.com / Criollo.Mesero2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid, l.id,
    'Juan', 'Castillo',
    'mesero1@rinconcriollo.com',
    '$2a$14$mjlvN0XvjaKtcdGT7XWsN.N4WR4I5lr60lIGbJomWal1uw8yVVG5u',
    'MESERO', '2002', '#3b82f6', true
FROM locales l WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'mesero1@rinconcriollo.com');

-- MESERO 2: mesero2@rinconcriollo.com / Criollo.Mesero2.2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid, l.id,
    'Ana', 'Ríos',
    'mesero2@rinconcriollo.com',
    '$2a$14$CmT.4a9oz8xNbUIGij39fuotj/czuGd0st8LGQpxdSgpqysj9KK8a',
    'MESERO', '2003', '#60a5fa', true
FROM locales l WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'mesero2@rinconcriollo.com');

-- CAJERO: cajero@rinconcriollo.com / Criollo.Cajero2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid, l.id,
    'Carmen', 'Villanueva',
    'cajero@rinconcriollo.com',
    '$2a$14$Bfh.GBPyZfEUEyygiUGi1eCxKlbAxI.bJjmyoLbEeMQRza1PXlIPa',
    'CAJERO', '2004', '#a855f7', true
FROM locales l WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cajero@rinconcriollo.com');

-- COCINERO 1: cocinero1@rinconcriollo.com / Criollo.Cocina2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid, l.id,
    'Miguel', 'Torres',
    'cocinero1@rinconcriollo.com',
    '$2a$14$mE6Od00ujZwJSj0tTqXFeOZesctGvGVYAvYWrsT4sRVYCm1uS4tsC',
    'COCINERO', '2005', '#f97316', true
FROM locales l WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cocinero1@rinconcriollo.com');

-- COCINERO 2 (Ayudante): cocinero2@rinconcriollo.com / Criollo.Cocina2.2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid, l.id,
    'José', 'Mamani',
    'cocinero2@rinconcriollo.com',
    '$2a$14$aYQPOlM0axaYXXjDqmn82Ol8fDl63lcJbpXcMcHiqhCQ/YzR1O53q',
    'COCINERO', '2006', '#fb923c', true
FROM locales l WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cocinero2@rinconcriollo.com');

-- ── Categorías del Menú ───────────────────────────────────────
INSERT INTO categorias_menu (tenant_id, nombre, slug, orden, activo)
SELECT '33333333-3333-3333-3333-333333333333'::uuid, cat.nombre, cat.slug, cat.ord, true
FROM (VALUES
    ('Sopas y Cremas',   'sopas-rc',           1),
    ('Platos Criollos',  'platos-criollos-rc', 2),
    ('Arroces',          'arroces-rc',         3),
    ('Postres Criollos', 'postres-rc',         4),
    ('Bebidas',          'bebidas-rc',         5)
) AS cat(nombre, slug, ord)
WHERE NOT EXISTS (SELECT 1 FROM categorias_menu WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid);

-- ── Productos del Menú ────────────────────────────────────────
INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    l.id, c.id, p.nombre, p.descrip, p.precio, p.tiempo, true, p.ord, p.dest
FROM locales l
CROSS JOIN (VALUES
    ('sopas-rc',         'Sopa a la Minuta',       'Sopa de fideos con huevo y carne',               18.00, 15, 1, false),
    ('sopas-rc',         'Parihuela',               'Sopa de mariscos al estilo criollo',             38.00, 20, 2, true),
    ('sopas-rc',         'Caldo de Gallina',        'Caldo reconfortante con fideos y papa',          22.00, 20, 3, false),
    ('platos-criollos-rc','Carapulcra con Sopa Seca','Guiso de papa seca con sopa seca de fideos',    36.00, 25, 1, true),
    ('platos-criollos-rc','Escabeche de Pollo',     'Pollo en escabeche con cebolla y ají',           32.00, 20, 2, false),
    ('platos-criollos-rc','Estofado de Pollo',      'Guiso de pollo con verduras y aceitunas',        30.00, 22, 3, false),
    ('platos-criollos-rc','Cabrito con Frijoles',   'Cabrito guisado con frijoles y yuca',            42.00, 30, 4, true),
    ('arroces-rc',       'Arroz con Leche',         'Postre de arroz en leche azucarada con canela',  14.00,  8, 1, true),
    ('arroces-rc',       'Arroz Tapado',            'Arroz relleno de carne molida guisada',          28.00, 18, 2, false),
    ('postres-rc',       'Mazamorra Morada',        'Postre de maíz morado con frutas',               12.00,  5, 1, true),
    ('postres-rc',       'Picarones',               'Picarones con miel de caña',                     14.00, 15, 2, false),
    ('bebidas-rc',       'Chicha de Jora',          'Chicha fermentada artesanal',                    10.00,  3, 1, true),
    ('bebidas-rc',       'Emoliente',               'Bebida herbal con linaza y hierbas',              8.00,  3, 2, false),
    ('bebidas-rc',       'Maracuyá Frozen',         'Jugo de maracuyá con hielo',                     12.00,  5, 3, false)
) AS p(cat_slug, nombre, descrip, precio, tiempo, ord, dest)
JOIN categorias_menu c ON c.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid AND c.slug = p.cat_slug
WHERE l.tenant_id = '33333333-3333-3333-3333-333333333333'::uuid
  AND NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = '33333333-3333-3333-3333-333333333333'::uuid);


-- ══════════════════════════════════════════════════════════════
-- ██████████████████████████████████████████████████████████████
-- RESTAURANTE 3: "Sabor Marino"
-- Cevichería y mariscos — Barranco, Lima
-- Plan Básico  |  UUID: 44444444-4444-4444-4444-444444444444
-- ██████████████████████████████████████████████████████████████
-- ══════════════════════════════════════════════════════════════

-- ── Tenant ──────────────────────────────────────────────────
INSERT INTO tenants (id, nombre, slug, correo_contacto, tipo_restaurante, estado, dias_trial)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Sabor Marino',
    'sabor-marino',
    'contacto@sabormarino.com',
    'cevicheria',
    'activo',
    0
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'sabor-marino');

-- ── Suscripción Plan Básico ──────────────────────────────────
INSERT INTO suscripciones (tenant_id, plan_id, estado, tipo_facturacion, fecha_inicio, fecha_vencimiento, renovacion_automatica)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid,
    1, 'activa', 'mensual', NOW(), NOW() + INTERVAL '1 year', true
WHERE NOT EXISTS (SELECT 1 FROM suscripciones WHERE tenant_id = '44444444-4444-4444-4444-444444444444'::uuid);

-- ── Local ────────────────────────────────────────────────────
INSERT INTO locales (tenant_id, nombre, direccion, distrito, provincia, departamento,
                     es_principal, numero_pisos, horario_apertura, horario_cierre,
                     acepta_reservas, acepta_delivery)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Local Barranco',
    'Jr. Gran 347',
    'Barranco', 'Lima', 'Lima',
    true, 1, '11:30'::time, '21:00'::time, false, true
WHERE NOT EXISTS (SELECT 1 FROM locales WHERE tenant_id = '44444444-4444-4444-4444-444444444444'::uuid);

-- ── Zona ─────────────────────────────────────────────────────
INSERT INTO zonas (tenant_id, local_id, nombre, piso, color, orden)
SELECT t.tenant_id, t.id, 'Salón', 1, '#0ea5e9', 1
FROM locales t WHERE t.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM zonas WHERE tenant_id = '44444444-4444-4444-4444-444444444444'::uuid);

-- ── Mesas (10 mesas) ─────────────────────────────────────────
INSERT INTO mesas (tenant_id, local_id, zona_id, numero, capacidad, estado, forma, posicion_x, posicion_y)
SELECT
    l.tenant_id, l.id, z.id,
    nums.n::varchar,
    CASE WHEN nums.n <= 5 THEN 4 ELSE 6 END,
    'disponible', 'redonda',
    ((nums.n - 1) % 5) * 130,
    ((nums.n - 1) / 5) * 110
FROM locales l
JOIN zonas z ON z.local_id = l.id AND z.tenant_id = l.tenant_id
CROSS JOIN generate_series(1, 10) AS nums(n)
WHERE l.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM mesas WHERE tenant_id = '44444444-4444-4444-4444-444444444444'::uuid);

-- ── Usuarios ─────────────────────────────────────────────────
-- ADMIN: admin@sabormarino.com / Marino.Admin2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid, l.id,
    'Fernando', 'Ccopa',
    'admin@sabormarino.com',
    '$2a$14$KvLnMW1EuHVv7YS/m4CIleq6nxPeGIRZG6ONHHjNhxFCBo1G.pS8u',
    'ADMIN', '3001', '#0ea5e9', true
FROM locales l WHERE l.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@sabormarino.com');

-- MESERO: mesero@sabormarino.com / Marino.Mesero2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid, l.id,
    'Gabriela', 'Sucari',
    'mesero@sabormarino.com',
    '$2a$14$IFzPkbxpCa2wQRlNDCXvdeBxePF5oSUCZT3J3P4x1ew3tnam8Pk4q',
    'MESERO', '3002', '#38bdf8', true
FROM locales l WHERE l.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'mesero@sabormarino.com');

-- CAJERO: cajero@sabormarino.com / Marino.Cajero2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid, l.id,
    'Rosa', 'Apaza',
    'cajero@sabormarino.com',
    '$2a$14$sIiKHSDQu7mfAmdDsX8wZO4DvH5ZQmMNQ1rO0Z.pv.Tx.GlvYVrQy',
    'CAJERO', '3003', '#a855f7', true
FROM locales l WHERE l.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cajero@sabormarino.com');

-- COCINERO: cocinero@sabormarino.com / Marino.Cocina2026!
INSERT INTO usuarios (tenant_id, local_id, nombre, apellidos, correo, contrasena, rol, pin_acceso, color_identificacion, activo)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid, l.id,
    'Raúl', 'Condori',
    'cocinero@sabormarino.com',
    '$2a$14$HKCPusXMDrTk/gO0DH3KIO2a5kwNjOjSCGXr/swnvgEzyg7XC0S0C',
    'COCINERO', '3004', '#f97316', true
FROM locales l WHERE l.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'cocinero@sabormarino.com');

-- ── Categorías del Menú ───────────────────────────────────────
INSERT INTO categorias_menu (tenant_id, nombre, slug, orden, activo)
SELECT '44444444-4444-4444-4444-444444444444'::uuid, cat.nombre, cat.slug, cat.ord, true
FROM (VALUES
    ('Ceviches',        'ceviches-sm',        1),
    ('Tiraditos',       'tiraditos-sm',       2),
    ('Platos de Mar',   'platos-mar-sm',      3),
    ('Causas Marinas',  'causas-sm',          4),
    ('Bebidas',         'bebidas-sm',         5)
) AS cat(nombre, slug, ord)
WHERE NOT EXISTS (SELECT 1 FROM categorias_menu WHERE tenant_id = '44444444-4444-4444-4444-444444444444'::uuid);

-- ── Productos del Menú ────────────────────────────────────────
INSERT INTO productos_menu (tenant_id, local_id, categoria_id, nombre, descripcion_corta, precio, tiempo_preparacion_min, activo, orden_display, destacado)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid,
    l.id, c.id, p.nombre, p.descrip, p.precio, p.tiempo, true, p.ord, p.dest
FROM locales l
CROSS JOIN (VALUES
    ('ceviches-sm',   'Ceviche Clásico',          'Pescado fresco en leche de tigre con ají limo',      48.00, 12, 1, true),
    ('ceviches-sm',   'Ceviche Mixto',             'Pescado, mariscos y pulpo en leche de tigre',        58.00, 12, 2, true),
    ('ceviches-sm',   'Ceviche de Conchas Negras', 'Conchas negras en leche de tigre especial',          55.00, 10, 3, false),
    ('tiraditos-sm',  'Tiradito Clásico',          'Pescado en láminas con crema de ají amarillo',       45.00, 10, 1, true),
    ('tiraditos-sm',  'Tiradito Nikkei',           'Tiradito con toques japoneses y sésamo',             52.00, 12, 2, false),
    ('platos-mar-sm', 'Arroz con Mariscos',        'Arroz cremoso con mix de mariscos frescos',          62.00, 25, 1, true),
    ('platos-mar-sm', 'Parihuela del Día',         'Sopa de mariscos con el mejor caldo del mar',        55.00, 20, 2, true),
    ('platos-mar-sm', 'Jalea Mixta',               'Mix de mariscos apanados con yuca y salsa criolla',  58.00, 20, 3, false),
    ('platos-mar-sm', 'Sudado de Pescado',         'Pescado en caldo de tomate y ají panca',             48.00, 22, 4, false),
    ('causas-sm',     'Causa Marina',              'Causa de papa amarilla rellena con mariscos',        35.00, 10, 1, true),
    ('causas-sm',     'Causa de Cangrejo',         'Causa rellena de cangrejo con palta',                38.00, 12, 2, false),
    ('bebidas-sm',    'Leche de Tigre Shot',       'Shot de leche de tigre para el tono',                12.00,  3, 1, true),
    ('bebidas-sm',    'Chicha Morada 1L',          'Chicha artesanal de maíz morado',                    14.00,  3, 2, false),
    ('bebidas-sm',    'Maracuyá Sour',             'Cóctel de maracuyá estilo sour',                     20.00,  5, 3, false)
) AS p(cat_slug, nombre, descrip, precio, tiempo, ord, dest)
JOIN categorias_menu c ON c.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid AND c.slug = p.cat_slug
WHERE l.tenant_id = '44444444-4444-4444-4444-444444444444'::uuid
  AND NOT EXISTS (SELECT 1 FROM productos_menu WHERE tenant_id = '44444444-4444-4444-4444-444444444444'::uuid);
