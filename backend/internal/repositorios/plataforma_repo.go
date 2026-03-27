package repositorios

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/restauflow/backend/internal/entidades/plataforma"
)

// ==========================================
// Repositorio: Planes + Tenants + Suscripciones
// ==========================================

type PlataformaRepo struct {
	DB *sql.DB
}

func NuevoPlataformaRepo(db *sql.DB) *PlataformaRepo {
	return &PlataformaRepo{DB: db}
}

// planColumns columnas SELECT para planes
const planColumns = `id, nombre, descripcion, precio_mensual, precio_anual,
	max_usuarios, max_locales, max_mesas, max_productos_menu, max_storage_mb,
	tiene_delivery, tiene_reservas, tiene_cocina_pantalla, tiene_multi_local,
	tiene_inventario_avanzado, tiene_recetas, tiene_combos, tiene_promociones,
	tiene_puntos_fidelidad, tiene_reportes_avanzados, tiene_websockets,
	tiene_api_access, tiene_qr_mesa, tiene_facturacion_sunat,
	orden_display, es_popular, activo, created_at, updated_at`

func scanPlan(row interface {
	Scan(dest ...interface{}) error
}, p *plataforma.Plan) error {
	return row.Scan(
		&p.ID, &p.Nombre, &p.Descripcion, &p.PrecioMensual, &p.PrecioAnual,
		&p.MaxUsuarios, &p.MaxLocales, &p.MaxMesas, &p.MaxProductosMenu, &p.MaxStorageMB,
		&p.TieneDelivery, &p.TieneReservas, &p.TieneCocinaPantalla, &p.TieneMultiLocal,
		&p.TieneInventarioAvanzado, &p.TieneRecetas, &p.TieneCombos, &p.TienePromociones,
		&p.TienePuntosFidelidad, &p.TieneReportesAvanzados, &p.TieneWebsockets,
		&p.TieneAPIAccess, &p.TieneQRMesa, &p.TieneFacturacionSunat,
		&p.OrdenDisplay, &p.EsPopular, &p.Activo, &p.CreatedAt, &p.UpdatedAt,
	)
}

// ============ PLANES ============

func (r *PlataformaRepo) ListarPlanes() ([]plataforma.Plan, error) {
	rows, err := r.DB.Query(fmt.Sprintf(`SELECT %s FROM planes ORDER BY orden_display ASC, precio_mensual ASC`, planColumns))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var planes []plataforma.Plan
	for rows.Next() {
		var p plataforma.Plan
		if err := scanPlan(rows, &p); err != nil {
			return nil, err
		}
		planes = append(planes, p)
	}
	return planes, nil
}

func (r *PlataformaRepo) ObtenerPlan(id int) (*plataforma.Plan, error) {
	var p plataforma.Plan
	err := scanPlan(
		r.DB.QueryRow(fmt.Sprintf(`SELECT %s FROM planes WHERE id = $1`, planColumns), id),
		&p,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PlataformaRepo) CrearPlan(req plataforma.NuevoPlanRequest) (*plataforma.Plan, error) {
	var p plataforma.Plan
	err := r.DB.QueryRow(`
		INSERT INTO planes (nombre, descripcion, precio_mensual, precio_anual,
			max_usuarios, max_locales, max_mesas)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+planColumns,
		req.Nombre, req.Descripcion, req.PrecioMensual, req.PrecioAnual,
		req.MaxUsuarios, req.MaxLocales, req.MaxMesas,
	).Scan(
		&p.ID, &p.Nombre, &p.Descripcion, &p.PrecioMensual, &p.PrecioAnual,
		&p.MaxUsuarios, &p.MaxLocales, &p.MaxMesas, &p.MaxProductosMenu, &p.MaxStorageMB,
		&p.TieneDelivery, &p.TieneReservas, &p.TieneCocinaPantalla, &p.TieneMultiLocal,
		&p.TieneInventarioAvanzado, &p.TieneRecetas, &p.TieneCombos, &p.TienePromociones,
		&p.TienePuntosFidelidad, &p.TieneReportesAvanzados, &p.TieneWebsockets,
		&p.TieneAPIAccess, &p.TieneQRMesa, &p.TieneFacturacionSunat,
		&p.OrdenDisplay, &p.EsPopular, &p.Activo, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PlataformaRepo) ActualizarPlan(id int, req plataforma.ActualizarPlanRequest) (*plataforma.Plan, error) {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1

	if req.Nombre != "" {
		setClauses += fmt.Sprintf("nombre = $%d, ", argIdx)
		args = append(args, req.Nombre)
		argIdx++
	}
	if req.Descripcion != "" {
		setClauses += fmt.Sprintf("descripcion = $%d, ", argIdx)
		args = append(args, req.Descripcion)
		argIdx++
	}
	if req.PrecioMensual > 0 {
		setClauses += fmt.Sprintf("precio_mensual = $%d, ", argIdx)
		args = append(args, req.PrecioMensual)
		argIdx++
	}
	if req.PrecioAnual > 0 {
		setClauses += fmt.Sprintf("precio_anual = $%d, ", argIdx)
		args = append(args, req.PrecioAnual)
		argIdx++
	}
	if req.Activo != nil {
		setClauses += fmt.Sprintf("activo = $%d, ", argIdx)
		args = append(args, *req.Activo)
		argIdx++
	}

	if len(args) == 0 {
		return r.ObtenerPlan(id)
	}

	setClauses += "updated_at = NOW() "
	args = append(args, id)
	query := fmt.Sprintf("UPDATE planes SET %s WHERE id = $%d", setClauses, argIdx)

	_, err := r.DB.Exec(query, args...)
	if err != nil {
		return nil, err
	}
	return r.ObtenerPlan(id)
}

func (r *PlataformaRepo) EliminarPlan(id int) error {
	_, err := r.DB.Exec("DELETE FROM planes WHERE id = $1", id)
	return err
}

// ============ TENANTS ============

const tenantColumns = `id, nombre, slug, ruc, correo_contacto, telefono, direccion,
	logo_url, color_primario, color_secundario, tipo_restaurante, estado,
	dias_trial, created_at, updated_at`

func scanTenant(row interface {
	Scan(dest ...interface{}) error
}, t *plataforma.Tenant) error {
	return row.Scan(
		&t.ID, &t.Nombre, &t.Slug, &t.RUC, &t.CorreoContacto, &t.Telefono,
		&t.Direccion, &t.LogoURL, &t.ColorPrimario, &t.ColorSecundario,
		&t.TipoRestaurante, &t.Estado, &t.DiasTrial, &t.CreatedAt, &t.UpdatedAt,
	)
}

func (r *PlataformaRepo) ListarTenants(pagina, porPagina int) ([]plataforma.Tenant, int, error) {
	var total int
	err := r.DB.QueryRow("SELECT COUNT(*) FROM tenants").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (pagina - 1) * porPagina
	rows, err := r.DB.Query(fmt.Sprintf(`
		SELECT %s FROM tenants
		ORDER BY created_at DESC LIMIT $1 OFFSET $2
	`, tenantColumns), porPagina, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var tenants []plataforma.Tenant
	for rows.Next() {
		var t plataforma.Tenant
		if err := scanTenant(rows, &t); err != nil {
			return nil, 0, err
		}
		tenants = append(tenants, t)
	}
	return tenants, total, nil
}

func (r *PlataformaRepo) ObtenerTenant(id string) (*plataforma.Tenant, error) {
	var t plataforma.Tenant
	err := scanTenant(
		r.DB.QueryRow(fmt.Sprintf(`SELECT %s FROM tenants WHERE id = $1`, tenantColumns), id),
		&t,
	)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *PlataformaRepo) ObtenerTenantPorSlug(slug string) (*plataforma.Tenant, error) {
	var t plataforma.Tenant
	err := scanTenant(
		r.DB.QueryRow(fmt.Sprintf(`SELECT %s FROM tenants WHERE slug = $1`, tenantColumns), slug),
		&t,
	)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *PlataformaRepo) CrearTenantConSuscripcion(req plataforma.NuevoTenantRequest, planID int) (*plataforma.Tenant, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	var t plataforma.Tenant
	err = tx.QueryRow(`
		INSERT INTO tenants (nombre, slug, ruc, correo_contacto, telefono, direccion, tipo_restaurante)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+tenantColumns,
		req.Nombre, req.Slug, req.RUC, req.CorreoContacto, req.Telefono,
		req.Direccion, req.TipoRestaurante,
	).Scan(
		&t.ID, &t.Nombre, &t.Slug, &t.RUC, &t.CorreoContacto, &t.Telefono,
		&t.Direccion, &t.LogoURL, &t.ColorPrimario, &t.ColorSecundario,
		&t.TipoRestaurante, &t.Estado, &t.DiasTrial, &t.CreatedAt, &t.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Crear suscripción inicial
	_, err = tx.Exec(`
		INSERT INTO suscripciones (tenant_id, plan_id, estado, fecha_inicio,
			fecha_vencimiento, tipo_facturacion)
		VALUES ($1, $2, 'trial', NOW(), NOW() + INTERVAL '14 days', 'mensual')
	`, t.ID, planID)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return &t, nil
}

func (r *PlataformaRepo) ActualizarTenant(id string, req plataforma.ActualizarTenantRequest) (*plataforma.Tenant, error) {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1

	if req.Nombre != "" {
		setClauses += fmt.Sprintf("nombre = $%d, ", argIdx)
		args = append(args, req.Nombre)
		argIdx++
	}
	if req.CorreoContacto != "" {
		setClauses += fmt.Sprintf("correo_contacto = $%d, ", argIdx)
		args = append(args, req.CorreoContacto)
		argIdx++
	}
	if req.Telefono != "" {
		setClauses += fmt.Sprintf("telefono = $%d, ", argIdx)
		args = append(args, req.Telefono)
		argIdx++
	}
	if req.LogoURL != "" {
		setClauses += fmt.Sprintf("logo_url = $%d, ", argIdx)
		args = append(args, req.LogoURL)
		argIdx++
	}
	if req.Direccion != "" {
		setClauses += fmt.Sprintf("direccion = $%d, ", argIdx)
		args = append(args, req.Direccion)
		argIdx++
	}
	if req.ColorPrimario != "" {
		setClauses += fmt.Sprintf("color_primario = $%d, ", argIdx)
		args = append(args, req.ColorPrimario)
		argIdx++
	}
	if req.ColorSecundario != "" {
		setClauses += fmt.Sprintf("color_secundario = $%d, ", argIdx)
		args = append(args, req.ColorSecundario)
		argIdx++
	}
	if req.TipoRestaurante != "" {
		setClauses += fmt.Sprintf("tipo_restaurante = $%d, ", argIdx)
		args = append(args, req.TipoRestaurante)
		argIdx++
	}
	if req.Estado != "" {
		setClauses += fmt.Sprintf("estado = $%d, ", argIdx)
		args = append(args, req.Estado)
		argIdx++
	}

	if len(args) == 0 {
		return r.ObtenerTenant(id)
	}

	setClauses += "updated_at = NOW() "
	args = append(args, id)
	query := fmt.Sprintf("UPDATE tenants SET %s WHERE id = $%d", setClauses, argIdx)

	_, err := r.DB.Exec(query, args...)
	if err != nil {
		return nil, err
	}
	return r.ObtenerTenant(id)
}

func (r *PlataformaRepo) EliminarTenant(id string) error {
	_, err := r.DB.Exec("UPDATE tenants SET estado = 'cancelado', updated_at = NOW() WHERE id = $1", id)
	return err
}

// ============ SUSCRIPCIONES ============

func (r *PlataformaRepo) ObtenerSuscripcionActiva(tenantID string) (*plataforma.Suscripcion, error) {
	var s plataforma.Suscripcion
	err := r.DB.QueryRow(`
		SELECT s.id, s.tenant_id, s.plan_id, s.estado, s.tipo_facturacion,
			   s.fecha_inicio, s.fecha_vencimiento, s.fecha_cancelacion,
			   s.precio_pagado, s.mercadopago_subscription_id,
			   s.renovacion_automatica, s.created_at, s.updated_at,
			   p.nombre
		FROM suscripciones s
		JOIN planes p ON p.id = s.plan_id
		WHERE s.tenant_id = $1 AND s.estado IN ('activa','trial')
		ORDER BY s.created_at DESC LIMIT 1
	`, tenantID).Scan(
		&s.ID, &s.TenantID, &s.PlanID, &s.Estado, &s.TipoFacturacion,
		&s.FechaInicio, &s.FechaVencimiento, &s.FechaCancelacion,
		&s.PrecioPagado, &s.MercadopagoSubscriptionID,
		&s.RenovacionAutomatica, &s.CreatedAt, &s.UpdatedAt,
		&s.NombrePlan,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *PlataformaRepo) CambiarPlan(tenantID string, req plataforma.CambiarPlanRequest) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Obtener suscripción actual
	var suscActualID int64
	var planAnteriorID int
	err = tx.QueryRow(`
		SELECT id, plan_id FROM suscripciones
		WHERE tenant_id = $1 AND estado IN ('activa','trial')
		ORDER BY created_at DESC LIMIT 1
	`, tenantID).Scan(&suscActualID, &planAnteriorID)
	if err != nil {
		return fmt.Errorf("no se encontró suscripción activa: %w", err)
	}

	// Cancelar suscripción actual
	_, err = tx.Exec(`
		UPDATE suscripciones SET estado = 'cancelada', fecha_cancelacion = NOW(), updated_at = NOW()
		WHERE id = $1
	`, suscActualID)
	if err != nil {
		return err
	}

	// Crear nueva suscripción
	periodo := req.Periodo
	if periodo == "" {
		periodo = "mensual"
	}
	_, err = tx.Exec(`
		INSERT INTO suscripciones (tenant_id, plan_id, estado, fecha_inicio, fecha_vencimiento, tipo_facturacion)
		VALUES ($1, $2, 'activa', NOW(), NOW() + INTERVAL '30 days', $3)
	`, tenantID, req.PlanID, periodo)
	if err != nil {
		return err
	}

	// Registrar en historial
	_, err = tx.Exec(`
		INSERT INTO historial_cambios_plan (tenant_id, plan_anterior_id, plan_nuevo_id, motivo)
		VALUES ($1, $2, $3, $4)
	`, tenantID, planAnteriorID, req.PlanID, req.Motivo)
	if err != nil {
		log.Printf("[WARN] No se pudo registrar historial de cambio de plan: %v", err)
	}

	return tx.Commit()
}

// ============ FACTURAS ============

func (r *PlataformaRepo) ListarFacturas(tenantID string, pagina, porPagina int) ([]plataforma.FacturaPlataforma, int, error) {
	var total int
	err := r.DB.QueryRow("SELECT COUNT(*) FROM facturas_plataforma WHERE tenant_id = $1", tenantID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (pagina - 1) * porPagina
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, suscripcion_id, numero_factura, concepto, monto, estado,
			   fecha_emision, fecha_vencimiento, fecha_pago, mercadopago_payment_id,
			   created_at
		FROM facturas_plataforma
		WHERE tenant_id = $1
		ORDER BY created_at DESC LIMIT $2 OFFSET $3
	`, tenantID, porPagina, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var facturas []plataforma.FacturaPlataforma
	for rows.Next() {
		var f plataforma.FacturaPlataforma
		err := rows.Scan(
			&f.ID, &f.TenantID, &f.SuscripcionID, &f.NumeroFactura, &f.Concepto,
			&f.Monto, &f.Estado, &f.FechaEmision, &f.FechaVencimiento, &f.FechaPago,
			&f.MercadopagoPaymentID, &f.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		facturas = append(facturas, f)
	}
	return facturas, total, nil
}
