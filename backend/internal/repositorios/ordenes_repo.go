package repositorios

import (
	"database/sql"
	"fmt"

	"github.com/restauflow/backend/internal/entidades/ordenes"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Repositorio: Órdenes + Items + Historial + Tickets Cocina
// ==========================================

type OrdenesRepo struct {
	DB *sql.DB
}

func NuevoOrdenesRepo(db *sql.DB) *OrdenesRepo {
	return &OrdenesRepo{DB: db}
}

// ============ ÓRDENES ============

func (r *OrdenesRepo) ListarOrdenes(tenantID string, filtros ordenes.FiltrosOrden) ([]ordenes.Orden, int, error) {
	query := `
		SELECT o.id, o.tenant_id, o.local_id, o.numero_orden, o.tipo_orden, o.estado,
			   o.mesa_id, o.cliente_id, o.mesero_id, o.numero_personas,
			   o.subtotal, o.descuento, o.igv, o.total,
			   o.promocion_id, o.cupon_id, o.turno_caja_id, o.notas,
			   o.tiempo_estimado, o.fecha_completada, o.deleted_at, o.created_at, o.updated_at,
			   COALESCE(m.numero, '') as numero_mesa,
			   COALESCE(c.nombres || ' ' || c.apellidos, '') as nombre_cliente,
			   COALESCE(u.nombres, '') as nombre_mesero
		FROM ordenes o
		LEFT JOIN mesas m ON m.id = o.mesa_id AND m.tenant_id = o.tenant_id
		LEFT JOIN clientes c ON c.id = o.cliente_id AND c.tenant_id = o.tenant_id
		LEFT JOIN usuarios u ON u.id = o.mesero_id AND u.tenant_id = o.tenant_id
		WHERE o.tenant_id = $1 AND o.local_id = $2 AND o.deleted_at IS NULL`
	countQuery := "SELECT COUNT(*) FROM ordenes o WHERE o.tenant_id = $1 AND o.local_id = $2 AND o.deleted_at IS NULL"

	args := []interface{}{tenantID, filtros.LocalID}
	countArgs := []interface{}{tenantID, filtros.LocalID}
	argIdx := 3

	if filtros.Estado != "" {
		cond := fmt.Sprintf(" AND o.estado = $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.Estado)
		countArgs = append(countArgs, filtros.Estado)
		argIdx++
	}
	if filtros.TipoOrden != "" {
		cond := fmt.Sprintf(" AND o.tipo_orden = $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.TipoOrden)
		countArgs = append(countArgs, filtros.TipoOrden)
		argIdx++
	}
	if filtros.MesaID != nil {
		cond := fmt.Sprintf(" AND o.mesa_id = $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, *filtros.MesaID)
		countArgs = append(countArgs, *filtros.MesaID)
		argIdx++
	}
	if filtros.MeseroID != nil {
		cond := fmt.Sprintf(" AND o.mesero_id = $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, *filtros.MeseroID)
		countArgs = append(countArgs, *filtros.MeseroID)
		argIdx++
	}
	if filtros.FechaDesde != "" {
		cond := fmt.Sprintf(" AND o.created_at >= $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.FechaDesde)
		countArgs = append(countArgs, filtros.FechaDesde)
		argIdx++
	}
	if filtros.FechaHasta != "" {
		cond := fmt.Sprintf(" AND o.created_at <= $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.FechaHasta)
		countArgs = append(countArgs, filtros.FechaHasta)
		argIdx++
	}

	var total int
	r.DB.QueryRow(countQuery, countArgs...).Scan(&total)

	query += " ORDER BY o.created_at DESC"
	offset := (filtros.Pagina - 1) * filtros.PorPagina
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, filtros.PorPagina, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var lista []ordenes.Orden
	for rows.Next() {
		var o ordenes.Orden
		rows.Scan(&o.ID, &o.TenantID, &o.LocalID, &o.NumeroOrden, &o.TipoOrden, &o.Estado,
			&o.MesaID, &o.ClienteID, &o.MeseroID, &o.NumeroPersonas,
			&o.Subtotal, &o.Descuento, &o.IGV, &o.Total,
			&o.PromocionID, &o.CuponID, &o.TurnoCajaID, &o.Notas,
			&o.TiempoEstimado, &o.FechaCompletada, &o.DeletedAt, &o.CreatedAt, &o.UpdatedAt,
			&o.NumeroMesa, &o.NombreCliente, &o.NombreMesero)
		lista = append(lista, o)
	}
	return lista, total, nil
}

func (r *OrdenesRepo) ObtenerOrden(tenantID string, id int64) (*ordenes.Orden, error) {
	var o ordenes.Orden
	err := r.DB.QueryRow(`
		SELECT o.id, o.tenant_id, o.local_id, o.numero_orden, o.tipo_orden, o.estado,
			   o.mesa_id, o.cliente_id, o.mesero_id, o.numero_personas,
			   o.subtotal, o.descuento, o.igv, o.total,
			   o.promocion_id, o.cupon_id, o.turno_caja_id, o.notas,
			   o.tiempo_estimado, o.fecha_completada, o.deleted_at, o.created_at, o.updated_at,
			   COALESCE(m.numero, '') as numero_mesa,
			   COALESCE(c.nombres || ' ' || c.apellidos, '') as nombre_cliente,
			   COALESCE(u.nombres, '') as nombre_mesero
		FROM ordenes o
		LEFT JOIN mesas m ON m.id = o.mesa_id AND m.tenant_id = o.tenant_id
		LEFT JOIN clientes c ON c.id = o.cliente_id AND c.tenant_id = o.tenant_id
		LEFT JOIN usuarios u ON u.id = o.mesero_id AND u.tenant_id = o.tenant_id
		WHERE o.id = $1 AND o.tenant_id = $2 AND o.deleted_at IS NULL
	`, id, tenantID).Scan(&o.ID, &o.TenantID, &o.LocalID, &o.NumeroOrden, &o.TipoOrden, &o.Estado,
		&o.MesaID, &o.ClienteID, &o.MeseroID, &o.NumeroPersonas,
		&o.Subtotal, &o.Descuento, &o.IGV, &o.Total,
		&o.PromocionID, &o.CuponID, &o.TurnoCajaID, &o.Notas,
		&o.TiempoEstimado, &o.FechaCompletada, &o.DeletedAt, &o.CreatedAt, &o.UpdatedAt,
		&o.NumeroMesa, &o.NombreCliente, &o.NombreMesero)
	if err != nil {
		return nil, err
	}

	// Cargar items
	itemRows, err := r.DB.Query(`
		SELECT i.id, i.tenant_id, i.orden_id, i.producto_menu_id, i.variante_id,
			   i.cantidad, i.precio_unitario, i.precio_modificadores, i.descuento, i.subtotal,
			   i.estado, i.notas, i.created_at, i.updated_at,
			   COALESCE(p.nombre, '') as nombre_producto,
			   COALESCE(v.nombre, '') as nombre_variante
		FROM items_orden i
		LEFT JOIN productos_menu p ON p.id = i.producto_menu_id AND p.tenant_id = i.tenant_id
		LEFT JOIN variantes_producto_menu v ON v.id = i.variante_id AND v.tenant_id = i.tenant_id
		WHERE i.orden_id = $1 AND i.tenant_id = $2
		ORDER BY i.created_at
	`, id, tenantID)
	if err == nil {
		defer itemRows.Close()
		for itemRows.Next() {
			var item ordenes.ItemOrden
			itemRows.Scan(&item.ID, &item.TenantID, &item.OrdenID, &item.ProductoMenuID, &item.VarianteID,
				&item.Cantidad, &item.PrecioUnitario, &item.PrecioModificadores, &item.Descuento, &item.Subtotal,
				&item.Estado, &item.Notas, &item.CreatedAt, &item.UpdatedAt,
				&item.NombreProducto, &item.NombreVariante)

			// Cargar modificadores del item
			modRows, _ := r.DB.Query(`
				SELECT mi.id, mi.tenant_id, mi.item_orden_id, mi.modificador_id, mi.cantidad, mi.precio_adicional,
					   COALESCE(mod.nombre, '') as nombre_modificador
				FROM modificadores_item_orden mi
				LEFT JOIN modificadores mod ON mod.id = mi.modificador_id AND mod.tenant_id = mi.tenant_id
				WHERE mi.item_orden_id = $1 AND mi.tenant_id = $2
			`, item.ID, tenantID)
			if modRows != nil {
				for modRows.Next() {
					var m ordenes.ModificadorItemOrden
					modRows.Scan(&m.ID, &m.TenantID, &m.ItemOrdenID, &m.ModificadorID,
						&m.Cantidad, &m.PrecioAdicional, &m.NombreModificador)
					item.Modificadores = append(item.Modificadores, m)
				}
				modRows.Close()
			}
			o.Items = append(o.Items, item)
		}
	}

	// Cargar historial
	histRows, _ := r.DB.Query(`
		SELECT h.id, h.tenant_id, h.orden_id, h.estado_anterior, h.estado_nuevo,
			   h.usuario_id, h.motivo, h.created_at,
			   COALESCE(u.nombres, '') as nombre_usuario
		FROM historial_estados_orden h
		LEFT JOIN usuarios u ON u.id = h.usuario_id AND u.tenant_id = h.tenant_id
		WHERE h.orden_id = $1 AND h.tenant_id = $2 ORDER BY h.created_at
	`, id, tenantID)
	if histRows != nil {
		defer histRows.Close()
		for histRows.Next() {
			var h ordenes.HistorialEstadoOrden
			histRows.Scan(&h.ID, &h.TenantID, &h.OrdenID, &h.EstadoAnterior, &h.EstadoNuevo,
				&h.UsuarioID, &h.Motivo, &h.CreatedAt, &h.NombreUsuario)
			o.Historial = append(o.Historial, h)
		}
	}

	return &o, nil
}

func (r *OrdenesRepo) CrearOrden(tenantID string, meseroID int64, req ordenes.NuevaOrdenRequest) (*ordenes.Orden, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	numeroOrden, _ := utils.GenerarNumeroOrden(r.DB, tenantID)

	var o ordenes.Orden
	err = tx.QueryRow(`
		INSERT INTO ordenes (tenant_id, local_id, numero_orden, tipo_orden, mesa_id, cliente_id,
			mesero_id, numero_personas, promocion_id, cupon_id, notas)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id, tenant_id, local_id, numero_orden, tipo_orden, estado,
			mesa_id, cliente_id, mesero_id, numero_personas,
			subtotal, descuento, igv, total,
			promocion_id, cupon_id, turno_caja_id, notas,
			tiempo_estimado, fecha_completada, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, numeroOrden, req.TipoOrden, req.MesaID, req.ClienteID,
		meseroID, req.NumeroPersonas, req.PromocionID, req.CuponID, req.Notas,
	).Scan(&o.ID, &o.TenantID, &o.LocalID, &o.NumeroOrden, &o.TipoOrden, &o.Estado,
		&o.MesaID, &o.ClienteID, &o.MeseroID, &o.NumeroPersonas,
		&o.Subtotal, &o.Descuento, &o.IGV, &o.Total,
		&o.PromocionID, &o.CuponID, &o.TurnoCajaID, &o.Notas,
		&o.TiempoEstimado, &o.FechaCompletada, &o.DeletedAt, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Insertar items
	var subtotalTotal float64
	for _, itemReq := range req.Items {
		// Obtener precio del producto
		var precioBase float64
		tx.QueryRow("SELECT precio_base FROM productos_menu WHERE id = $1 AND tenant_id = $2",
			itemReq.ProductoMenuID, tenantID).Scan(&precioBase)

		// Precio variante
		var precioVariante float64
		if itemReq.VarianteID != nil {
			tx.QueryRow("SELECT precio_adicional FROM variantes_producto_menu WHERE id = $1 AND tenant_id = $2",
				*itemReq.VarianteID, tenantID).Scan(&precioVariante)
		}

		precioUnitario := precioBase + precioVariante

		// Calcular precio modificadores
		var precioMods float64
		for _, modReq := range itemReq.Modificadores {
			var precioMod float64
			tx.QueryRow("SELECT precio_adicional FROM modificadores WHERE id = $1 AND tenant_id = $2",
				modReq.ModificadorID, tenantID).Scan(&precioMod)
			precioMods += precioMod * float64(modReq.Cantidad)
		}

		subtotalItem := (precioUnitario + precioMods) * float64(itemReq.Cantidad)
		subtotalTotal += subtotalItem

		var itemID int64
		err = tx.QueryRow(`
			INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, variante_id,
				cantidad, precio_unitario, precio_modificadores, subtotal, notas)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
			RETURNING id
		`, tenantID, o.ID, itemReq.ProductoMenuID, itemReq.VarianteID,
			itemReq.Cantidad, precioUnitario, precioMods, subtotalItem, itemReq.Notas,
		).Scan(&itemID)
		if err != nil {
			return nil, err
		}

		// Insertar modificadores del item
		for _, modReq := range itemReq.Modificadores {
			var precioMod float64
			tx.QueryRow("SELECT precio_adicional FROM modificadores WHERE id = $1 AND tenant_id = $2",
				modReq.ModificadorID, tenantID).Scan(&precioMod)
			tx.Exec(`
				INSERT INTO modificadores_item_orden (tenant_id, item_orden_id, modificador_id, cantidad, precio_adicional)
				VALUES ($1,$2,$3,$4,$5)
			`, tenantID, itemID, modReq.ModificadorID, modReq.Cantidad, precioMod)
		}
	}

	// Actualizar totales (IGV calculado en servicio según config)
	igv := subtotalTotal * 0.18
	total := subtotalTotal + igv
	tx.Exec(`
		UPDATE ordenes SET subtotal = $1, igv = $2, total = $3, updated_at = NOW()
		WHERE id = $4 AND tenant_id = $5
	`, subtotalTotal, igv, total, o.ID, tenantID)
	o.Subtotal = subtotalTotal
	o.IGV = igv
	o.Total = total

	// Historial inicial
	tx.Exec(`
		INSERT INTO historial_estados_orden (tenant_id, orden_id, estado_anterior, estado_nuevo, usuario_id, motivo)
		VALUES ($1,$2,'','pendiente',$3,'Orden creada')
	`, tenantID, o.ID, meseroID)

	// Si es de salon, cambiar estado mesa a ocupada
	if req.MesaID != nil {
		tx.Exec("UPDATE mesas SET estado = 'ocupada', updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
			*req.MesaID, tenantID)
	}

	return &o, tx.Commit()
}

func (r *OrdenesRepo) CambiarEstadoOrden(tenantID string, id int64, req ordenes.CambiarEstadoOrdenRequest, usuarioID int64) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var estadoAnterior string
	var mesaID *int
	err = tx.QueryRow("SELECT estado, mesa_id FROM ordenes WHERE id = $1 AND tenant_id = $2",
		id, tenantID).Scan(&estadoAnterior, &mesaID)
	if err != nil {
		return err
	}

	updateQ := "UPDATE ordenes SET estado = $1, updated_at = NOW()"
	if req.Estado == "completada" || req.Estado == "entregada" {
		updateQ += ", fecha_completada = NOW()"
	}
	updateQ += " WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL"
	_, err = tx.Exec(updateQ, req.Estado, id, tenantID)
	if err != nil {
		return err
	}

	// Historial
	tx.Exec(`
		INSERT INTO historial_estados_orden (tenant_id, orden_id, estado_anterior, estado_nuevo, usuario_id, motivo)
		VALUES ($1,$2,$3,$4,$5,$6)
	`, tenantID, id, estadoAnterior, req.Estado, usuarioID, req.Motivo)

	// Si completada/cancelada y tiene mesa, liberar mesa
	if (req.Estado == "completada" || req.Estado == "cancelada" || req.Estado == "entregada") && mesaID != nil {
		tx.Exec("UPDATE mesas SET estado = 'disponible', updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
			*mesaID, tenantID)
	}

	return tx.Commit()
}

func (r *OrdenesRepo) AgregarItemOrden(tenantID string, ordenID int64, req ordenes.NuevoItemOrdenReq) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var precioBase float64
	tx.QueryRow("SELECT precio_base FROM productos_menu WHERE id = $1 AND tenant_id = $2",
		req.ProductoMenuID, tenantID).Scan(&precioBase)

	var precioVariante float64
	if req.VarianteID != nil {
		tx.QueryRow("SELECT precio_adicional FROM variantes_producto_menu WHERE id = $1 AND tenant_id = $2",
			*req.VarianteID, tenantID).Scan(&precioVariante)
	}

	precioUnitario := precioBase + precioVariante
	var precioMods float64
	for _, modReq := range req.Modificadores {
		var pm float64
		tx.QueryRow("SELECT precio_adicional FROM modificadores WHERE id = $1 AND tenant_id = $2",
			modReq.ModificadorID, tenantID).Scan(&pm)
		precioMods += pm * float64(modReq.Cantidad)
	}

	subtotal := (precioUnitario + precioMods) * float64(req.Cantidad)

	var itemID int64
	tx.QueryRow(`
		INSERT INTO items_orden (tenant_id, orden_id, producto_menu_id, variante_id,
			cantidad, precio_unitario, precio_modificadores, subtotal, notas)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id
	`, tenantID, ordenID, req.ProductoMenuID, req.VarianteID,
		req.Cantidad, precioUnitario, precioMods, subtotal, req.Notas).Scan(&itemID)

	for _, modReq := range req.Modificadores {
		var pm float64
		tx.QueryRow("SELECT precio_adicional FROM modificadores WHERE id = $1 AND tenant_id = $2",
			modReq.ModificadorID, tenantID).Scan(&pm)
		tx.Exec(`
			INSERT INTO modificadores_item_orden (tenant_id, item_orden_id, modificador_id, cantidad, precio_adicional)
			VALUES ($1,$2,$3,$4,$5)
		`, tenantID, itemID, modReq.ModificadorID, modReq.Cantidad, pm)
	}

	// Recalcular totales de la orden
	r.recalcularTotalesOrden(tx, tenantID, ordenID)

	return tx.Commit()
}

func (r *OrdenesRepo) recalcularTotalesOrden(tx *sql.Tx, tenantID string, ordenID int64) {
	var subtotal float64
	tx.QueryRow(`
		SELECT COALESCE(SUM(subtotal), 0) FROM items_orden WHERE orden_id = $1 AND tenant_id = $2
	`, ordenID, tenantID).Scan(&subtotal)

	igv := subtotal * 0.18
	total := subtotal + igv
	tx.Exec(`
		UPDATE ordenes SET subtotal = $1, igv = $2, total = $3, updated_at = NOW()
		WHERE id = $4 AND tenant_id = $5
	`, subtotal, igv, total, ordenID, tenantID)
}

func (r *OrdenesRepo) ContarOrdenesActivas(tenantID string, localID int) (int, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM ordenes
		WHERE tenant_id = $1 AND local_id = $2 AND estado IN ('pendiente','en_preparacion','listo')
		AND deleted_at IS NULL
	`, tenantID, localID).Scan(&count)
	return count, err
}

// ============ TICKETS COCINA ============

func (r *OrdenesRepo) ListarTicketsCocina(tenantID string, filtros ordenes.FiltrosTicketCocina) ([]ordenes.TicketCocina, error) {
	query := `
		SELECT t.id, t.tenant_id, t.orden_id, t.estacion_cocina, t.estado,
			   t.prioridad, t.tiempo_estimado, t.fecha_inicio, t.fecha_terminado,
			   t.cocinero_id, t.notas, t.created_at, t.updated_at,
			   COALESCE(o.numero_orden, '') as numero_orden,
			   COALESCE(u.nombres, '') as nombre_cocinero
		FROM tickets_cocina t
		LEFT JOIN ordenes o ON o.id = t.orden_id AND o.tenant_id = t.tenant_id
		LEFT JOIN usuarios u ON u.id = t.cocinero_id AND u.tenant_id = t.tenant_id
		WHERE t.tenant_id = $1 AND o.local_id = $2`
	args := []interface{}{tenantID, filtros.LocalID}
	argIdx := 3

	if filtros.Estado != "" {
		query += fmt.Sprintf(" AND t.estado = $%d", argIdx)
		args = append(args, filtros.Estado)
		argIdx++
	}
	if filtros.EstacionCocina != "" {
		query += fmt.Sprintf(" AND t.estacion_cocina = $%d", argIdx)
		args = append(args, filtros.EstacionCocina)
		argIdx++
	}
	if filtros.Prioridad != nil {
		query += fmt.Sprintf(" AND t.prioridad = $%d", argIdx)
		args = append(args, *filtros.Prioridad)
		argIdx++
	}
	query += " ORDER BY t.prioridad DESC, t.created_at"

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tickets []ordenes.TicketCocina
	for rows.Next() {
		var t ordenes.TicketCocina
		rows.Scan(&t.ID, &t.TenantID, &t.OrdenID, &t.EstacionCocina, &t.Estado,
			&t.Prioridad, &t.TiempoEstimado, &t.FechaInicio, &t.FechaTerminado,
			&t.CocineroID, &t.Notas, &t.CreatedAt, &t.UpdatedAt,
			&t.NumeroOrden, &t.NombreCocinero)
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func (r *OrdenesRepo) CrearTicketCocina(tenantID string, ordenID int64, estacion string, prioridad int) (*ordenes.TicketCocina, error) {
	var t ordenes.TicketCocina
	err := r.DB.QueryRow(`
		INSERT INTO tickets_cocina (tenant_id, orden_id, estacion_cocina, prioridad)
		VALUES ($1,$2,$3,$4)
		RETURNING id, tenant_id, orden_id, estacion_cocina, estado, prioridad,
			tiempo_estimado, fecha_inicio, fecha_terminado, cocinero_id, notas, created_at, updated_at
	`, tenantID, ordenID, estacion, prioridad,
	).Scan(&t.ID, &t.TenantID, &t.OrdenID, &t.EstacionCocina, &t.Estado,
		&t.Prioridad, &t.TiempoEstimado, &t.FechaInicio, &t.FechaTerminado,
		&t.CocineroID, &t.Notas, &t.CreatedAt, &t.UpdatedAt)
	return &t, err
}

func (r *OrdenesRepo) CambiarEstadoTicket(tenantID string, id int64, req ordenes.CambiarEstadoTicketRequest) error {
	query := "UPDATE tickets_cocina SET estado = $1, updated_at = NOW()"
	args := []interface{}{req.Estado}
	argIdx := 2

	if req.CocineroID != nil {
		query += fmt.Sprintf(", cocinero_id = $%d", argIdx)
		args = append(args, *req.CocineroID)
		argIdx++
	}
	if req.Estado == "en_preparacion" {
		query += ", fecha_inicio = NOW()"
	}
	if req.Estado == "terminado" {
		query += ", fecha_terminado = NOW()"
	}

	query += fmt.Sprintf(" WHERE id = $%d AND tenant_id = $%d", argIdx, argIdx+1)
	args = append(args, id, tenantID)

	_, err := r.DB.Exec(query, args...)
	return err
}
