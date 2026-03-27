package caja

import "time"

// ==========================================
// Entidad: TurnoCaja
// RestauFlow SaaS Multi-Tenant
// ==========================================

// TurnoCaja turno/sesión de caja
type TurnoCaja struct {
	ID              int64      `json:"id_turno_caja"        db:"id"`
	TenantID        string     `json:"tenant_id"            db:"tenant_id"`
	LocalID         int        `json:"local_id"             db:"local_id"`
	UsuarioID       int64      `json:"usuario_id"           db:"usuario_id"`
	MontoApertura   float64    `json:"monto_apertura"       db:"monto_apertura"`
	MontoCierre     *float64   `json:"monto_cierre,omitempty"     db:"monto_cierre"`
	MontoEsperado   *float64   `json:"monto_esperado,omitempty"   db:"monto_esperado"`
	Diferencia      *float64   `json:"diferencia,omitempty"       db:"diferencia"`
	TotalVentas     float64    `json:"total_ventas"         db:"total_ventas"`
	TotalEfectivo   float64    `json:"total_efectivo"       db:"total_efectivo"`
	TotalTarjeta    float64    `json:"total_tarjeta"        db:"total_tarjeta"`
	TotalOtros      float64    `json:"total_otros"          db:"total_otros"`
	CantidadOrdenes int        `json:"cantidad_ordenes"     db:"cantidad_ordenes"`
	Estado          string     `json:"estado"               db:"estado"`
	FechaApertura   time.Time  `json:"fecha_apertura"       db:"fecha_apertura"`
	FechaCierre     *time.Time `json:"fecha_cierre,omitempty"     db:"fecha_cierre"`
	Observaciones   string     `json:"observaciones,omitempty"    db:"observaciones"`
	CreatedAt       time.Time  `json:"created_at"           db:"created_at"`
	// Campos virtuales
	NombreUsuario string `json:"nombre_usuario,omitempty" db:"-"`
}

// AbrirTurnoCajaRequest request para abrir turno
type AbrirTurnoCajaRequest struct {
	LocalID       int     `json:"local_id"       validate:"required"`
	MontoApertura float64 `json:"monto_apertura" validate:"required,gte=0"`
}

// CerrarTurnoCajaRequest request para cerrar turno
type CerrarTurnoCajaRequest struct {
	MontoCierre   float64 `json:"monto_cierre"   validate:"required,gte=0"`
	Observaciones string  `json:"observaciones"`
}

// ResumenTurnoCaja resumen de un turno de caja
type ResumenTurnoCaja struct {
	TurnoCajaID     int64   `json:"turno_caja_id"`
	TotalVentas     float64 `json:"total_ventas"`
	TotalEfectivo   float64 `json:"total_efectivo"`
	TotalTarjeta    float64 `json:"total_tarjeta"`
	TotalOtros      float64 `json:"total_otros"`
	CantidadOrdenes int     `json:"cantidad_ordenes"`
	MontoEsperado   float64 `json:"monto_esperado"`
	Diferencia      float64 `json:"diferencia"`
}
