-- ==========================================
-- 020 — Índices Especializados
-- RestauFlow SaaS Multi-Tenant
-- Resilient: skips indexes whose tables don't exist yet
-- ==========================================

DO $$
BEGIN
    -- Índices base tenant_id
    BEGIN CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_locales_tenant ON locales(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_zonas_tenant ON zonas(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_mesas_tenant ON mesas(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_categorias_menu_tenant ON categorias_menu(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_productos_menu_tenant ON productos_menu(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_insumos_tenant ON insumos(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_clientes_tenant ON clientes(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_ordenes_tenant ON ordenes(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_pagos_tenant ON pagos(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_reservas_tenant ON reservas(tenant_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;

    -- Índices parciales (solo activos — más rápidos)
    BEGIN CREATE INDEX idx_productos_activos ON productos_menu(tenant_id, categoria_id) WHERE eliminado = false AND activo = true; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;
    BEGIN CREATE INDEX idx_mesas_activas ON mesas(tenant_id, local_id, estado) WHERE eliminado = false AND activo = true; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;
    BEGIN CREATE INDEX idx_ordenes_activas ON ordenes(tenant_id, estado, local_id) WHERE eliminado = false; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Órdenes por estado (pantalla cocina — muy frecuente)
    BEGIN CREATE INDEX idx_ordenes_cocina ON ordenes(tenant_id, local_id, estado, created_at) WHERE estado IN ('nueva','en_cocina','listo') AND eliminado = false; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Items por orden
    BEGIN CREATE INDEX idx_items_orden ON items_orden(orden_id) WHERE estado != 'cancelado'; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Tickets cocina por local y estado (pantalla cocina en tiempo real)
    BEGIN CREATE INDEX idx_tickets_cocina_activos ON tickets_cocina(tenant_id, local_id, estado) WHERE estado IN ('pendiente','en_preparacion'); EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Mesas por estado (mapa de mesas — muy frecuente)
    BEGIN CREATE INDEX idx_mesas_estado ON mesas(tenant_id, local_id, estado, zona_id); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;

    -- Ventas por fecha (dashboard)
    BEGIN CREATE INDEX idx_ordenes_fecha ON ordenes(tenant_id, created_at DESC) WHERE eliminado = false; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;
    BEGIN CREATE INDEX idx_ordenes_fecha_local ON ordenes(tenant_id, local_id, created_at DESC) WHERE eliminado = false; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Reservas por fecha
    BEGIN CREATE INDEX idx_reservas_fecha ON reservas(tenant_id, local_id, fecha_reserva, estado); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;

    -- Delivery activos
    BEGIN CREATE INDEX idx_delivery_activos ON delivery_ordenes(tenant_id, estado_delivery) WHERE estado_delivery IN ('asignado','recogido','en_camino'); EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Clientes por celular cifrado
    BEGIN CREATE INDEX idx_clientes_celular ON clientes(tenant_id, numero_celular) WHERE eliminado = false; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Insumos con stock bajo
    BEGIN CREATE INDEX idx_insumos_stock ON insumos(tenant_id, stock_actual) WHERE eliminado = false AND activo = true; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Resumen diario para dashboard
    BEGIN CREATE INDEX idx_resumen_fecha ON resumen_diario(tenant_id, fecha DESC); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
    BEGIN CREATE INDEX idx_resumen_local ON resumen_diario(tenant_id, local_id, fecha DESC); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;

    -- Full-text search en productos del menú
    BEGIN CREATE INDEX idx_productos_fts ON productos_menu USING gin(to_tsvector('spanish', nombre)) WHERE eliminado = false; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;

    -- Audit log
    BEGIN CREATE INDEX idx_audit_fecha ON audit_log(tenant_id, created_at DESC); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;

    -- Movimientos inventario
    BEGIN CREATE INDEX idx_mov_insumo ON movimientos_inventario(tenant_id, insumo_id, created_at DESC); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;

    -- Suscripciones plataforma
    BEGIN CREATE INDEX idx_suscripciones_vencimiento ON suscripciones(estado, fecha_vencimiento) WHERE estado = 'activa'; EXCEPTION WHEN undefined_table OR duplicate_table OR undefined_column THEN NULL; END;
    BEGIN CREATE INDEX idx_tenants_estado ON tenants(estado); EXCEPTION WHEN undefined_table OR duplicate_table THEN NULL; END;
END $$;
