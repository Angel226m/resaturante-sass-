package menu

import "time"

// ==========================================
// Entidad: CategoriaMenu
// RestauFlow SaaS Multi-Tenant
// ==========================================

// CategoriaMenu categoría de productos del menú
type CategoriaMenu struct {
	ID          int        `json:"id_categoria_menu"    db:"id"`
	TenantID    string     `json:"tenant_id"            db:"tenant_id"`
	LocalID     int        `json:"local_id"             db:"local_id"`
	Nombre      string     `json:"nombre"               db:"nombre"`
	Descripcion string     `json:"descripcion"          db:"descripcion"`
	Icono       string     `json:"icono,omitempty"       db:"icono"`
	Color       string     `json:"color,omitempty"       db:"color"`
	Orden       int        `json:"orden"                db:"orden"`
	Activo      bool       `json:"activo"               db:"activo"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt   time.Time  `json:"created_at"           db:"created_at"`
	// Campos virtuales
	CantidadProductos int `json:"cantidad_productos,omitempty" db:"-"`
}

// NuevaCategoriaMenuRequest request para crear categoría
type NuevaCategoriaMenuRequest struct {
	LocalID     int    `json:"local_id"     validate:"required"`
	Nombre      string `json:"nombre"       validate:"required,min=2,max=100"`
	Descripcion string `json:"descripcion"`
	Icono       string `json:"icono"`
	Color       string `json:"color"`
	Orden       int    `json:"orden"`
}

// ActualizarCategoriaMenuRequest request para actualizar categoría
type ActualizarCategoriaMenuRequest struct {
	Nombre      string `json:"nombre"`
	Descripcion string `json:"descripcion"`
	Icono       string `json:"icono"`
	Color       string `json:"color"`
	Orden       *int   `json:"orden"`
	Activo      *bool  `json:"activo"`
}
