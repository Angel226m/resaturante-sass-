-- ==========================================
-- 019 — RLS Policies
-- RestauFlow SaaS Multi-Tenant
-- Resilient: uses IF EXISTS / DO blocks to skip tables not yet created
-- ==========================================

-- Habilitar RLS en TODAS las tablas con tenant_id
ALTER TABLE IF EXISTS usuarios                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locales                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS zonas                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mesas                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS configuracion_restaurante     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categorias_menu               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_horarios                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS productos_menu                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS producto_menu_imagenes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS variantes_producto_menu       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grupos_modificadores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS modificadores                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS producto_grupos_modificadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS combos                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS detalle_combos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS promociones                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cupones                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insumo_categorias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unidades_medida               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insumos                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recetas                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS detalle_receta                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_insumo_por_local        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movimientos_inventario        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proveedores                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ordenes_compra                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS detalle_ordenes_compra        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clientes                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS direcciones_cliente           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movimientos_puntos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reservas                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS historial_estados_reserva     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ordenes                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS items_orden                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS modificadores_item_orden      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS historial_estados_orden       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets_cocina                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS turnos_caja                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS metodos_pago                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pagos                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS detalle_pagos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comprobantes                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS zonas_delivery                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS delivery_ordenes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seguimiento_delivery          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resumen_diario                ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alertas_stock_insumos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tokens_recuperacion           ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento por tenant
-- Wrapped in a single DO block so missing tables are skipped gracefully
DO $$
BEGIN
    BEGIN CREATE POLICY tenant_isolation_usuarios        ON usuarios                      USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_locales         ON locales                       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_zonas           ON zonas                         USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_mesas           ON mesas                         USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_configuracion   ON configuracion_restaurante     USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_categorias_menu ON categorias_menu               USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_menu_horarios   ON menu_horarios                 USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_productos_menu  ON productos_menu                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_producto_imagenes ON producto_menu_imagenes      USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_variantes       ON variantes_producto_menu       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_grupos_mod      ON grupos_modificadores          USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_modificadores   ON modificadores                 USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_prod_grupos_mod ON producto_grupos_modificadores USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_combos          ON combos                        USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_detalle_combos  ON detalle_combos                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_promociones     ON promociones                   USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_cupones         ON cupones                       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_insumo_cat      ON insumo_categorias             USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_unidades        ON unidades_medida               USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_insumos         ON insumos                       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_recetas         ON recetas                       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_detalle_receta  ON detalle_receta                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_stock_local     ON stock_insumo_por_local        USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_mov_inv         ON movimientos_inventario        USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_proveedores     ON proveedores                   USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_ordenes_compra  ON ordenes_compra                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_det_oc          ON detalle_ordenes_compra        USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_clientes        ON clientes                      USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_dir_cliente     ON direcciones_cliente           USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_mov_puntos      ON movimientos_puntos            USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_reservas        ON reservas                      USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_hist_reserva    ON historial_estados_reserva     USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_ordenes         ON ordenes                       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_items_orden     ON items_orden                   USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_mod_item        ON modificadores_item_orden      USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_hist_orden      ON historial_estados_orden       USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_tickets         ON tickets_cocina                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_turnos          ON turnos_caja                   USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_met_pago        ON metodos_pago                  USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_pagos           ON pagos                         USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_det_pagos       ON detalle_pagos                 USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_comprobantes    ON comprobantes                  USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_zonas_del       ON zonas_delivery                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_del_ordenes     ON delivery_ordenes              USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_seg_del         ON seguimiento_delivery          USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_resumen         ON resumen_diario                USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_alertas         ON alertas_stock_insumos         USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_audit           ON audit_log                     USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY tenant_isolation_tokens          ON tokens_recuperacion           USING (tenant_id = current_setting('app.tenant_id')::uuid); EXCEPTION WHEN undefined_table OR duplicate_object THEN NULL; END;
END $$;
