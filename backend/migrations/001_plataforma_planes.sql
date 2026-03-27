-- ==========================================
-- 001 — Plataforma: Planes
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Tabla de planes de suscripción de la plataforma
CREATE TABLE IF NOT EXISTS planes (
    id                          SERIAL PRIMARY KEY,
    nombre                      VARCHAR(50) NOT NULL,
    descripcion                 TEXT,
    precio_mensual              NUMERIC(10,2) NOT NULL,
    precio_anual                NUMERIC(10,2),
    max_usuarios                INT,
    max_locales                 INT DEFAULT 1,
    max_mesas                   INT DEFAULT 20,
    max_productos_menu          INT,
    max_storage_mb              INT DEFAULT 1000,
    tiene_delivery              BOOLEAN DEFAULT false,
    tiene_reservas              BOOLEAN DEFAULT false,
    tiene_cocina_pantalla       BOOLEAN DEFAULT false,
    tiene_multi_local           BOOLEAN DEFAULT false,
    tiene_inventario_avanzado   BOOLEAN DEFAULT false,
    tiene_recetas               BOOLEAN DEFAULT false,
    tiene_combos                BOOLEAN DEFAULT false,
    tiene_promociones           BOOLEAN DEFAULT false,
    tiene_puntos_fidelidad      BOOLEAN DEFAULT false,
    tiene_reportes_avanzados    BOOLEAN DEFAULT false,
    tiene_websockets            BOOLEAN DEFAULT false,
    tiene_api_access            BOOLEAN DEFAULT false,
    tiene_qr_mesa               BOOLEAN DEFAULT false,
    tiene_facturacion_sunat     BOOLEAN DEFAULT false,
    orden_display               INT DEFAULT 0,
    es_popular                  BOOLEAN DEFAULT false,
    activo                      BOOLEAN DEFAULT true,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Características descriptivas de cada plan (para mostrar en pricing)
CREATE TABLE IF NOT EXISTS caracteristicas_plan (
    id          SERIAL PRIMARY KEY,
    plan_id     INT NOT NULL REFERENCES planes(id) ON DELETE CASCADE,
    descripcion VARCHAR(200) NOT NULL,
    incluido    BOOLEAN DEFAULT true,
    orden       INT DEFAULT 0
);

-- Datos iniciales de planes
INSERT INTO planes (nombre, descripcion, precio_mensual, precio_anual, max_usuarios, max_locales, max_mesas, max_productos_menu, tiene_delivery, tiene_reservas, tiene_cocina_pantalla, tiene_inventario_avanzado, tiene_recetas, tiene_combos, tiene_promociones, tiene_puntos_fidelidad, tiene_reportes_avanzados, tiene_websockets, tiene_api_access, tiene_qr_mesa, tiene_facturacion_sunat, orden_display, es_popular)
VALUES
    ('Básico',    'Para restaurantes pequeños que inician su digitalización', 49.00,  490.00,  3, 1, 10, 50,   false, false, false, false, false, false, false, false, false, false, false, false, false, 1, false),
    ('Pro',       'Para restaurantes en crecimiento con múltiples necesidades', 99.00,  990.00,  10, 1, 30, 200,  true,  true,  true,  false, false, true,  true,  false, true,  true,  false, true,  false, 2, true),
    ('Premium',   'Para cadenas y restaurantes con operación avanzada', 199.00, 1990.00, 30, 3, 100, NULL, true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  3, false),
    ('Enterprise','Solución personalizada para grandes operaciones', 499.00, 4990.00, NULL, NULL, NULL, NULL, true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  4, false);
