package menu

import "time"

// ==========================================
// Entidad: VarianteProducto
// RestauFlow SaaS Multi-Tenant
// ==========================================

// VarianteProducto variante de un producto (tamaño, porción, etc.)
type VarianteProducto struct {
	ID              int64     `json:"id_variante"          db:"id"`
	TenantID        string    `json:"tenant_id"            db:"tenant_id"`
	ProductoMenuID  int64     `json:"producto_menu_id"     db:"producto_menu_id"`
	Nombre          string    `json:"nombre"               db:"nombre"`
	PrecioAdicional float64   `json:"precio_adicional"     db:"precio_adicional"`
	Disponible      bool      `json:"disponible"           db:"disponible"`
	Orden           int       `json:"orden"                db:"orden"`
	Activo          bool      `json:"activo"               db:"activo"`
	CreatedAt       time.Time `json:"created_at"           db:"created_at"`
}

// NuevaVarianteRequest request para crear variante
type NuevaVarianteRequest struct {
	ProductoMenuID  int64   `json:"producto_menu_id"  validate:"required"`
	Nombre          string  `json:"nombre"            validate:"required,min=1,max=100"`
	PrecioAdicional float64 `json:"precio_adicional"  validate:"gte=0"`
	Orden           int     `json:"orden"`
}

// ActualizarVarianteRequest request para actualizar variante
type ActualizarVarianteRequest struct {
	Nombre          string   `json:"nombre"`
	PrecioAdicional *float64 `json:"precio_adicional"`
	Disponible      *bool    `json:"disponible"`
	Orden           *int     `json:"orden"`
	Activo          *bool    `json:"activo"`
}
