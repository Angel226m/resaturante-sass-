-- ==========================================
-- 020 — Índices Especializados
-- RestauFlow SaaS Multi-Tenant
-- ==========================================

-- Índices base tenant_id
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX idx_locales_tenant ON locales(tenant_id);
CREATE INDEX idx_zonas_tenant ON zonas(tenant_id);
CREATE INDEX idx_mesas_tenant ON mesas(tenant_id);
CREATE INDEX idx_categorias_menu_tenant ON categorias_menu(tenant_id);
CREATE INDEX idx_productos_menu_tenant ON productos_menu(tenant_id);
CREATE INDEX idx_insumos_tenant ON insumos(tenant_id);
CREATE INDEX idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX idx_ordenes_tenant ON ordenes(tenant_id);
CREATE INDEX idx_pagos_tenant ON pagos(tenant_id);
CREATE INDEX idx_reservas_tenant ON reservas(tenant_id);

-- Índices parciales (solo activos — más rápidos)
CREATE INDEX idx_productos_activos ON productos_menu(tenant_id, categoria_id)
    WHERE eliminado = false AND activo = true;
CREATE INDEX idx_mesas_activas ON mesas(tenant_id, local_id, estado)
    WHERE eliminado = false AND activo = true;
CREATE INDEX idx_ordenes_activas ON ordenes(tenant_id, estado, local_id)
    WHERE eliminado = false;

-- Órdenes por estado (pantalla cocina — muy frecuente)
CREATE INDEX idx_ordenes_cocina ON ordenes(tenant_id, local_id, estado, created_at)
    WHERE estado IN ('nueva','en_cocina','listo') AND eliminado = false;

-- Items por orden
CREATE INDEX idx_items_orden ON items_orden(orden_id)
    WHERE estado != 'cancelado';

-- Tickets cocina por local y estado (pantalla cocina en tiempo real)
CREATE INDEX idx_tickets_cocina_activos ON tickets_cocina(tenant_id, local_id, estado)
    WHERE estado IN ('pendiente','en_preparacion');

-- Mesas por estado (mapa de mesas — muy frecuente)
CREATE INDEX idx_mesas_estado ON mesas(tenant_id, local_id, estado, zona_id);

-- Ventas por fecha (dashboard)
CREATE INDEX idx_ordenes_fecha ON ordenes(tenant_id, created_at DESC)
    WHERE eliminado = false;
CREATE INDEX idx_ordenes_fecha_local ON ordenes(tenant_id, local_id, created_at DESC)
    WHERE eliminado = false;

-- Reservas por fecha
CREATE INDEX idx_reservas_fecha ON reservas(tenant_id, local_id, fecha_reserva, estado);

-- Delivery activos
CREATE INDEX idx_delivery_activos ON delivery_ordenes(tenant_id, estado_delivery)
    WHERE estado_delivery IN ('asignado','recogido','en_camino');

-- Clientes por celular cifrado
CREATE INDEX idx_clientes_celular ON clientes(tenant_id, numero_celular)
    WHERE eliminado = false;

-- Insumos con stock bajo
CREATE INDEX idx_insumos_stock ON insumos(tenant_id, stock_actual)
    WHERE eliminado = false AND activo = true;

-- Resumen diario para dashboard
CREATE INDEX idx_resumen_fecha ON resumen_diario(tenant_id, fecha DESC);
CREATE INDEX idx_resumen_local ON resumen_diario(tenant_id, local_id, fecha DESC);

-- Full-text search en productos del menú
CREATE INDEX idx_productos_fts ON productos_menu
    USING gin(to_tsvector('spanish', nombre))
    WHERE eliminado = false;

-- Audit log
CREATE INDEX idx_audit_fecha ON audit_log(tenant_id, created_at DESC);

-- Movimientos inventario
CREATE INDEX idx_mov_insumo ON movimientos_inventario(tenant_id, insumo_id, created_at DESC);

-- Suscripciones plataforma
CREATE INDEX idx_suscripciones_vencimiento ON suscripciones(estado, fecha_vencimiento)
    WHERE estado = 'activa';
CREATE INDEX idx_tenants_estado ON tenants(estado);
