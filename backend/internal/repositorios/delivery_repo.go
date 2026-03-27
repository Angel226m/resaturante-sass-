package repositorios

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/restauflow/backend/internal/entidades/delivery"
)

// ==========================================
// Repositorio: Delivery (Zonas, Órdenes Delivery, Seguimiento)
// ==========================================

type DeliveryRepo struct {
	DB *sql.DB
}

func NuevoDeliveryRepo(db *sql.DB) *DeliveryRepo {
	return &DeliveryRepo{DB: db}
}

// ============ ZONAS DELIVERY ============

func (r *DeliveryRepo) ListarZonasDelivery(tenantID string, localID int) ([]delivery.ZonaDelivery, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombre, radio_km, costo_envio, tiempo_estimado_min,
			   activo, created_at
		FROM zonas_delivery WHERE tenant_id = $1 AND local_id = $2 AND activo = true
		ORDER BY nombre
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var zonas []delivery.ZonaDelivery
	for rows.Next() {
		var z delivery.ZonaDelivery
		rows.Scan(&z.ID, &z.TenantID, &z.LocalID, &z.Nombre, &z.RadioKM,
			&z.CostoEnvio, &z.TiempoEstimadoMin, &z.Activo, &z.CreatedAt)
		zonas = append(zonas, z)
	}
	return zonas, nil
}

func (r *DeliveryRepo) CrearZonaDelivery(tenantID string, req delivery.NuevaZonaDeliveryRequest) (*delivery.ZonaDelivery, error) {
	var z delivery.ZonaDelivery
	err := r.DB.QueryRow(`
		INSERT INTO zonas_delivery (tenant_id, local_id, nombre, radio_km, costo_envio, tiempo_estimado_min)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id, tenant_id, local_id, nombre, radio_km, costo_envio,
			tiempo_estimado_min, activo, created_at
	`, tenantID, req.LocalID, req.Nombre, req.RadioKM, req.CostoEnvio, req.TiempoEstimadoMin,
	).Scan(&z.ID, &z.TenantID, &z.LocalID, &z.Nombre, &z.RadioKM,
		&z.CostoEnvio, &z.TiempoEstimadoMin, &z.Activo, &z.CreatedAt)
	return &z, err
}

func (r *DeliveryRepo) ActualizarZonaDelivery(tenantID string, id int, req delivery.ActualizarZonaDeliveryRequest) (*delivery.ZonaDelivery, error) {
	sets := []string{}
	args := []interface{}{}
	argPos := 1

	if req.Nombre != nil {
		sets = append(sets, fmt.Sprintf("nombre = $%d", argPos))
		args = append(args, *req.Nombre)
		argPos++
	}
	if req.RadioKM != nil {
		sets = append(sets, fmt.Sprintf("radio_km = $%d", argPos))
		args = append(args, *req.RadioKM)
		argPos++
	}
	if req.CostoEnvio != nil {
		sets = append(sets, fmt.Sprintf("costo_envio = $%d", argPos))
		args = append(args, *req.CostoEnvio)
		argPos++
	}
	if req.TiempoEstimadoMin != nil {
		sets = append(sets, fmt.Sprintf("tiempo_estimado_min = $%d", argPos))
		args = append(args, *req.TiempoEstimadoMin)
		argPos++
	}
	if req.Activo != nil {
		sets = append(sets, fmt.Sprintf("activo = $%d", argPos))
		args = append(args, *req.Activo)
		argPos++
	}

	if len(sets) == 0 {
		return nil, fmt.Errorf("no hay campos para actualizar")
	}

	args = append(args, id, tenantID)
	query := fmt.Sprintf(`UPDATE zonas_delivery SET %s WHERE id = $%d AND tenant_id = $%d
		RETURNING id, tenant_id, local_id, nombre, radio_km, costo_envio,
			tiempo_estimado_min, activo, created_at`,
		strings.Join(sets, ", "), argPos, argPos+1)

	var z delivery.ZonaDelivery
	err := r.DB.QueryRow(query, args...).Scan(
		&z.ID, &z.TenantID, &z.LocalID, &z.Nombre, &z.RadioKM,
		&z.CostoEnvio, &z.TiempoEstimadoMin, &z.Activo, &z.CreatedAt)
	return &z, err
}

func (r *DeliveryRepo) EliminarZonaDelivery(tenantID string, id int) error {
	_, err := r.DB.Exec("UPDATE zonas_delivery SET activo = false WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

// ============ DELIVERY ÓRDENES ============

func (r *DeliveryRepo) ListarDeliveryOrdenes(tenantID string, filtros delivery.FiltrosDelivery, pagina, porPagina int) ([]delivery.DeliveryOrden, int, error) {
	where := "d.tenant_id = $1"
	args := []interface{}{tenantID}
	argPos := 2

	if filtros.LocalID > 0 {
		where += fmt.Sprintf(" AND EXISTS (SELECT 1 FROM ordenes o2 WHERE o2.id = d.orden_id AND o2.local_id = $%d)", argPos)
		args = append(args, filtros.LocalID)
		argPos++
	}
	if filtros.Estado != "" {
		where += fmt.Sprintf(" AND d.estado_delivery = $%d", argPos)
		args = append(args, filtros.Estado)
		argPos++
	}
	if filtros.RepartidorID != nil {
		where += fmt.Sprintf(" AND d.repartidor_id = $%d", argPos)
		args = append(args, *filtros.RepartidorID)
		argPos++
	}
	if filtros.FechaDesde != "" {
		where += fmt.Sprintf(" AND d.created_at >= $%d", argPos)
		args = append(args, filtros.FechaDesde)
		argPos++
	}
	if filtros.FechaHasta != "" {
		where += fmt.Sprintf(" AND d.created_at <= $%d::timestamp + interval '1 day'", argPos)
		args = append(args, filtros.FechaHasta)
		argPos++
	}

	var total int
	r.DB.QueryRow("SELECT COUNT(*) FROM delivery_ordenes d WHERE "+where, args...).Scan(&total)

	offset := (pagina - 1) * porPagina
	args = append(args, porPagina, offset)
	query := fmt.Sprintf(`
		SELECT d.id, d.tenant_id, d.orden_id, d.zona_delivery_id, d.repartidor_id,
			   d.direccion_entrega_id, d.estado_delivery, d.costo_envio, d.distancia_km,
			   d.instrucciones_entrega, d.codigo_confirmacion,
			   d.latitud_entrega, d.longitud_entrega,
			   d.tiempo_estimado_entrega, d.tiempo_real_entrega,
			   d.created_at, d.updated_at,
			   COALESCE(o.numero_orden, '') as numero_orden,
			   COALESCE(u.nombres, '') as nombre_repartidor,
			   COALESCE(zd.nombre, '') as nombre_zona
		FROM delivery_ordenes d
		LEFT JOIN ordenes o ON o.id = d.orden_id AND o.tenant_id = d.tenant_id
		LEFT JOIN usuarios u ON u.id = d.repartidor_id AND u.tenant_id = d.tenant_id
		LEFT JOIN zonas_delivery zd ON zd.id = d.zona_delivery_id AND zd.tenant_id = d.tenant_id
		WHERE %s ORDER BY d.created_at DESC LIMIT $%d OFFSET $%d
	`, where, argPos, argPos+1)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var items []delivery.DeliveryOrden
	for rows.Next() {
		var d delivery.DeliveryOrden
		rows.Scan(&d.ID, &d.TenantID, &d.OrdenID, &d.ZonaDeliveryID, &d.RepartidorID,
			&d.DireccionEntregaID, &d.EstadoDelivery, &d.CostoEnvio, &d.DistanciaKM,
			&d.InstruccionesEntrega, &d.CodigoConfirmacion,
			&d.LatitudEntrega, &d.LongitudEntrega,
			&d.TiempoEstimadoEntrega, &d.TiempoRealEntrega,
			&d.CreatedAt, &d.UpdatedAt,
			&d.NumeroOrden, &d.NombreRepartidor, &d.NombreZona)
		items = append(items, d)
	}
	return items, total, nil
}

func (r *DeliveryRepo) ObtenerDeliveryOrden(tenantID string, id int64) (*delivery.DeliveryOrden, error) {
	var d delivery.DeliveryOrden
	err := r.DB.QueryRow(`
		SELECT d.id, d.tenant_id, d.orden_id, d.zona_delivery_id, d.repartidor_id,
			   d.direccion_entrega_id, d.estado_delivery, d.costo_envio, d.distancia_km,
			   d.instrucciones_entrega, d.codigo_confirmacion,
			   d.latitud_entrega, d.longitud_entrega,
			   d.tiempo_estimado_entrega, d.tiempo_real_entrega,
			   d.created_at, d.updated_at,
			   COALESCE(o.numero_orden, '') as numero_orden,
			   COALESCE(u.nombres, '') as nombre_repartidor
		FROM delivery_ordenes d
		LEFT JOIN ordenes o ON o.id = d.orden_id AND o.tenant_id = d.tenant_id
		LEFT JOIN usuarios u ON u.id = d.repartidor_id AND u.tenant_id = d.tenant_id
		WHERE d.id = $1 AND d.tenant_id = $2
	`, id, tenantID).Scan(&d.ID, &d.TenantID, &d.OrdenID, &d.ZonaDeliveryID, &d.RepartidorID,
		&d.DireccionEntregaID, &d.EstadoDelivery, &d.CostoEnvio, &d.DistanciaKM,
		&d.InstruccionesEntrega, &d.CodigoConfirmacion,
		&d.LatitudEntrega, &d.LongitudEntrega,
		&d.TiempoEstimadoEntrega, &d.TiempoRealEntrega,
		&d.CreatedAt, &d.UpdatedAt,
		&d.NumeroOrden, &d.NombreRepartidor)
	if err != nil {
		return nil, err
	}

	// Cargar seguimiento
	sRows, _ := r.DB.Query(`
		SELECT id, tenant_id, delivery_id, repartidor_id, latitud, longitud, estado_delivery, created_at
		FROM seguimiento_delivery WHERE delivery_id = $1 AND tenant_id = $2
		ORDER BY created_at ASC
	`, id, tenantID)
	if sRows != nil {
		defer sRows.Close()
		for sRows.Next() {
			var s delivery.SeguimientoDelivery
			sRows.Scan(&s.ID, &s.TenantID, &s.DeliveryID, &s.RepartidorID,
				&s.Latitud, &s.Longitud, &s.EstadoDelivery, &s.CreatedAt)
			d.Seguimiento = append(d.Seguimiento, s)
		}
	}
	return &d, nil
}

func (r *DeliveryRepo) CrearDeliveryOrden(tenantID string, req delivery.NuevoDeliveryOrdenRequest) (*delivery.DeliveryOrden, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Obtener costo de zona si se proporcionó
	var costoEnvio float64
	if req.ZonaDeliveryID != nil {
		tx.QueryRow("SELECT costo_envio FROM zonas_delivery WHERE id = $1 AND tenant_id = $2",
			*req.ZonaDeliveryID, tenantID).Scan(&costoEnvio)
	}

	// Generar código de confirmación
	codigoConf := fmt.Sprintf("%06d", int(req.OrdenID)%1000000)

	var d delivery.DeliveryOrden
	err = tx.QueryRow(`
		INSERT INTO delivery_ordenes (tenant_id, orden_id, zona_delivery_id, direccion_entrega_id,
			instrucciones_entrega, latitud_entrega, longitud_entrega,
			costo_envio, codigo_confirmacion)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, tenant_id, orden_id, zona_delivery_id, repartidor_id,
			direccion_entrega_id, estado_delivery, costo_envio, distancia_km,
			instrucciones_entrega, codigo_confirmacion,
			latitud_entrega, longitud_entrega,
			tiempo_estimado_entrega, tiempo_real_entrega,
			created_at, updated_at
	`, tenantID, req.OrdenID, req.ZonaDeliveryID, req.DireccionEntregaID,
		req.InstruccionesEntrega, req.LatitudEntrega, req.LongitudEntrega,
		costoEnvio, codigoConf,
	).Scan(&d.ID, &d.TenantID, &d.OrdenID, &d.ZonaDeliveryID, &d.RepartidorID,
		&d.DireccionEntregaID, &d.EstadoDelivery, &d.CostoEnvio, &d.DistanciaKM,
		&d.InstruccionesEntrega, &d.CodigoConfirmacion,
		&d.LatitudEntrega, &d.LongitudEntrega,
		&d.TiempoEstimadoEntrega, &d.TiempoRealEntrega,
		&d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Actualizar orden como tipo delivery
	tx.Exec("UPDATE ordenes SET tipo_orden = 'delivery', updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
		req.OrdenID, tenantID)

	return &d, tx.Commit()
}

func (r *DeliveryRepo) AsignarRepartidor(tenantID string, deliveryID int64, req delivery.AsignarRepartidorRequest) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
		UPDATE delivery_ordenes SET repartidor_id = $1, estado_delivery = 'asignado', updated_at = NOW()
		WHERE id = $2 AND tenant_id = $3
	`, req.RepartidorID, deliveryID, tenantID)
	if err != nil {
		return err
	}

	tx.Exec(`
		INSERT INTO seguimiento_delivery (tenant_id, delivery_id, repartidor_id, latitud, longitud, estado_delivery)
		VALUES ($1,$2,$3,0,0,'asignado')
	`, tenantID, deliveryID, req.RepartidorID)

	return tx.Commit()
}

func (r *DeliveryRepo) ActualizarEstadoDelivery(tenantID string, deliveryID int64, repartidorID int, req delivery.ActualizarEstadoDeliveryRequest) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	sets := "estado_delivery = $1, updated_at = NOW()"
	args := []interface{}{req.EstadoDelivery, deliveryID, tenantID}

	switch req.EstadoDelivery {
	case "entregado":
		sets += ", tiempo_real_entrega = NOW()"
	}

	_, err = tx.Exec(fmt.Sprintf("UPDATE delivery_ordenes SET %s WHERE id = $2 AND tenant_id = $3", sets), args...)
	if err != nil {
		return err
	}

	// Seguimiento GPS
	lat := 0.0
	lng := 0.0
	if req.Latitud != nil {
		lat = *req.Latitud
	}
	if req.Longitud != nil {
		lng = *req.Longitud
	}
	tx.Exec(`
		INSERT INTO seguimiento_delivery (tenant_id, delivery_id, repartidor_id, latitud, longitud, estado_delivery)
		VALUES ($1,$2,$3,$4,$5,$6)
	`, tenantID, deliveryID, repartidorID, lat, lng, req.EstadoDelivery)

	return tx.Commit()
}

func (r *DeliveryRepo) ObtenerSeguimiento(tenantID string, deliveryID int64) ([]delivery.SeguimientoDelivery, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, delivery_id, repartidor_id, latitud, longitud, estado_delivery, created_at
		FROM seguimiento_delivery WHERE delivery_id = $1 AND tenant_id = $2
		ORDER BY created_at ASC
	`, deliveryID, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []delivery.SeguimientoDelivery
	for rows.Next() {
		var s delivery.SeguimientoDelivery
		rows.Scan(&s.ID, &s.TenantID, &s.DeliveryID, &s.RepartidorID,
			&s.Latitud, &s.Longitud, &s.EstadoDelivery, &s.CreatedAt)
		items = append(items, s)
	}
	return items, nil
}
