package repositorios

import (
	"database/sql"
	"fmt"

	"github.com/restauflow/backend/internal/entidades/caja"
)

// ==========================================
// Repositorio: Caja (Turnos, Métodos Pago, Pagos, Comprobantes)
// ==========================================

type CajaRepo struct {
	DB *sql.DB
}

func NuevoCajaRepo(db *sql.DB) *CajaRepo {
	return &CajaRepo{DB: db}
}

// ============ TURNOS CAJA ============

func (r *CajaRepo) ObtenerTurnoActivo(tenantID string, localID int, usuarioID int64) (*caja.TurnoCaja, error) {
	var t caja.TurnoCaja
	err := r.DB.QueryRow(`
		SELECT t.id, t.tenant_id, t.local_id, t.usuario_id, t.monto_apertura,
			   t.monto_cierre, t.monto_esperado, t.diferencia,
			   t.total_ventas, t.total_efectivo, t.total_tarjeta, t.total_otros,
			   t.cantidad_ordenes, t.estado, t.fecha_apertura, t.fecha_cierre,
		COALESCE(t.observaciones, ''), t.created_at,
			   COALESCE(u.nombre || ' ' || u.apellidos, '') as nombre_usuario
		FROM turnos_caja t
		LEFT JOIN usuarios u ON u.id = t.usuario_id AND u.tenant_id = t.tenant_id
		WHERE t.tenant_id = $1 AND t.local_id = $2 AND t.usuario_id = $3 AND t.estado = 'abierto'
	`, tenantID, localID, usuarioID).Scan(
		&t.ID, &t.TenantID, &t.LocalID, &t.UsuarioID, &t.MontoApertura,
		&t.MontoCierre, &t.MontoEsperado, &t.Diferencia,
		&t.TotalVentas, &t.TotalEfectivo, &t.TotalTarjeta, &t.TotalOtros,
		&t.CantidadOrdenes, &t.Estado, &t.FechaApertura, &t.FechaCierre,
		&t.Observaciones, &t.CreatedAt, &t.NombreUsuario)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *CajaRepo) AbrirTurno(tenantID string, usuarioID int64, req caja.AbrirTurnoCajaRequest) (*caja.TurnoCaja, error) {
	// Verificar que no haya turno abierto
	var existe bool
	r.DB.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM turnos_caja WHERE tenant_id = $1 AND local_id = $2 AND usuario_id = $3 AND estado = 'abierto')
	`, tenantID, req.LocalID, usuarioID).Scan(&existe)
	if existe {
		return nil, fmt.Errorf("ya existe un turno abierto para este usuario")
	}

	var t caja.TurnoCaja
	err := r.DB.QueryRow(`
		INSERT INTO turnos_caja (tenant_id, local_id, usuario_id, monto_apertura)
		VALUES ($1,$2,$3,$4)
		RETURNING id, tenant_id, local_id, usuario_id, monto_apertura, monto_cierre,
			monto_esperado, diferencia, total_ventas, total_efectivo, total_tarjeta,
			total_otros, cantidad_ordenes, estado, fecha_apertura, fecha_cierre,
			COALESCE(observaciones, ''), created_at
	`, tenantID, req.LocalID, usuarioID, req.MontoApertura,
	).Scan(&t.ID, &t.TenantID, &t.LocalID, &t.UsuarioID, &t.MontoApertura,
		&t.MontoCierre, &t.MontoEsperado, &t.Diferencia,
		&t.TotalVentas, &t.TotalEfectivo, &t.TotalTarjeta, &t.TotalOtros,
		&t.CantidadOrdenes, &t.Estado, &t.FechaApertura, &t.FechaCierre,
		&t.Observaciones, &t.CreatedAt)
	return &t, err
}

func (r *CajaRepo) CerrarTurno(tenantID string, turnoID int64, req caja.CerrarTurnoCajaRequest) (*caja.TurnoCaja, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Calcular totales del turno
	var totalVentas, totalEfectivo, totalTarjeta, totalOtros float64
	var cantOrdenes int
	tx.QueryRow(`
		SELECT COALESCE(SUM(p.monto_total), 0),
			   COALESCE(SUM(CASE WHEN mp.tipo = 'efectivo' THEN dp.monto ELSE 0 END), 0),
			   COALESCE(SUM(CASE WHEN mp.tipo = 'tarjeta' THEN dp.monto ELSE 0 END), 0),
			   COALESCE(SUM(CASE WHEN mp.tipo NOT IN ('efectivo','tarjeta') THEN dp.monto ELSE 0 END), 0),
			   COUNT(DISTINCT p.orden_id)
		FROM pagos p
		LEFT JOIN detalle_pagos dp ON dp.pago_id = p.id AND dp.tenant_id = p.tenant_id
		LEFT JOIN metodos_pago mp ON mp.id = dp.metodo_pago_id AND mp.tenant_id = dp.tenant_id
		WHERE p.turno_caja_id = $1 AND p.tenant_id = $2 AND p.estado = 'completado'
	`, turnoID, tenantID).Scan(&totalVentas, &totalEfectivo, &totalTarjeta, &totalOtros, &cantOrdenes)

	var montoApertura float64
	tx.QueryRow("SELECT monto_apertura FROM turnos_caja WHERE id = $1 AND tenant_id = $2",
		turnoID, tenantID).Scan(&montoApertura)

	montoEsperado := montoApertura + totalEfectivo
	diferencia := req.MontoCierre - montoEsperado

	var t caja.TurnoCaja
	err = tx.QueryRow(`
		UPDATE turnos_caja SET
			estado = 'cerrado', monto_cierre = $1, monto_esperado = $2, diferencia = $3,
			total_ventas = $4, total_efectivo = $5, total_tarjeta = $6, total_otros = $7,
			cantidad_ordenes = $8, fecha_cierre = NOW(), observaciones = $9
		WHERE id = $10 AND tenant_id = $11
		RETURNING id, tenant_id, local_id, usuario_id, monto_apertura, monto_cierre,
			monto_esperado, diferencia, total_ventas, total_efectivo, total_tarjeta,
			total_otros, cantidad_ordenes, estado, fecha_apertura, fecha_cierre,
			observaciones, created_at
	`, req.MontoCierre, montoEsperado, diferencia,
		totalVentas, totalEfectivo, totalTarjeta, totalOtros,
		cantOrdenes, req.Observaciones, turnoID, tenantID,
	).Scan(&t.ID, &t.TenantID, &t.LocalID, &t.UsuarioID, &t.MontoApertura,
		&t.MontoCierre, &t.MontoEsperado, &t.Diferencia,
		&t.TotalVentas, &t.TotalEfectivo, &t.TotalTarjeta, &t.TotalOtros,
		&t.CantidadOrdenes, &t.Estado, &t.FechaApertura, &t.FechaCierre,
		&t.Observaciones, &t.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &t, tx.Commit()
}

func (r *CajaRepo) ObtenerResumenTurno(tenantID string, turnoID int64) (*caja.ResumenTurnoCaja, error) {
	var res caja.ResumenTurnoCaja
	res.TurnoCajaID = turnoID

	r.DB.QueryRow(`
		SELECT COALESCE(SUM(p.monto_total), 0),
			   COALESCE(SUM(CASE WHEN mp.tipo = 'efectivo' THEN dp.monto ELSE 0 END), 0),
			   COALESCE(SUM(CASE WHEN mp.tipo = 'tarjeta' THEN dp.monto ELSE 0 END), 0),
			   COALESCE(SUM(CASE WHEN mp.tipo NOT IN ('efectivo','tarjeta') THEN dp.monto ELSE 0 END), 0),
			   COUNT(DISTINCT p.orden_id)
		FROM pagos p
		LEFT JOIN detalle_pagos dp ON dp.pago_id = p.id AND dp.tenant_id = p.tenant_id
		LEFT JOIN metodos_pago mp ON mp.id = dp.metodo_pago_id AND mp.tenant_id = dp.tenant_id
		WHERE p.turno_caja_id = $1 AND p.tenant_id = $2 AND p.estado = 'completado'
	`, turnoID, tenantID).Scan(&res.TotalVentas, &res.TotalEfectivo, &res.TotalTarjeta,
		&res.TotalOtros, &res.CantidadOrdenes)

	var montoApertura float64
	r.DB.QueryRow("SELECT monto_apertura FROM turnos_caja WHERE id = $1 AND tenant_id = $2",
		turnoID, tenantID).Scan(&montoApertura)

	res.MontoEsperado = montoApertura + res.TotalEfectivo
	return &res, nil
}

// ============ MÉTODOS DE PAGO ============

func (r *CajaRepo) ListarMetodosPago(tenantID string, localID int) ([]caja.MetodoPago, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia,
			   activo, deleted_at, created_at
		FROM metodos_pago WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL ORDER BY nombre
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var metodos []caja.MetodoPago
	for rows.Next() {
		var m caja.MetodoPago
		rows.Scan(&m.ID, &m.TenantID, &m.LocalID, &m.Nombre, &m.Tipo,
			&m.ComisionPorc, &m.RequiereRef, &m.Activo, &m.DeletedAt, &m.CreatedAt)
		metodos = append(metodos, m)
	}
	return metodos, nil
}

func (r *CajaRepo) CrearMetodoPago(tenantID string, req caja.NuevoMetodoPagoRequest) (*caja.MetodoPago, error) {
	var m caja.MetodoPago
	err := r.DB.QueryRow(`
		INSERT INTO metodos_pago (tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id, tenant_id, local_id, nombre, tipo, comision_porcentaje, requiere_referencia,
			activo, deleted_at, created_at
	`, tenantID, req.LocalID, req.Nombre, req.Tipo, req.ComisionPorc, req.RequiereRef,
	).Scan(&m.ID, &m.TenantID, &m.LocalID, &m.Nombre, &m.Tipo,
		&m.ComisionPorc, &m.RequiereRef, &m.Activo, &m.DeletedAt, &m.CreatedAt)
	return &m, err
}

// ============ PAGOS ============

func (r *CajaRepo) CrearPago(tenantID string, turnoID int64, usuarioID int64, req caja.NuevoPagoRequest) (*caja.Pago, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Obtener total de la orden
	var totalOrden float64
	tx.QueryRow("SELECT total FROM ordenes WHERE id = $1 AND tenant_id = $2",
		req.OrdenID, tenantID).Scan(&totalOrden)

	var montoPagado float64
	for _, d := range req.Detalle {
		montoPagado += d.Monto
	}
	vuelto := montoPagado - totalOrden - req.Propina
	if vuelto < 0 {
		vuelto = 0
	}

	var pago caja.Pago
	err = tx.QueryRow(`
		INSERT INTO pagos (tenant_id, orden_id, turno_caja_id, monto_total, monto_pagado,
			vuelto, propina, usuario_id)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, tenant_id, orden_id, turno_caja_id, monto_total, monto_pagado,
			vuelto, propina, estado, usuario_id, deleted_at, created_at, updated_at
	`, tenantID, req.OrdenID, turnoID, totalOrden, montoPagado, vuelto, req.Propina, usuarioID,
	).Scan(&pago.ID, &pago.TenantID, &pago.OrdenID, &pago.TurnoCajaID,
		&pago.MontoTotal, &pago.MontoPagado, &pago.Vuelto, &pago.Propina,
		&pago.Estado, &pago.UsuarioID, &pago.DeletedAt, &pago.CreatedAt, &pago.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Detalle de pago
	for _, d := range req.Detalle {
		var dp caja.DetallePago
		tx.QueryRow(`
			INSERT INTO detalle_pagos (tenant_id, pago_id, metodo_pago_id, monto, referencia)
			VALUES ($1,$2,$3,$4,$5)
			RETURNING id, tenant_id, pago_id, metodo_pago_id, monto, referencia
		`, tenantID, pago.ID, d.MetodoPagoID, d.Monto, d.Referencia,
		).Scan(&dp.ID, &dp.TenantID, &dp.PagoID, &dp.MetodoPagoID, &dp.Monto, &dp.Referencia)
		pago.Detalle = append(pago.Detalle, dp)
	}

	// Marcar orden como pagada
	tx.Exec("UPDATE ordenes SET estado = 'pagada', turno_caja_id = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3",
		turnoID, req.OrdenID, tenantID)

	return &pago, tx.Commit()
}

func (r *CajaRepo) AnularPago(tenantID string, pagoID int64, motivo string) error {
	_, err := r.DB.Exec(`
		UPDATE pagos SET estado = 'anulado', updated_at = NOW() WHERE id = $1 AND tenant_id = $2
	`, pagoID, tenantID)
	return err
}

func (r *CajaRepo) ListarPagosPorTurno(tenantID string, turnoID int64) ([]caja.Pago, error) {
	rows, err := r.DB.Query(`
		SELECT p.id, p.tenant_id, p.orden_id, p.turno_caja_id, p.monto_total, p.monto_pagado,
			   p.vuelto, p.propina, p.estado, p.usuario_id, p.deleted_at, p.created_at, p.updated_at,
			   COALESCE(o.numero_orden, '') as numero_orden,
			   COALESCE(u.nombre || ' ' || u.apellidos, '') as nombre_usuario
		FROM pagos p
		LEFT JOIN ordenes o ON o.id = p.orden_id AND o.tenant_id = p.tenant_id
		LEFT JOIN usuarios u ON u.id = p.usuario_id AND u.tenant_id = p.tenant_id
		WHERE p.turno_caja_id = $1 AND p.tenant_id = $2
		ORDER BY p.created_at DESC
	`, turnoID, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pagos []caja.Pago
	for rows.Next() {
		var p caja.Pago
		rows.Scan(&p.ID, &p.TenantID, &p.OrdenID, &p.TurnoCajaID, &p.MontoTotal, &p.MontoPagado,
			&p.Vuelto, &p.Propina, &p.Estado, &p.UsuarioID, &p.DeletedAt, &p.CreatedAt, &p.UpdatedAt,
			&p.NumeroOrden, &p.NombreUsuario)
		pagos = append(pagos, p)
	}
	return pagos, nil
}

// ============ COMPROBANTES ============

func (r *CajaRepo) CrearComprobante(tenantID string, req caja.NuevoComprobanteRequest) (*caja.Comprobante, error) {
	// Obtener datos de la orden/pago
	var subtotal, igv, total float64
	r.DB.QueryRow("SELECT subtotal, igv, total FROM ordenes WHERE id = $1 AND tenant_id = $2",
		req.OrdenID, tenantID).Scan(&subtotal, &igv, &total)

	// Generar serie y número
	var lastNum int
	r.DB.QueryRow(`
		SELECT COALESCE(MAX(CAST(numero AS INTEGER)), 0) FROM comprobantes
		WHERE tenant_id = $1 AND tipo_comprobante = $2 AND serie = $3
	`, tenantID, req.TipoComprobante, "B001").Scan(&lastNum)

	serie := "B001"
	if req.TipoComprobante == "factura" {
		serie = "F001"
	}
	numero := fmt.Sprintf("%08d", lastNum+1)

	var comp caja.Comprobante
	err := r.DB.QueryRow(`
		INSERT INTO comprobantes (tenant_id, orden_id, pago_id, tipo_comprobante, serie, numero,
			ruc_cliente, razon_social, direccion_fiscal, subtotal, igv, total)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING id, tenant_id, orden_id, pago_id, tipo_comprobante, serie, numero,
			fecha_emision, ruc_cliente, razon_social, direccion_fiscal,
			subtotal, igv, total, estado,
			COALESCE(pdf_url, ''), COALESCE(hash_sunat, ''),
			deleted_at, created_at
	`, tenantID, req.OrdenID, req.PagoID, req.TipoComprobante, serie, numero,
		req.RUCCliente, req.RazonSocial, req.DireccionFiscal, subtotal, igv, total,
	).Scan(&comp.ID, &comp.TenantID, &comp.OrdenID, &comp.PagoID,
		&comp.TipoComprobante, &comp.Serie, &comp.Numero, &comp.FechaEmision,
		&comp.RUCCliente, &comp.RazonSocial, &comp.DireccionFiscal,
		&comp.Subtotal, &comp.IGV, &comp.Total, &comp.Estado,
		&comp.PDFURL, &comp.HashSUNAT, &comp.DeletedAt, &comp.CreatedAt)
	return &comp, err
}

func (r *CajaRepo) AnularComprobante(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"UPDATE comprobantes SET estado = 'anulado' WHERE id = $1 AND tenant_id = $2",
		id, tenantID)
	return err
}
