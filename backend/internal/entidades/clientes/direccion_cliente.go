package clientes

import "time"

// ==========================================
// Entidad: DireccionCliente
// RestauFlow SaaS Multi-Tenant
// ==========================================

// DireccionCliente dirección de entrega de un cliente
type DireccionCliente struct {
	ID          int64     `json:"id_direccion"         db:"id"`
	TenantID    string    `json:"tenant_id"            db:"tenant_id"`
	ClienteID   int64     `json:"cliente_id"           db:"cliente_id"`
	Etiqueta    string    `json:"etiqueta"             db:"etiqueta"`
	Direccion   string    `json:"direccion"            db:"direccion"`
	Referencia  string    `json:"referencia,omitempty" db:"referencia"`
	Distrito    string    `json:"distrito"             db:"distrito"`
	Latitud     *float64  `json:"latitud,omitempty"    db:"latitud"`
	Longitud    *float64  `json:"longitud,omitempty"   db:"longitud"`
	EsPrincipal bool      `json:"es_principal"         db:"es_principal"`
	Activo      bool      `json:"activo"               db:"activo"`
	CreatedAt   time.Time `json:"created_at"           db:"created_at"`
}

// NuevaDireccionClienteRequest request para crear dirección
type NuevaDireccionClienteRequest struct {
	ClienteID   int64    `json:"cliente_id"   validate:"required"`
	Etiqueta    string   `json:"etiqueta"     validate:"required,min=2,max=50"`
	Direccion   string   `json:"direccion"    validate:"required,min=5,max=300"`
	Referencia  string   `json:"referencia"`
	Distrito    string   `json:"distrito"     validate:"required"`
	Latitud     *float64 `json:"latitud"`
	Longitud    *float64 `json:"longitud"`
	EsPrincipal bool     `json:"es_principal"`
}

// ActualizarDireccionClienteRequest request para actualizar dirección
type ActualizarDireccionClienteRequest struct {
	Etiqueta    string   `json:"etiqueta"`
	Direccion   string   `json:"direccion"`
	Referencia  string   `json:"referencia"`
	Distrito    string   `json:"distrito"`
	Latitud     *float64 `json:"latitud"`
	Longitud    *float64 `json:"longitud"`
	EsPrincipal *bool    `json:"es_principal"`
	Activo      *bool    `json:"activo"`
}
