-- ==========================================
-- 027 — Disable RLS (temporary fix for 500 errors)
-- RestauFlow SaaS Multi-Tenant
--
-- PROBLEMA:
--   Las políticas RLS usan current_setting('app.tenant_id')::uuid pero el backend
--   NUNCA ejecuta SET app.tenant_id antes de las consultas. La función
--   SetTenantEnTransaccion existe pero no es llamada desde ningún repositorio.
--   Como resultado, current_setting() lanza:
--     "unrecognized configuration parameter 'app.tenant_id'"
--   causando 500 Internal Server Error en TODOS los endpoints.
--
-- SOLUCIÓN:
--   El backend YA filtra por tenant_id = $1 en CADA consulta a nivel aplicación.
--   RLS es redundante como defensa-en-profundidad pero no se implementó
--   correctamente (falta SET app.tenant_id). Se desactiva RLS temporalmente
--   hasta que se implemente el uso de transacciones por request.
-- ==========================================

DO $$
DECLARE
    pol RECORD;
    tbl RECORD;
BEGIN
    -- 1. Eliminar todas las políticas tenant_isolation_*
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE policyname LIKE 'tenant_isolation_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;

    -- 2. Deshabilitar RLS en todas las tablas que lo tengan habilitado
    FOR tbl IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE tablename IN (
            'usuarios', 'locales', 'zonas', 'mesas', 'configuracion_restaurante',
            'categorias_menu', 'menu_horarios', 'productos_menu', 'producto_menu_imagenes',
            'variantes_producto_menu', 'grupos_modificadores', 'modificadores',
            'producto_grupos_modificadores', 'combos', 'detalle_combos', 'promociones',
            'cupones', 'insumo_categorias', 'unidades_medida', 'insumos', 'recetas',
            'detalle_receta', 'stock_insumo_por_local', 'movimientos_inventario',
            'proveedores', 'ordenes_compra', 'detalle_ordenes_compra', 'clientes',
            'direcciones_cliente', 'movimientos_puntos', 'reservas',
            'historial_estados_reserva', 'ordenes', 'items_orden',
            'modificadores_item_orden', 'historial_estados_orden', 'tickets_cocina',
            'turnos_caja', 'metodos_pago', 'pagos', 'detalle_pagos', 'comprobantes',
            'zonas_delivery', 'delivery_ordenes', 'seguimiento_delivery',
            'resumen_diario', 'alertas_stock_insumos', 'audit_log', 'tokens_recuperacion'
        )
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS %I.%I DISABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
    END LOOP;
END $$;
