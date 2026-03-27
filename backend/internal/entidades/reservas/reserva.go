package reservas

import "time"

// ==========================================
// Entidad: Reserva + HistorialEstadoReserva
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Reserva reserva de mesa
type Reserva struct {
	ID                 int64      `json:"id_reserva"           db:"id"`
	TenantID           string     `json:"tenant_id"            db:"tenant_id"`
	LocalID            int        `json:"local_id"             db:"local_id"`
	ClienteID          *int64     `json:"cliente_id,omitempty" db:"cliente_id"`
	MesaID             *int       `json:"mesa_id,omitempty"    db:"mesa_id"`
	CodigoConfirmacion string     `json:"codigo_confirmacion"  db:"codigo_confirmacion"`
	NombreContacto     string     `json:"nombre_contacto"      db:"nombre_contacto"`
	TelefonoContacto   string     `json:"telefono_contacto"    db:"telefono_contacto"`
	CorreoContacto     string     `json:"correo_contacto,omitempty" db:"correo_contacto"`
	FechaReserva       time.Time  `json:"fecha_reserva"        db:"fecha_reserva"`
	HoraInicio         string     `json:"hora_inicio"          db:"hora_inicio"`
	HoraFin            string     `json:"hora_fin"             db:"hora_fin"`
	NumeroPersonas     int        `json:"numero_personas"      db:"numero_personas"`
	Estado             string     `json:"estado"               db:"estado"`
	Notas              string     `json:"notas,omitempty"      db:"notas"`
	MotivoCancel       string     `json:"motivo_cancelacion,omitempty" db:"motivo_cancelacion"`
	DeletedAt          *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt          time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	NombreCliente string                   `json:"nombre_cliente,omitempty" db:"-"`
	NumeroMesa    string                   `json:"numero_mesa,omitempty"    db:"-"`
	NombreZona    string                   `json:"nombre_zona,omitempty"    db:"-"`
	Historial     []HistorialEstadoReserva `json:"historial,omitempty" db:"-"`
}

// HistorialEstadoReserva historial de cambios de estado de reserva
type HistorialEstadoReserva struct {
	ID             int64     `json:"id"                   db:"id"`
	TenantID       string    `json:"tenant_id"            db:"tenant_id"`
	ReservaID      int64     `json:"reserva_id"           db:"reserva_id"`
	EstadoAnterior string    `json:"estado_anterior"      db:"estado_anterior"`
	EstadoNuevo    string    `json:"estado_nuevo"         db:"estado_nuevo"`
	UsuarioID      *int64    `json:"usuario_id,omitempty" db:"usuario_id"`
	Motivo         string    `json:"motivo,omitempty"     db:"motivo"`
	CreatedAt      time.Time `json:"created_at"           db:"created_at"`
}

// NuevaReservaRequest request para crear reserva
type NuevaReservaRequest struct {
	LocalID          int       `json:"local_id"          validate:"required"`
	ClienteID        *int64    `json:"cliente_id"`
	MesaID           *int      `json:"mesa_id"`
	NombreContacto   string    `json:"nombre_contacto"   validate:"required,min=2,max=200"`
	TelefonoContacto string    `json:"telefono_contacto" validate:"required"`
	CorreoContacto   string    `json:"correo_contacto"`
	FechaReserva     time.Time `json:"fecha_reserva"     validate:"required"`
	HoraInicio       string    `json:"hora_inicio"       validate:"required"`
	HoraFin          string    `json:"hora_fin"          validate:"required"`
	NumeroPersonas   int       `json:"numero_personas"   validate:"required,min=1"`
	Notas            string    `json:"notas"`
}

// ActualizarReservaRequest request para actualizar reserva
type ActualizarReservaRequest struct {
	MesaID           *int       `json:"mesa_id"`
	NombreContacto   string     `json:"nombre_contacto"`
	TelefonoContacto string     `json:"telefono_contacto"`
	CorreoContacto   string     `json:"correo_contacto"`
	FechaReserva     *time.Time `json:"fecha_reserva"`
	HoraInicio       string     `json:"hora_inicio"`
	HoraFin          string     `json:"hora_fin"`
	NumeroPersonas   *int       `json:"numero_personas"`
	Notas            string     `json:"notas"`
}

// CambiarEstadoReservaRequest request para cambiar estado
type CambiarEstadoReservaRequest struct {
	Estado string `json:"estado" validate:"required"`
	Motivo string `json:"motivo"`
}

// FiltrosReserva filtros para listar reservas
type FiltrosReserva struct {
	LocalID    int    `json:"local_id"`
	Estado     string `json:"estado"`
	Fecha      string `json:"fecha"`
	FechaDesde string `json:"fecha_desde"`
	FechaHasta string `json:"fecha_hasta"`
	Pagina     int    `json:"pagina"`
	PorPagina  int    `json:"por_pagina"`
}

// DisponibilidadMesaRequest request para consultar disponibilidad
type DisponibilidadMesaRequest struct {
	LocalID        int       `json:"local_id"        validate:"required"`
	FechaReserva   time.Time `json:"fecha_reserva"   validate:"required"`
	HoraInicio     string    `json:"hora_inicio"     validate:"required"`
	HoraFin        string    `json:"hora_fin"        validate:"required"`
	NumeroPersonas int       `json:"numero_personas" validate:"required,min=1"`
}
