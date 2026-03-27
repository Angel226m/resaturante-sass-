package caja

import "time"

// ==========================================
// Entidad: MetodoPago
// RestauFlow SaaS Multi-Tenant
// ==========================================

// MetodoPago método de pago disponible
type MetodoPago struct {
	ID           int        `json:"id_metodo_pago"       db:"id"`
	TenantID     string     `json:"tenant_id"            db:"tenant_id"`
	LocalID      int        `json:"local_id"             db:"local_id"`
	Nombre       string     `json:"nombre"               db:"nombre"`
	Tipo         string     `json:"tipo"                 db:"tipo"`
	ComisionPorc float64    `json:"comision_porcentaje"  db:"comision_porcentaje"`
	RequiereRef  bool       `json:"requiere_referencia"  db:"requiere_referencia"`
	Activo       bool       `json:"activo"               db:"activo"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt    time.Time  `json:"created_at"           db:"created_at"`
}

// NuevoMetodoPagoRequest request para crear método de pago
type NuevoMetodoPagoRequest struct {
	LocalID      int     `json:"local_id"            validate:"required"`
	Nombre       string  `json:"nombre"              validate:"required,min=2,max=100"`
	Tipo         string  `json:"tipo"                validate:"required"`
	ComisionPorc float64 `json:"comision_porcentaje" validate:"gte=0"`
	RequiereRef  bool    `json:"requiere_referencia"`
}

// ActualizarMetodoPagoRequest request para actualizar
type ActualizarMetodoPagoRequest struct {
	Nombre       string   `json:"nombre"`
	Tipo         string   `json:"tipo"`
	ComisionPorc *float64 `json:"comision_porcentaje"`
	RequiereRef  *bool    `json:"requiere_referencia"`
	Activo       *bool    `json:"activo"`
}
