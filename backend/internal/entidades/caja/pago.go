package caja

import "time"

// ==========================================
// Entidad: Pago + DetallePago
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Pago pago de una orden
type Pago struct {
	ID          int64      `json:"id_pago"              db:"id"`
	TenantID    string     `json:"tenant_id"            db:"tenant_id"`
	OrdenID     int64      `json:"orden_id"             db:"orden_id"`
	TurnoCajaID int64      `json:"turno_caja_id"        db:"turno_caja_id"`
	MontoTotal  float64    `json:"monto_total"          db:"monto_total"`
	MontoPagado float64    `json:"monto_pagado"         db:"monto_pagado"`
	Vuelto      float64    `json:"vuelto"               db:"vuelto"`
	Propina     float64    `json:"propina"              db:"propina"`
	Estado      string     `json:"estado"               db:"estado"`
	UsuarioID   int64      `json:"usuario_id"           db:"usuario_id"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt   time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	NumeroOrden   string        `json:"numero_orden,omitempty"   db:"-"`
	NombreUsuario string        `json:"nombre_usuario,omitempty" db:"-"`
	Detalle       []DetallePago `json:"detalle,omitempty"        db:"-"`
}

// DetallePago detalle de un pago (pago mixto)
type DetallePago struct {
	ID           int64   `json:"id_detalle_pago"      db:"id"`
	TenantID     string  `json:"tenant_id"            db:"tenant_id"`
	PagoID       int64   `json:"pago_id"              db:"pago_id"`
	MetodoPagoID int     `json:"metodo_pago_id"       db:"metodo_pago_id"`
	Monto        float64 `json:"monto"                db:"monto"`
	Referencia   string  `json:"referencia,omitempty"  db:"referencia"`
	// Campos virtuales
	NombreMetodo string `json:"nombre_metodo,omitempty" db:"-"`
}

// NuevoPagoRequest request para registrar pago
type NuevoPagoRequest struct {
	OrdenID int64                 `json:"orden_id"     validate:"required"`
	Propina float64               `json:"propina"      validate:"gte=0"`
	Detalle []NuevoDetallePagoReq `json:"detalle"     validate:"required,min=1"`
}

// NuevoDetallePagoReq detalle para crear pago
type NuevoDetallePagoReq struct {
	MetodoPagoID int     `json:"metodo_pago_id" validate:"required"`
	Monto        float64 `json:"monto"          validate:"required,gt=0"`
	Referencia   string  `json:"referencia"`
}

// AnularPagoRequest request para anular pago
type AnularPagoRequest struct {
	Motivo string `json:"motivo" validate:"required"`
}
