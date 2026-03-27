package repositorios

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/restauflow/backend/internal/entidades/local"
)

// ==========================================
// Repositorio: Locales + Zonas + Mesas + Config
// ==========================================

type LocalRepo struct {
	DB *sql.DB
}

func NuevoLocalRepo(db *sql.DB) *LocalRepo {
	return &LocalRepo{DB: db}
}

// ============ LOCALES ============

func (r *LocalRepo) ListarLocales(tenantID string) ([]local.Local, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, nombre, direccion, distrito, provincia, departamento,
			   telefono, correo, latitud, longitud, es_principal,
			   horario_apertura, horario_cierre, acepta_reservas, acepta_delivery,
			   radio_delivery_km, activo, deleted_at, created_at, updated_at
		FROM locales WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY es_principal DESC, nombre
	`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locales []local.Local
	for rows.Next() {
		var l local.Local
		err := rows.Scan(
			&l.ID, &l.TenantID, &l.Nombre, &l.Direccion, &l.Distrito,
			&l.Provincia, &l.Departamento, &l.Telefono, &l.Correo,
			&l.Latitud, &l.Longitud, &l.EsPrincipal,
			&l.HorarioApertura, &l.HorarioCierre,
			&l.AceptaReservas, &l.AceptaDelivery, &l.RadioDeliveryKM,
			&l.Activo, &l.DeletedAt, &l.CreatedAt, &l.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		locales = append(locales, l)
	}
	return locales, nil
}

func (r *LocalRepo) ObtenerLocal(tenantID string, id int) (*local.Local, error) {
	var l local.Local
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, nombre, direccion, distrito, provincia, departamento,
			   telefono, correo, latitud, longitud, es_principal,
			   horario_apertura, horario_cierre, acepta_reservas, acepta_delivery,
			   radio_delivery_km, activo, deleted_at, created_at, updated_at
		FROM locales WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
	`, id, tenantID).Scan(
		&l.ID, &l.TenantID, &l.Nombre, &l.Direccion, &l.Distrito,
		&l.Provincia, &l.Departamento, &l.Telefono, &l.Correo,
		&l.Latitud, &l.Longitud, &l.EsPrincipal,
		&l.HorarioApertura, &l.HorarioCierre,
		&l.AceptaReservas, &l.AceptaDelivery, &l.RadioDeliveryKM,
		&l.Activo, &l.DeletedAt, &l.CreatedAt, &l.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *LocalRepo) CrearLocal(tenantID string, req local.NuevoLocalRequest) (*local.Local, error) {
	var l local.Local
	err := r.DB.QueryRow(`
		INSERT INTO locales (tenant_id, nombre, direccion, distrito, provincia, departamento,
			telefono, correo, acepta_reservas, acepta_delivery, radio_delivery_km)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id, tenant_id, nombre, direccion, distrito, provincia, departamento,
			telefono, correo, latitud, longitud, es_principal,
			horario_apertura, horario_cierre, acepta_reservas, acepta_delivery,
			radio_delivery_km, activo, deleted_at, created_at, updated_at
	`,
		tenantID, req.Nombre, req.Direccion, req.Distrito, req.Provincia, req.Departamento,
		req.Telefono, req.Correo, req.AceptaReservas, req.AceptaDelivery, req.RadioDeliveryKM,
	).Scan(
		&l.ID, &l.TenantID, &l.Nombre, &l.Direccion, &l.Distrito,
		&l.Provincia, &l.Departamento, &l.Telefono, &l.Correo,
		&l.Latitud, &l.Longitud, &l.EsPrincipal,
		&l.HorarioApertura, &l.HorarioCierre,
		&l.AceptaReservas, &l.AceptaDelivery, &l.RadioDeliveryKM,
		&l.Activo, &l.DeletedAt, &l.CreatedAt, &l.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *LocalRepo) ContarLocales(tenantID string) (int, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM locales WHERE tenant_id = $1 AND deleted_at IS NULL",
		tenantID,
	).Scan(&count)
	return count, err
}

func (r *LocalRepo) EliminarLocal(tenantID string, id int) error {
	_, err := r.DB.Exec(
		"UPDATE locales SET deleted_at = NOW(), activo = false, updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	)
	return err
}

func (r *LocalRepo) ActualizarLocal(tenantID string, id int, req local.ActualizarLocalRequest) error {
	sets := []string{}
	args := []interface{}{}
	argPos := 1

	if req.Nombre != "" {
		sets = append(sets, fmt.Sprintf("nombre = $%d", argPos))
		args = append(args, req.Nombre)
		argPos++
	}
	if req.Direccion != "" {
		sets = append(sets, fmt.Sprintf("direccion = $%d", argPos))
		args = append(args, req.Direccion)
		argPos++
	}
	if req.Distrito != "" {
		sets = append(sets, fmt.Sprintf("distrito = $%d", argPos))
		args = append(args, req.Distrito)
		argPos++
	}
	if req.Provincia != "" {
		sets = append(sets, fmt.Sprintf("provincia = $%d", argPos))
		args = append(args, req.Provincia)
		argPos++
	}
	if req.Departamento != "" {
		sets = append(sets, fmt.Sprintf("departamento = $%d", argPos))
		args = append(args, req.Departamento)
		argPos++
	}
	if req.Telefono != "" {
		sets = append(sets, fmt.Sprintf("telefono = $%d", argPos))
		args = append(args, req.Telefono)
		argPos++
	}
	if req.Correo != "" {
		sets = append(sets, fmt.Sprintf("correo = $%d", argPos))
		args = append(args, req.Correo)
		argPos++
	}
	if req.Latitud != nil {
		sets = append(sets, fmt.Sprintf("latitud = $%d", argPos))
		args = append(args, *req.Latitud)
		argPos++
	}
	if req.Longitud != nil {
		sets = append(sets, fmt.Sprintf("longitud = $%d", argPos))
		args = append(args, *req.Longitud)
		argPos++
	}
	if req.NumeroPisos != nil {
		sets = append(sets, fmt.Sprintf("numero_pisos = $%d", argPos))
		args = append(args, *req.NumeroPisos)
		argPos++
	}
	if req.HorarioApertura != "" {
		sets = append(sets, fmt.Sprintf("horario_apertura = $%d", argPos))
		args = append(args, req.HorarioApertura)
		argPos++
	}
	if req.HorarioCierre != "" {
		sets = append(sets, fmt.Sprintf("horario_cierre = $%d", argPos))
		args = append(args, req.HorarioCierre)
		argPos++
	}
	if req.AceptaReservas != nil {
		sets = append(sets, fmt.Sprintf("acepta_reservas = $%d", argPos))
		args = append(args, *req.AceptaReservas)
		argPos++
	}
	if req.AceptaDelivery != nil {
		sets = append(sets, fmt.Sprintf("acepta_delivery = $%d", argPos))
		args = append(args, *req.AceptaDelivery)
		argPos++
	}
	if req.RadioDeliveryKM != nil {
		sets = append(sets, fmt.Sprintf("radio_delivery_km = $%d", argPos))
		args = append(args, *req.RadioDeliveryKM)
		argPos++
	}
	if req.Activo != nil {
		sets = append(sets, fmt.Sprintf("activo = $%d", argPos))
		args = append(args, *req.Activo)
		argPos++
	}

	if len(sets) == 0 {
		return nil
	}

	sets = append(sets, "updated_at = NOW()")
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE locales SET %s WHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		strings.Join(sets, ", "), argPos, argPos+1)
	_, err := r.DB.Exec(query, args...)
	return err
}

// ============ ZONAS ============

func (r *LocalRepo) ListarZonas(tenantID string, localID int) ([]local.Zona, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombre, descripcion, color, orden, activo, deleted_at, created_at
		FROM zonas WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL ORDER BY orden
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var zonas []local.Zona
	for rows.Next() {
		var z local.Zona
		err := rows.Scan(&z.ID, &z.TenantID, &z.LocalID, &z.Nombre, &z.Descripcion,
			&z.Color, &z.Orden, &z.Activo, &z.DeletedAt, &z.CreatedAt)
		if err != nil {
			return nil, err
		}
		zonas = append(zonas, z)
	}
	return zonas, nil
}

func (r *LocalRepo) CrearZona(tenantID string, req local.NuevaZonaRequest) (*local.Zona, error) {
	var z local.Zona
	err := r.DB.QueryRow(`
		INSERT INTO zonas (tenant_id, local_id, nombre, descripcion, piso, color, orden)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, tenant_id, local_id, nombre, descripcion, piso, color, orden, activo, deleted_at, created_at
	`, tenantID, req.LocalID, req.Nombre, req.Descripcion, req.Piso, req.Color, req.Orden,
	).Scan(&z.ID, &z.TenantID, &z.LocalID, &z.Nombre, &z.Descripcion,
		&z.Piso, &z.Color, &z.Orden, &z.Activo, &z.DeletedAt, &z.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &z, nil
}

func (r *LocalRepo) ActualizarZona(tenantID string, id int, req local.ActualizarZonaRequest) error {
	sets := []string{}
	args := []interface{}{}
	argPos := 1

	if req.Nombre != "" {
		sets = append(sets, fmt.Sprintf("nombre = $%d", argPos))
		args = append(args, req.Nombre)
		argPos++
	}
	if req.Descripcion != "" {
		sets = append(sets, fmt.Sprintf("descripcion = $%d", argPos))
		args = append(args, req.Descripcion)
		argPos++
	}
	if req.Piso != nil {
		sets = append(sets, fmt.Sprintf("piso = $%d", argPos))
		args = append(args, *req.Piso)
		argPos++
	}
	if req.Color != "" {
		sets = append(sets, fmt.Sprintf("color = $%d", argPos))
		args = append(args, req.Color)
		argPos++
	}
	if req.Orden != nil {
		sets = append(sets, fmt.Sprintf("orden = $%d", argPos))
		args = append(args, *req.Orden)
		argPos++
	}
	if req.Activo != nil {
		sets = append(sets, fmt.Sprintf("activo = $%d", argPos))
		args = append(args, *req.Activo)
		argPos++
	}
	if len(sets) == 0 {
		return nil
	}
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE zonas SET %s WHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		strings.Join(sets, ", "), argPos, argPos+1)
	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *LocalRepo) EliminarZona(tenantID string, id int) error {
	_, err := r.DB.Exec(
		"UPDATE zonas SET deleted_at = NOW(), activo = false WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	)
	return err
}

// ============ MESAS ============

func (r *LocalRepo) ListarMesas(tenantID string, localID int) ([]local.Mesa, error) {
	rows, err := r.DB.Query(`
		SELECT m.id, m.tenant_id, m.local_id, m.zona_id, m.numero, m.capacidad,
			   m.estado, m.forma, m.posicion_x, m.posicion_y, m.qr_codigo, m.qr_url,
			   m.activo, m.deleted_at, m.created_at, m.updated_at,
			   COALESCE(z.nombre, '') as nombre_zona,
			   COALESCE(z.piso, 1) as piso,
			   COALESCE(l.nombre, '') as nombre_local
		FROM mesas m
		LEFT JOIN zonas z ON z.id = m.zona_id AND z.tenant_id = m.tenant_id
		LEFT JOIN locales l ON l.id = m.local_id AND l.tenant_id = m.tenant_id
		WHERE m.tenant_id = $1 AND m.local_id = $2 AND m.deleted_at IS NULL
		ORDER BY COALESCE(z.piso, 1), m.numero
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mesas []local.Mesa
	for rows.Next() {
		var m local.Mesa
		err := rows.Scan(
			&m.ID, &m.TenantID, &m.LocalID, &m.ZonaID, &m.Numero, &m.Capacidad,
			&m.Estado, &m.Forma, &m.PosicionX, &m.PosicionY, &m.QRCodigo, &m.QRURL,
			&m.Activo, &m.DeletedAt, &m.CreatedAt, &m.UpdatedAt,
			&m.NombreZona, &m.Piso, &m.NombreLocal,
		)
		if err != nil {
			return nil, err
		}
		mesas = append(mesas, m)
	}
	return mesas, nil
}

func (r *LocalRepo) ObtenerMesa(tenantID string, id int) (*local.Mesa, error) {
	var m local.Mesa
	err := r.DB.QueryRow(`
		SELECT m.id, m.tenant_id, m.local_id, m.zona_id, m.numero, m.capacidad,
			   m.estado, m.forma, m.posicion_x, m.posicion_y, m.qr_codigo, m.qr_url,
			   m.activo, m.deleted_at, m.created_at, m.updated_at,
			   COALESCE(z.nombre, '') as nombre_zona,
			   COALESCE(z.piso, 1) as piso,
			   COALESCE(l.nombre, '') as nombre_local
		FROM mesas m
		LEFT JOIN zonas z ON z.id = m.zona_id AND z.tenant_id = m.tenant_id
		LEFT JOIN locales l ON l.id = m.local_id AND l.tenant_id = m.tenant_id
		WHERE m.id = $1 AND m.tenant_id = $2 AND m.deleted_at IS NULL
	`, id, tenantID).Scan(
		&m.ID, &m.TenantID, &m.LocalID, &m.ZonaID, &m.Numero, &m.Capacidad,
		&m.Estado, &m.Forma, &m.PosicionX, &m.PosicionY, &m.QRCodigo, &m.QRURL,
		&m.Activo, &m.DeletedAt, &m.CreatedAt, &m.UpdatedAt,
		&m.NombreZona, &m.Piso, &m.NombreLocal,
	)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *LocalRepo) CrearMesa(tenantID string, req local.NuevaMesaRequest) (*local.Mesa, error) {
	var m local.Mesa
	err := r.DB.QueryRow(`
		INSERT INTO mesas (tenant_id, local_id, zona_id, numero, capacidad, forma, posicion_x, posicion_y)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, tenant_id, local_id, zona_id, numero, capacidad, estado, forma,
			posicion_x, posicion_y, qr_codigo, qr_url, activo, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, req.ZonaID, req.Numero, req.Capacidad, req.Forma, req.PosicionX, req.PosicionY,
	).Scan(
		&m.ID, &m.TenantID, &m.LocalID, &m.ZonaID, &m.Numero, &m.Capacidad,
		&m.Estado, &m.Forma, &m.PosicionX, &m.PosicionY, &m.QRCodigo, &m.QRURL,
		&m.Activo, &m.DeletedAt, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *LocalRepo) CambiarEstadoMesa(tenantID string, id int, estado string) error {
	_, err := r.DB.Exec(
		"UPDATE mesas SET estado = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL",
		estado, id, tenantID,
	)
	return err
}

func (r *LocalRepo) ActualizarMesa(tenantID string, id int, req local.ActualizarMesaRequest) error {
	sets := []string{}
	args := []interface{}{}
	argPos := 1

	if req.ZonaID != nil {
		sets = append(sets, fmt.Sprintf("zona_id = $%d", argPos))
		args = append(args, *req.ZonaID)
		argPos++
	}
	if req.Numero != "" {
		sets = append(sets, fmt.Sprintf("numero = $%d", argPos))
		args = append(args, req.Numero)
		argPos++
	}
	if req.Capacidad != nil {
		sets = append(sets, fmt.Sprintf("capacidad = $%d", argPos))
		args = append(args, *req.Capacidad)
		argPos++
	}
	if req.Estado != "" {
		sets = append(sets, fmt.Sprintf("estado = $%d", argPos))
		args = append(args, req.Estado)
		argPos++
	}
	if req.Forma != "" {
		sets = append(sets, fmt.Sprintf("forma = $%d", argPos))
		args = append(args, req.Forma)
		argPos++
	}
	if req.PosicionX != nil {
		sets = append(sets, fmt.Sprintf("posicion_x = $%d", argPos))
		args = append(args, *req.PosicionX)
		argPos++
	}
	if req.PosicionY != nil {
		sets = append(sets, fmt.Sprintf("posicion_y = $%d", argPos))
		args = append(args, *req.PosicionY)
		argPos++
	}
	if req.Activo != nil {
		sets = append(sets, fmt.Sprintf("activo = $%d", argPos))
		args = append(args, *req.Activo)
		argPos++
	}
	if len(sets) == 0 {
		return nil
	}
	sets = append(sets, "updated_at = NOW()")
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE mesas SET %s WHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		strings.Join(sets, ", "), argPos, argPos+1)
	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *LocalRepo) EliminarMesa(tenantID string, id int) error {
	_, err := r.DB.Exec(
		"UPDATE mesas SET deleted_at = NOW(), activo = false, updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	)
	return err
}

// ============ CONFIGURACION ============

func (r *LocalRepo) ObtenerConfiguracion(tenantID string, localID int) (*local.ConfiguracionRestaurante, error) {
	var c local.ConfiguracionRestaurante
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, moneda, simbolo_moneda, zona_horaria, formato_fecha,
			   igv_porcentaje, precio_incluye_igv, propina_sugerida, propina_porcentaje,
			   cobrar_cubierto, precio_cubierto, mensaje_ticket, mensaje_wifi,
			   correo_notificaciones, enviar_email_reserva, enviar_email_orden,
			   tiempo_preparacion_default_min, minutos_alerta_orden_demorada,
			   permite_ordenar_sin_mesero, permitir_reservas, tiempo_max_reserva,
			   permitir_delivery, updated_at
		FROM configuracion_restaurante
		WHERE tenant_id = $1 AND local_id = $2
	`, tenantID, localID).Scan(
		&c.ID, &c.TenantID, &c.LocalID, &c.Moneda, &c.SimboloMoneda, &c.ZonaHoraria, &c.FormatoFecha,
		&c.IGV, &c.IncluyeIGV, &c.PropinaSugerida, &c.PorcentajePropina,
		&c.CobrarCubierto, &c.PrecioCubierto, &c.MensajeTicket, &c.MensajeWifi,
		&c.CorreoNotificaciones, &c.EnviarEmailReserva, &c.EnviarEmailOrden,
		&c.TiempoPreparacionBase, &c.AlertaOrdenDemorada,
		&c.PermiteOrdenarSinMesero, &c.PermitirReservas, &c.TiempoMaxReserva,
		&c.PermitirDelivery, &c.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *LocalRepo) CrearConfiguracionDefault(tenantID string, localID int) error {
	_, err := r.DB.Exec(`
		INSERT INTO configuracion_restaurante (tenant_id, local_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, tenantID, localID)
	return err
}

func (r *LocalRepo) ActualizarConfiguracion(tenantID string, localID int, req local.ActualizarConfiguracionRequest) error {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1

	if req.Moneda != "" {
		setClauses += fmt.Sprintf("moneda = $%d, ", argIdx)
		args = append(args, req.Moneda)
		argIdx++
	}
	if req.SimboloMoneda != "" {
		setClauses += fmt.Sprintf("simbolo_moneda = $%d, ", argIdx)
		args = append(args, req.SimboloMoneda)
		argIdx++
	}
	if req.ZonaHoraria != "" {
		setClauses += fmt.Sprintf("zona_horaria = $%d, ", argIdx)
		args = append(args, req.ZonaHoraria)
		argIdx++
	}
	if req.FormatoFecha != "" {
		setClauses += fmt.Sprintf("formato_fecha = $%d, ", argIdx)
		args = append(args, req.FormatoFecha)
		argIdx++
	}
	if req.IGV != nil {
		setClauses += fmt.Sprintf("igv_porcentaje = $%d, ", argIdx)
		args = append(args, *req.IGV)
		argIdx++
	}
	if req.IncluyeIGV != nil {
		setClauses += fmt.Sprintf("precio_incluye_igv = $%d, ", argIdx)
		args = append(args, *req.IncluyeIGV)
		argIdx++
	}
	if req.PropinaSugerida != nil {
		setClauses += fmt.Sprintf("propina_sugerida = $%d, ", argIdx)
		args = append(args, *req.PropinaSugerida)
		argIdx++
	}
	if req.PorcentajePropina != nil {
		setClauses += fmt.Sprintf("propina_porcentaje = $%d, ", argIdx)
		args = append(args, *req.PorcentajePropina)
		argIdx++
	}
	if req.CobrarCubierto != nil {
		setClauses += fmt.Sprintf("cobrar_cubierto = $%d, ", argIdx)
		args = append(args, *req.CobrarCubierto)
		argIdx++
	}
	if req.PrecioCubierto != nil {
		setClauses += fmt.Sprintf("precio_cubierto = $%d, ", argIdx)
		args = append(args, *req.PrecioCubierto)
		argIdx++
	}
	if req.MensajeTicket != "" {
		setClauses += fmt.Sprintf("mensaje_ticket = $%d, ", argIdx)
		args = append(args, req.MensajeTicket)
		argIdx++
	}
	if req.MensajeWifi != "" {
		setClauses += fmt.Sprintf("mensaje_wifi = $%d, ", argIdx)
		args = append(args, req.MensajeWifi)
		argIdx++
	}
	if req.CorreoNotificaciones != "" {
		setClauses += fmt.Sprintf("correo_notificaciones = $%d, ", argIdx)
		args = append(args, req.CorreoNotificaciones)
		argIdx++
	}
	if req.EnviarEmailReserva != nil {
		setClauses += fmt.Sprintf("enviar_email_reserva = $%d, ", argIdx)
		args = append(args, *req.EnviarEmailReserva)
		argIdx++
	}
	if req.EnviarEmailOrden != nil {
		setClauses += fmt.Sprintf("enviar_email_orden = $%d, ", argIdx)
		args = append(args, *req.EnviarEmailOrden)
		argIdx++
	}
	if req.TiempoPreparacionBase != nil {
		setClauses += fmt.Sprintf("tiempo_preparacion_default_min = $%d, ", argIdx)
		args = append(args, *req.TiempoPreparacionBase)
		argIdx++
	}
	if req.AlertaOrdenDemorada != nil {
		setClauses += fmt.Sprintf("minutos_alerta_orden_demorada = $%d, ", argIdx)
		args = append(args, *req.AlertaOrdenDemorada)
		argIdx++
	}
	if req.PermiteOrdenarSinMesero != nil {
		setClauses += fmt.Sprintf("permite_ordenar_sin_mesero = $%d, ", argIdx)
		args = append(args, *req.PermiteOrdenarSinMesero)
		argIdx++
	}
	if req.PermitirReservas != nil {
		setClauses += fmt.Sprintf("permitir_reservas = $%d, ", argIdx)
		args = append(args, *req.PermitirReservas)
		argIdx++
	}
	if req.TiempoMaxReserva != nil {
		setClauses += fmt.Sprintf("tiempo_max_reserva = $%d, ", argIdx)
		args = append(args, *req.TiempoMaxReserva)
		argIdx++
	}
	if req.PermitirDelivery != nil {
		setClauses += fmt.Sprintf("permitir_delivery = $%d, ", argIdx)
		args = append(args, *req.PermitirDelivery)
		argIdx++
	}

	if len(args) == 0 {
		return nil
	}

	setClauses += "updated_at = NOW() "
	args = append(args, tenantID, localID)
	query := fmt.Sprintf("UPDATE configuracion_restaurante SET %s WHERE tenant_id = $%d AND local_id = $%d",
		setClauses, argIdx, argIdx+1)

	_, err := r.DB.Exec(query, args...)
	return err
}
