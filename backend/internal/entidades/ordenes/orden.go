package ordenes

import "time"

// ==========================================
// Entidad: Orden
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Orden orden/pedido del restaurante
type Orden struct {
	ID              int64      `json:"id_orden"             db:"id"`
	TenantID        string     `json:"tenant_id"            db:"tenant_id"`
	LocalID         int        `json:"local_id"             db:"local_id"`
	NumeroOrden     string     `json:"numero_orden"         db:"numero_orden"`
	TipoOrden       string     `json:"tipo_orden"           db:"tipo_orden"`
	Estado          string     `json:"estado"               db:"estado"`
	MesaID          *int       `json:"mesa_id,omitempty"    db:"mesa_id"`
	ClienteID       *int64     `json:"cliente_id,omitempty" db:"cliente_id"`
	MeseroID        *int64     `json:"mesero_id,omitempty"  db:"mesero_id"`
	NumeroPersonas  int        `json:"numero_personas"      db:"numero_personas"`
	Subtotal        float64    `json:"subtotal"             db:"subtotal"`
	Descuento       float64    `json:"descuento"            db:"descuento"`
	IGV             float64    `json:"igv"                  db:"igv"`
	Total           float64    `json:"total"                db:"total"`
	PromocionID     *int64     `json:"promocion_id,omitempty" db:"promocion_id"`
	CuponID         *int64     `json:"cupon_id,omitempty"     db:"cupon_id"`
	TurnoCajaID     *int64     `json:"turno_caja_id,omitempty" db:"turno_caja_id"`
	Notas           string     `json:"notas,omitempty"      db:"notas"`
	TiempoEstimado  int        `json:"tiempo_estimado"      db:"tiempo_estimado"`
	FechaCompletada *time.Time `json:"fecha_completada,omitempty" db:"fecha_completada"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt       time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	NumeroMesa    string                 `json:"numero_mesa,omitempty"      db:"-"`
	NombreCliente string                 `json:"nombre_cliente,omitempty"   db:"-"`
	NombreMesero  string                 `json:"nombre_mesero,omitempty"    db:"-"`
	Items         []ItemOrden            `json:"items,omitempty"            db:"-"`
	Historial     []HistorialEstadoOrden `json:"historial,omitempty"    db:"-"`
	TicketsCocina []TicketCocina         `json:"tickets_cocina,omitempty"   db:"-"`
}

// NuevaOrdenRequest request para crear orden
type NuevaOrdenRequest struct {
	LocalID        int                 `json:"local_id"        validate:"required"`
	TipoOrden      string              `json:"tipo_orden"      validate:"required"`
	MesaID         *int                `json:"mesa_id"`
	ClienteID      *int64              `json:"cliente_id"`
	NumeroPersonas int                 `json:"numero_personas"`
	PromocionID    *int64              `json:"promocion_id"`
	CuponID        *int64              `json:"cupon_id"`
	Notas          string              `json:"notas"`
	Items          []NuevoItemOrdenReq `json:"items"           validate:"required,min=1"`
}

// ActualizarOrdenRequest request para actualizar orden
type ActualizarOrdenRequest struct {
	MesaID         *int   `json:"mesa_id"`
	ClienteID      *int64 `json:"cliente_id"`
	NumeroPersonas *int   `json:"numero_personas"`
	Notas          string `json:"notas"`
}

// CambiarEstadoOrdenRequest request para cambiar estado
type CambiarEstadoOrdenRequest struct {
	Estado string `json:"estado" validate:"required"`
	Motivo string `json:"motivo"`
}

// FiltrosOrden filtros para listar órdenes
type FiltrosOrden struct {
	LocalID    int    `json:"local_id"`
	Estado     string `json:"estado"`
	TipoOrden  string `json:"tipo_orden"`
	MesaID     *int   `json:"mesa_id"`
	MeseroID   *int64 `json:"mesero_id"`
	FechaDesde string `json:"fecha_desde"`
	FechaHasta string `json:"fecha_hasta"`
	Pagina     int    `json:"pagina"`
	PorPagina  int    `json:"por_pagina"`
}
