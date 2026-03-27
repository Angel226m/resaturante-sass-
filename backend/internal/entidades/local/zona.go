package local

import "time"

// ==========================================
// Entidad: Zona (agrupación de mesas)
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Zona representa una zona/piso del local (Terraza, Interior, VIP, Bar, Piso 1, Piso 2)
type Zona struct {
	ID          int        `json:"id_zona"              db:"id"`
	TenantID    string     `json:"tenant_id"            db:"tenant_id"`
	LocalID     int        `json:"local_id"             db:"local_id"`
	Nombre      string     `json:"nombre"               db:"nombre"`
	Descripcion string     `json:"descripcion,omitempty" db:"descripcion"`
	Piso        int        `json:"piso"                 db:"piso"`
	Color       string     `json:"color,omitempty"      db:"color"`
	Orden       int        `json:"orden"                db:"orden"`
	Activo      bool       `json:"activo"               db:"activo"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt   time.Time  `json:"created_at"           db:"created_at"`
	// Campos virtuales
	TotalMesas int `json:"total_mesas,omitempty" db:"-"`
}

// NuevaZonaRequest request para crear zona
type NuevaZonaRequest struct {
	LocalID     int    `json:"local_id"     validate:"required"`
	Nombre      string `json:"nombre"       validate:"required,min=2,max=100"`
	Descripcion string `json:"descripcion"`
	Piso        int    `json:"piso"`
	Color       string `json:"color"`
	Orden       int    `json:"orden"`
}

// ActualizarZonaRequest request para actualizar zona
type ActualizarZonaRequest struct {
	Nombre      string `json:"nombre"`
	Descripcion string `json:"descripcion"`
	Piso        *int   `json:"piso"`
	Color       string `json:"color"`
	Orden       *int   `json:"orden"`
	Activo      *bool  `json:"activo"`
}
