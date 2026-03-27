package repositorios

import (
	"database/sql"
	"fmt"

	"github.com/restauflow/backend/internal/entidades/reservas"
)

// ==========================================
// Repositorio: Reservas + Historial
// ==========================================

type ReservasRepo struct {
	DB *sql.DB
}

func NuevoReservasRepo(db *sql.DB) *ReservasRepo {
	return &ReservasRepo{DB: db}
}

func (r *ReservasRepo) ListarReservas(tenantID string, filtros reservas.FiltrosReserva) ([]reservas.Reserva, int, error) {
	query := `
		SELECT r.id, r.tenant_id, r.local_id, r.cliente_id, r.mesa_id,
			   r.codigo_confirmacion, r.nombre_contacto, r.telefono_contacto, r.correo_contacto,
			   r.fecha_reserva, r.hora_inicio, r.hora_fin, r.numero_personas,
			   r.estado, r.notas, r.motivo_cancelacion, r.deleted_at, r.created_at, r.updated_at,
			   COALESCE(c.nombres || ' ' || c.apellidos, '') as nombre_cliente,
			   COALESCE(m.numero, '') as numero_mesa,
			   COALESCE(z.nombre, '') as nombre_zona
		FROM reservas r
		LEFT JOIN clientes c ON c.id = r.cliente_id AND c.tenant_id = r.tenant_id
		LEFT JOIN mesas m ON m.id = r.mesa_id AND m.tenant_id = r.tenant_id
		LEFT JOIN zonas z ON z.id = m.zona_id AND z.tenant_id = m.tenant_id
		WHERE r.tenant_id = $1 AND r.local_id = $2 AND r.deleted_at IS NULL`
	countQuery := "SELECT COUNT(*) FROM reservas r WHERE r.tenant_id = $1 AND r.local_id = $2 AND r.deleted_at IS NULL"

	args := []interface{}{tenantID, filtros.LocalID}
	countArgs := []interface{}{tenantID, filtros.LocalID}
	argIdx := 3

	if filtros.Estado != "" {
		cond := fmt.Sprintf(" AND r.estado = $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.Estado)
		countArgs = append(countArgs, filtros.Estado)
		argIdx++
	}
	if filtros.Fecha != "" {
		cond := fmt.Sprintf(" AND r.fecha_reserva::date = $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.Fecha)
		countArgs = append(countArgs, filtros.Fecha)
		argIdx++
	}
	if filtros.FechaDesde != "" {
		cond := fmt.Sprintf(" AND r.fecha_reserva >= $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.FechaDesde)
		countArgs = append(countArgs, filtros.FechaDesde)
		argIdx++
	}
	if filtros.FechaHasta != "" {
		cond := fmt.Sprintf(" AND r.fecha_reserva <= $%d", argIdx)
		query += cond
		countQuery += cond
		args = append(args, filtros.FechaHasta)
		countArgs = append(countArgs, filtros.FechaHasta)
		argIdx++
	}

	var total int
	r.DB.QueryRow(countQuery, countArgs...).Scan(&total)

	query += " ORDER BY r.fecha_reserva, r.hora_inicio"
	offset := (filtros.Pagina - 1) * filtros.PorPagina
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, filtros.PorPagina, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var lista []reservas.Reserva
	for rows.Next() {
		var rv reservas.Reserva
		rows.Scan(&rv.ID, &rv.TenantID, &rv.LocalID, &rv.ClienteID, &rv.MesaID,
			&rv.CodigoConfirmacion, &rv.NombreContacto, &rv.TelefonoContacto, &rv.CorreoContacto,
			&rv.FechaReserva, &rv.HoraInicio, &rv.HoraFin, &rv.NumeroPersonas,
			&rv.Estado, &rv.Notas, &rv.MotivoCancel, &rv.DeletedAt, &rv.CreatedAt, &rv.UpdatedAt,
			&rv.NombreCliente, &rv.NumeroMesa, &rv.NombreZona)
		lista = append(lista, rv)
	}
	return lista, total, nil
}

func (r *ReservasRepo) ObtenerReserva(tenantID string, id int64) (*reservas.Reserva, error) {
	var rv reservas.Reserva
	err := r.DB.QueryRow(`
		SELECT r.id, r.tenant_id, r.local_id, r.cliente_id, r.mesa_id,
			   r.codigo_confirmacion, r.nombre_contacto, r.telefono_contacto, r.correo_contacto,
			   r.fecha_reserva, r.hora_inicio, r.hora_fin, r.numero_personas,
			   r.estado, r.notas, r.motivo_cancelacion, r.deleted_at, r.created_at, r.updated_at,
			   COALESCE(c.nombres || ' ' || c.apellidos, '') as nombre_cliente,
			   COALESCE(m.numero, '') as numero_mesa,
			   COALESCE(z.nombre, '') as nombre_zona
		FROM reservas r
		LEFT JOIN clientes c ON c.id = r.cliente_id AND c.tenant_id = r.tenant_id
		LEFT JOIN mesas m ON m.id = r.mesa_id AND m.tenant_id = r.tenant_id
		LEFT JOIN zonas z ON z.id = m.zona_id AND z.tenant_id = m.tenant_id
		WHERE r.id = $1 AND r.tenant_id = $2 AND r.deleted_at IS NULL
	`, id, tenantID).Scan(&rv.ID, &rv.TenantID, &rv.LocalID, &rv.ClienteID, &rv.MesaID,
		&rv.CodigoConfirmacion, &rv.NombreContacto, &rv.TelefonoContacto, &rv.CorreoContacto,
		&rv.FechaReserva, &rv.HoraInicio, &rv.HoraFin, &rv.NumeroPersonas,
		&rv.Estado, &rv.Notas, &rv.MotivoCancel, &rv.DeletedAt, &rv.CreatedAt, &rv.UpdatedAt,
		&rv.NombreCliente, &rv.NumeroMesa, &rv.NombreZona)
	if err != nil {
		return nil, err
	}

	// Cargar historial
	histRows, err := r.DB.Query(`
		SELECT id, tenant_id, reserva_id, estado_anterior, estado_nuevo, usuario_id, motivo, created_at
		FROM historial_estados_reserva WHERE reserva_id = $1 AND tenant_id = $2 ORDER BY created_at
	`, id, tenantID)
	if err == nil {
		defer histRows.Close()
		for histRows.Next() {
			var h reservas.HistorialEstadoReserva
			histRows.Scan(&h.ID, &h.TenantID, &h.ReservaID, &h.EstadoAnterior,
				&h.EstadoNuevo, &h.UsuarioID, &h.Motivo, &h.CreatedAt)
			rv.Historial = append(rv.Historial, h)
		}
	}
	return &rv, nil
}

func (r *ReservasRepo) CrearReserva(tenantID string, req reservas.NuevaReservaRequest) (*reservas.Reserva, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	codigo := fmt.Sprintf("RSV-%06d", 0) // Se genera en servicio con utils
	var rv reservas.Reserva
	err = tx.QueryRow(`
		INSERT INTO reservas (tenant_id, local_id, cliente_id, mesa_id, codigo_confirmacion,
			nombre_contacto, telefono_contacto, correo_contacto,
			fecha_reserva, hora_inicio, hora_fin, numero_personas, notas)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
		RETURNING id, tenant_id, local_id, cliente_id, mesa_id, codigo_confirmacion,
			nombre_contacto, telefono_contacto, correo_contacto,
			fecha_reserva, hora_inicio, hora_fin, numero_personas,
			estado, notas, motivo_cancelacion, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, req.ClienteID, req.MesaID, codigo,
		req.NombreContacto, req.TelefonoContacto, req.CorreoContacto,
		req.FechaReserva, req.HoraInicio, req.HoraFin, req.NumeroPersonas, req.Notas,
	).Scan(&rv.ID, &rv.TenantID, &rv.LocalID, &rv.ClienteID, &rv.MesaID,
		&rv.CodigoConfirmacion, &rv.NombreContacto, &rv.TelefonoContacto, &rv.CorreoContacto,
		&rv.FechaReserva, &rv.HoraInicio, &rv.HoraFin, &rv.NumeroPersonas,
		&rv.Estado, &rv.Notas, &rv.MotivoCancel, &rv.DeletedAt, &rv.CreatedAt, &rv.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Historial inicial
	tx.Exec(`
		INSERT INTO historial_estados_reserva (tenant_id, reserva_id, estado_anterior, estado_nuevo, motivo)
		VALUES ($1,$2,'','pendiente','Reserva creada')
	`, tenantID, rv.ID)

	return &rv, tx.Commit()
}

func (r *ReservasRepo) CambiarEstadoReserva(tenantID string, id int64, req reservas.CambiarEstadoReservaRequest, usuarioID *int64) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var estadoAnterior string
	err = tx.QueryRow("SELECT estado FROM reservas WHERE id = $1 AND tenant_id = $2", id, tenantID).Scan(&estadoAnterior)
	if err != nil {
		return err
	}

	updateQuery := "UPDATE reservas SET estado = $1, updated_at = NOW()"
	if req.Estado == "cancelada" && req.Motivo != "" {
		updateQuery += fmt.Sprintf(", motivo_cancelacion = '%s'", req.Motivo)
	}
	updateQuery += " WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL"
	_, err = tx.Exec(updateQuery, req.Estado, id, tenantID)
	if err != nil {
		return err
	}

	tx.Exec(`
		INSERT INTO historial_estados_reserva (tenant_id, reserva_id, estado_anterior, estado_nuevo, usuario_id, motivo)
		VALUES ($1,$2,$3,$4,$5,$6)
	`, tenantID, id, estadoAnterior, req.Estado, usuarioID, req.Motivo)

	return tx.Commit()
}

func (r *ReservasRepo) ConsultarDisponibilidad(tenantID string, req reservas.DisponibilidadMesaRequest) ([]int, error) {
	// Retorna IDs de mesas disponibles
	rows, err := r.DB.Query(`
		SELECT m.id FROM mesas m
		WHERE m.tenant_id = $1 AND m.local_id = $2 AND m.capacidad >= $3
			AND m.activo = true AND m.deleted_at IS NULL
			AND m.id NOT IN (
				SELECT r.mesa_id FROM reservas r
				WHERE r.tenant_id = $1 AND r.local_id = $2
					AND r.fecha_reserva::date = $4::date
					AND r.estado IN ('pendiente', 'confirmada')
					AND r.deleted_at IS NULL
					AND NOT (r.hora_fin <= $5 OR r.hora_inicio >= $6)
					AND r.mesa_id IS NOT NULL
			)
		ORDER BY m.capacidad, m.numero
	`, tenantID, req.LocalID, req.NumeroPersonas, req.FechaReserva, req.HoraInicio, req.HoraFin)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		ids = append(ids, id)
	}
	return ids, nil
}

func (r *ReservasRepo) ContarReservasHoy(tenantID string, localID int) (int, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM reservas
		WHERE tenant_id = $1 AND local_id = $2 AND fecha_reserva::date = CURRENT_DATE
			AND estado IN ('pendiente', 'confirmada') AND deleted_at IS NULL
	`, tenantID, localID).Scan(&count)
	return count, err
}
