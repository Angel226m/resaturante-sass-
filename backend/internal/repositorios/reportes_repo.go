package repositorios

import (
	"database/sql"
	"fmt"

	"github.com/restauflow/backend/internal/entidades/reportes"
)

// ==========================================
// Repositorio: Reportes (Resumen Diario, Audit Log, Dashboard)
// ==========================================

type ReportesRepo struct {
	DB *sql.DB
}

func NuevoReportesRepo(db *sql.DB) *ReportesRepo {
	return &ReportesRepo{DB: db}
}

// ============ RESUMEN DIARIO ============

const resumenCols = `id, tenant_id, local_id, fecha,
	total_ventas, numero_ordenes,
	numero_ordenes_mesa, numero_ordenes_delivery, numero_ordenes_llevar,
	ticket_promedio, total_propinas, total_descuentos,
	clientes_nuevos,
	producto_mas_vendido_id, cantidad_producto_mas_vendido,
	created_at, updated_at`

func scanResumen(row interface{ Scan(...interface{}) error }) (reportes.ResumenDiario, error) {
	var r reportes.ResumenDiario
	err := row.Scan(
		&r.ID, &r.TenantID, &r.LocalID, &r.Fecha,
		&r.TotalVentas, &r.NumeroOrdenes,
		&r.NumeroOrdenesMesa, &r.NumeroOrdenesDelivery, &r.NumeroOrdenesLlevar,
		&r.TicketPromedio, &r.TotalPropinas, &r.TotalDescuentos,
		&r.ClientesNuevos,
		&r.ProductoMasVendidoID, &r.CantidadProductoMasVendido,
		&r.CreatedAt, &r.UpdatedAt,
	)
	return r, err
}

func (r *ReportesRepo) ObtenerResumenDiario(tenantID string, localID int, fecha string) (*reportes.ResumenDiario, error) {
	row := r.DB.QueryRow(
		`SELECT `+resumenCols+` FROM resumen_diario
		 WHERE tenant_id = $1 AND local_id = $2 AND fecha = $3`,
		tenantID, localID, fecha,
	)
	res, err := scanResumen(row)
	if err != nil {
		return nil, err
	}
	return &res, nil
}

func (r *ReportesRepo) ListarResumenesDiarios(tenantID string, localID int, filtros reportes.FiltrosResumenDiario, pagina, porPagina int) ([]reportes.ResumenDiario, int, error) {
	where := "tenant_id = $1 AND local_id = $2"
	args := []interface{}{tenantID, localID}
	argPos := 3

	if filtros.FechaDesde != "" {
		where += fmt.Sprintf(" AND fecha >= $%d", argPos)
		args = append(args, filtros.FechaDesde)
		argPos++
	}
	if filtros.FechaHasta != "" {
		where += fmt.Sprintf(" AND fecha <= $%d", argPos)
		args = append(args, filtros.FechaHasta)
		argPos++
	}

	var total int
	_ = r.DB.QueryRow("SELECT COUNT(*) FROM resumen_diario WHERE "+where, args...).Scan(&total)

	offset := (pagina - 1) * porPagina
	args = append(args, porPagina, offset)
	query := fmt.Sprintf(
		`SELECT `+resumenCols+` FROM resumen_diario WHERE %s ORDER BY fecha DESC LIMIT $%d OFFSET $%d`,
		where, argPos, argPos+1,
	)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []reportes.ResumenDiario
	for rows.Next() {
		res, err := scanResumen(rows)
		if err != nil {
			continue
		}
		items = append(items, res)
	}
	return items, total, nil
}

func (r *ReportesRepo) GenerarResumenDiario(tenantID string, localID int, fecha string) (*reportes.ResumenDiario, error) {
	// Calcular métricas del día desde tablas operativas

	var totalVentas, totalPropinas, totalDescuentos float64
	var numOrdenes, numMesa, numDelivery, numLlevar int

	_ = r.DB.QueryRow(`
		SELECT COALESCE(SUM(total), 0),
		       COALESCE(SUM(propina), 0),
		       COALESCE(SUM(descuento_total), 0),
		       COUNT(*),
		       COUNT(*) FILTER (WHERE tipo IN ('mesa','barra')),
		       COUNT(*) FILTER (WHERE tipo = 'delivery'),
		       COUNT(*) FILTER (WHERE tipo = 'para_llevar')
		FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2 AND DATE(created_at) = $3
		  AND estado NOT IN ('cancelada')
	`, tenantID, localID, fecha).Scan(
		&totalVentas, &totalPropinas, &totalDescuentos,
		&numOrdenes, &numMesa, &numDelivery, &numLlevar,
	)

	// Clientes nuevos del día
	var clientesNuevos int
	_ = r.DB.QueryRow(`
		SELECT COUNT(DISTINCT cliente_id) FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2 AND DATE(created_at) = $3
		  AND estado NOT IN ('cancelada') AND cliente_id IS NOT NULL
		  AND cliente_id IN (
		      SELECT id FROM clientes WHERE tenant_id = $1 AND DATE(created_at) = $3
		  )
	`, tenantID, localID, fecha).Scan(&clientesNuevos)

	// Producto más vendido
	var prodMasVendidoID sql.NullInt64
	var cantProdMasVendido int
	_ = r.DB.QueryRow(`
		SELECT io.producto_id, SUM(io.cantidad)::int AS cant
		FROM items_orden io
		JOIN ordenes o ON o.id = io.orden_id AND o.tenant_id = io.tenant_id
		WHERE io.tenant_id = $1 AND o.local_id = $2 AND DATE(o.created_at) = $3
		  AND o.estado NOT IN ('cancelada')
		GROUP BY io.producto_id ORDER BY cant DESC LIMIT 1
	`, tenantID, localID, fecha).Scan(&prodMasVendidoID, &cantProdMasVendido)

	// Cálculos derivados
	ticketPromedio := 0.0
	if numOrdenes > 0 {
		ticketPromedio = totalVentas / float64(numOrdenes)
	}

	// Preparar valores nullable
	var prodID *int64
	if prodMasVendidoID.Valid {
		prodID = &prodMasVendidoID.Int64
	}

	// UPSERT
	var res reportes.ResumenDiario
	err := r.DB.QueryRow(`
		INSERT INTO resumen_diario (
			tenant_id, local_id, fecha, total_ventas, numero_ordenes,
			numero_ordenes_mesa, numero_ordenes_delivery, numero_ordenes_llevar,
			ticket_promedio, total_propinas, total_descuentos,
			clientes_nuevos,
			producto_mas_vendido_id, cantidad_producto_mas_vendido
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
		ON CONFLICT (tenant_id, local_id, fecha) DO UPDATE SET
			total_ventas = EXCLUDED.total_ventas,
			numero_ordenes = EXCLUDED.numero_ordenes,
			numero_ordenes_mesa = EXCLUDED.numero_ordenes_mesa,
			numero_ordenes_delivery = EXCLUDED.numero_ordenes_delivery,
			numero_ordenes_llevar = EXCLUDED.numero_ordenes_llevar,
			ticket_promedio = EXCLUDED.ticket_promedio,
			total_propinas = EXCLUDED.total_propinas,
			total_descuentos = EXCLUDED.total_descuentos,
			clientes_nuevos = EXCLUDED.clientes_nuevos,
			producto_mas_vendido_id = EXCLUDED.producto_mas_vendido_id,
			cantidad_producto_mas_vendido = EXCLUDED.cantidad_producto_mas_vendido,
			updated_at = NOW()
		RETURNING `+resumenCols,
		tenantID, localID, fecha, totalVentas, numOrdenes,
		numMesa, numDelivery, numLlevar,
		ticketPromedio, totalPropinas, totalDescuentos,
		clientesNuevos,
		prodID, cantProdMasVendido,
	).Scan(
		&res.ID, &res.TenantID, &res.LocalID, &res.Fecha,
		&res.TotalVentas, &res.NumeroOrdenes,
		&res.NumeroOrdenesMesa, &res.NumeroOrdenesDelivery, &res.NumeroOrdenesLlevar,
		&res.TicketPromedio, &res.TotalPropinas, &res.TotalDescuentos,
		&res.ClientesNuevos,
		&res.ProductoMasVendidoID, &res.CantidadProductoMasVendido,
		&res.CreatedAt, &res.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &res, nil
}


func (r *ReportesRepo) ListarAuditLog(tenantID string, filtros reportes.FiltrosAuditLog, pagina, porPagina int) ([]reportes.AuditLog, int, error) {
	where := "tenant_id = $1"
	args := []interface{}{tenantID}
	argPos := 2

	if filtros.UsuarioID != nil {
		where += fmt.Sprintf(" AND usuario_id = $%d", argPos)
		args = append(args, *filtros.UsuarioID)
		argPos++
	}
	if filtros.Accion != "" {
		where += fmt.Sprintf(" AND accion = $%d", argPos)
		args = append(args, filtros.Accion)
		argPos++
	}
	if filtros.Tabla != "" {
		where += fmt.Sprintf(" AND tabla_afectada = $%d", argPos)
		args = append(args, filtros.Tabla)
		argPos++
	}
	if filtros.FechaDesde != "" {
		where += fmt.Sprintf(" AND created_at >= $%d", argPos)
		args = append(args, filtros.FechaDesde)
		argPos++
	}
	if filtros.FechaHasta != "" {
		where += fmt.Sprintf(" AND created_at <= $%d::timestamp + interval '1 day'", argPos)
		args = append(args, filtros.FechaHasta)
		argPos++
	}

	var total int
	_ = r.DB.QueryRow("SELECT COUNT(*) FROM audit_log WHERE "+where, args...).Scan(&total)

	offset := (pagina - 1) * porPagina
	args = append(args, porPagina, offset)
	query := fmt.Sprintf(`
		SELECT id, tenant_id, usuario_id, superadmin_id, accion, tabla_afectada,
		       registro_id, datos_anteriores, datos_nuevos,
		       ip_origen::text, user_agent, metodo_http, path, status_code, duracion_ms,
		       created_at
		FROM audit_log WHERE %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d
	`, where, argPos, argPos+1)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []reportes.AuditLog
	for rows.Next() {
		var l reportes.AuditLog
		if err := rows.Scan(
			&l.ID, &l.TenantID, &l.UsuarioID, &l.SuperAdminID,
			&l.Accion, &l.TablaAfectada, &l.RegistroID,
			&l.DatosAnteriores, &l.DatosNuevos,
			&l.IPOrigen, &l.UserAgent, &l.MetodoHTTP, &l.Path,
			&l.StatusCode, &l.DuracionMs, &l.CreatedAt,
		); err != nil {
			continue
		}
		logs = append(logs, l)
	}
	return logs, total, nil
}

func (r *ReportesRepo) RegistrarAuditLog(tenantID string, usuarioID int64, accion, tabla, registroID string, datosAnt, datosNuevos, ip, ua string) error {
	_, err := r.DB.Exec(`
		INSERT INTO audit_log (tenant_id, usuario_id, accion, tabla_afectada, registro_id,
			datos_anteriores, datos_nuevos, ip_origen, user_agent)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8::inet,$9)
	`, tenantID, usuarioID, accion, tabla, registroID, datosAnt, datosNuevos, ip, ua)
	return err
}

// ============ DASHBOARD ============

func (r *ReportesRepo) ObtenerDashboard(tenantID string, localID int) (*reportes.DashboardResumen, error) {
	var d reportes.DashboardResumen

	// Ventas de hoy
	_ = r.DB.QueryRow(`
		SELECT COALESCE(SUM(total), 0), COUNT(*)
		FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2
		  AND DATE(created_at) = CURRENT_DATE
		  AND estado NOT IN ('cancelada')
	`, tenantID, localID).Scan(&d.VentasHoy, &d.OrdenesHoy)

	// Ventas de ayer (para comparación)
	_ = r.DB.QueryRow(`
		SELECT COALESCE(SUM(total), 0)
		FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2
		  AND DATE(created_at) = CURRENT_DATE - 1
		  AND estado NOT IN ('cancelada')
	`, tenantID, localID).Scan(&d.VentasAyer)

	// Ticket promedio y crecimiento
	if d.OrdenesHoy > 0 {
		d.TicketPromedio = d.VentasHoy / float64(d.OrdenesHoy)
	}
	if d.VentasAyer > 0 {
		d.CrecimientoPorc = ((d.VentasHoy - d.VentasAyer) / d.VentasAyer) * 100
	}

	// Órdenes activas
	_ = r.DB.QueryRow(`
		SELECT COUNT(*) FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2 AND estado IN ('nueva','en_cocina','listo')
	`, tenantID, localID).Scan(&d.OrdenesActivas)

	// Mesas ocupadas / totales
	_ = r.DB.QueryRow(`
		SELECT COUNT(*) FROM mesas
		WHERE tenant_id = $1 AND local_id = $2 AND estado = 'ocupada' AND deleted_at IS NULL
	`, tenantID, localID).Scan(&d.MesasOcupadas)

	_ = r.DB.QueryRow(`
		SELECT COUNT(*) FROM mesas
		WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL
	`, tenantID, localID).Scan(&d.TotalMesas)

	if d.TotalMesas > 0 {
		d.OcupacionPorc = (float64(d.MesasOcupadas) / float64(d.TotalMesas)) * 100
	}

	// Reservas de hoy
	_ = r.DB.QueryRow(`
		SELECT COUNT(*) FROM reservas
		WHERE tenant_id = $1 AND local_id = $2 AND DATE(fecha_reserva) = CURRENT_DATE
		  AND estado NOT IN ('cancelada','no_asistio')
	`, tenantID, localID).Scan(&d.ReservasHoy)

	// Clientes únicos hoy
	_ = r.DB.QueryRow(`
		SELECT COUNT(DISTINCT cliente_id) FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2 AND DATE(created_at) = CURRENT_DATE
		  AND cliente_id IS NOT NULL AND estado NOT IN ('cancelada')
	`, tenantID, localID).Scan(&d.ClientesHoy)

	// Ventas de la semana
	_ = r.DB.QueryRow(`
		SELECT COALESCE(SUM(total), 0) FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2
		  AND created_at >= date_trunc('week', CURRENT_DATE)
		  AND estado NOT IN ('cancelada')
	`, tenantID, localID).Scan(&d.VentasSemana)

	// Ventas del mes
	_ = r.DB.QueryRow(`
		SELECT COALESCE(SUM(total), 0) FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2
		  AND created_at >= date_trunc('month', CURRENT_DATE)
		  AND estado NOT IN ('cancelada')
	`, tenantID, localID).Scan(&d.VentasMes)

	// Órdenes por tipo hoy
	_ = r.DB.QueryRow(`
		SELECT
			COALESCE(SUM(CASE WHEN tipo_orden = 'mesa' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN tipo_orden = 'delivery' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN tipo_orden = 'para_llevar' THEN 1 ELSE 0 END), 0)
		FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2 AND DATE(created_at) = CURRENT_DATE
		  AND estado NOT IN ('cancelada')
	`, tenantID, localID).Scan(&d.OrdenesMesa, &d.OrdenesDelivery, &d.OrdenesParaLlevar)

	// Productos más vendidos hoy (top 5)
	pRows, err := r.DB.Query(`
		SELECT pm.id, pm.nombre, SUM(io.cantidad)::int AS cant, COALESCE(SUM(io.subtotal), 0) AS ingreso
		FROM items_orden io
		JOIN ordenes o ON o.id = io.orden_id AND o.tenant_id = io.tenant_id
		JOIN productos_menu pm ON pm.id = io.producto_id AND pm.tenant_id = io.tenant_id
		WHERE io.tenant_id = $1 AND o.local_id = $2 AND DATE(o.created_at) = CURRENT_DATE
		  AND o.estado NOT IN ('cancelada')
		GROUP BY pm.id, pm.nombre ORDER BY cant DESC LIMIT 5
	`, tenantID, localID)
	if err == nil {
		defer pRows.Close()
		for pRows.Next() {
			var pv reportes.ProductoVendido
			if err := pRows.Scan(&pv.ProductoID, &pv.Nombre, &pv.Cantidad, &pv.Total); err == nil {
				d.ProductosMasVendidos = append(d.ProductosMasVendidos, pv)
			}
		}
	}

	// Ventas por hora (hoy)
	vRows, err := r.DB.Query(`
		SELECT EXTRACT(HOUR FROM created_at)::int AS hora,
		       COALESCE(SUM(total), 0), COUNT(*)
		FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2
		  AND DATE(created_at) = CURRENT_DATE
		  AND estado NOT IN ('cancelada')
		GROUP BY hora ORDER BY hora
	`, tenantID, localID)
	if err == nil {
		defer vRows.Close()
		for vRows.Next() {
			var v reportes.VentaPorHora
			if err := vRows.Scan(&v.Hora, &v.Total, &v.Count); err == nil {
				d.VentasPorHora = append(d.VentasPorHora, v)
			}
		}
	}

	// Ventas por categoría (hoy)
	cRows, err := r.DB.Query(`
		SELECT cm.id, cm.nombre, COALESCE(SUM(io.subtotal), 0), SUM(io.cantidad)::int
		FROM items_orden io
		JOIN ordenes o ON o.id = io.orden_id AND o.tenant_id = io.tenant_id
		JOIN productos_menu pm ON pm.id = io.producto_id AND pm.tenant_id = io.tenant_id
		JOIN categorias_menu cm ON cm.id = pm.categoria_id AND cm.tenant_id = pm.tenant_id
		WHERE io.tenant_id = $1 AND o.local_id = $2 AND DATE(o.created_at) = CURRENT_DATE
		  AND o.estado NOT IN ('cancelada')
		GROUP BY cm.id, cm.nombre ORDER BY SUM(io.subtotal) DESC LIMIT 8
	`, tenantID, localID)
	if err == nil {
		defer cRows.Close()
		for cRows.Next() {
			var vc reportes.VentaPorCategoria
			if err := cRows.Scan(&vc.CategoriaID, &vc.Nombre, &vc.Total, &vc.Cantidad); err == nil {
				d.VentasPorCategoria = append(d.VentasPorCategoria, vc)
			}
		}
	}

	// Ventas por día (últimos 7 días, para gráfico semanal)
	dRows, err := r.DB.Query(`
		SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS fecha,
		       COALESCE(SUM(total), 0), COUNT(*)
		FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2
		  AND created_at >= CURRENT_DATE - 6
		  AND estado NOT IN ('cancelada')
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at)
	`, tenantID, localID)
	if err == nil {
		defer dRows.Close()
		for dRows.Next() {
			var vd reportes.VentaPorDia
			if err := dRows.Scan(&vd.Fecha, &vd.Total, &vd.Ordenes); err == nil {
				d.VentasPorDia = append(d.VentasPorDia, vd)
			}
		}
	}

	return &d, nil
}
