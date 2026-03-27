package menu

import "time"

// ==========================================
// Entidad: GrupoModificador + Modificador
// RestauFlow SaaS Multi-Tenant
// ==========================================

// GrupoModificador grupo de modificadores (extras, salsas, etc.)
type GrupoModificador struct {
	ID              int        `json:"id_grupo_modificador" db:"id"`
	TenantID        string     `json:"tenant_id"            db:"tenant_id"`
	LocalID         int        `json:"local_id"             db:"local_id"`
	Nombre          string     `json:"nombre"               db:"nombre"`
	TipoSeleccion   string     `json:"tipo_seleccion"       db:"tipo_seleccion"`
	MinimoSeleccion int        `json:"minimo_seleccion"     db:"minimo_seleccion"`
	MaximoSeleccion int        `json:"maximo_seleccion"     db:"maximo_seleccion"`
	EsObligatorio   bool       `json:"es_obligatorio"       db:"es_obligatorio"`
	Activo          bool       `json:"activo"               db:"activo"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt       time.Time  `json:"created_at"           db:"created_at"`
	// Campos virtuales
	Modificadores []Modificador `json:"modificadores,omitempty" db:"-"`
}

// Modificador opción individual dentro de un grupo
type Modificador struct {
	ID                 int64     `json:"id_modificador"           db:"id"`
	TenantID           string    `json:"tenant_id"                db:"tenant_id"`
	GrupoModificadorID int       `json:"grupo_modificador_id"     db:"grupo_modificador_id"`
	Nombre             string    `json:"nombre"                   db:"nombre"`
	PrecioAdicional    float64   `json:"precio_adicional"         db:"precio_adicional"`
	Disponible         bool      `json:"disponible"               db:"disponible"`
	Orden              int       `json:"orden"                    db:"orden"`
	Activo             bool      `json:"activo"                   db:"activo"`
	CreatedAt          time.Time `json:"created_at"               db:"created_at"`
}

// ProductoGrupoModificador relación producto-grupo
type ProductoGrupoModificador struct {
	ID                 int64  `json:"id"                     db:"id"`
	TenantID           string `json:"tenant_id"              db:"tenant_id"`
	ProductoMenuID     int64  `json:"producto_menu_id"       db:"producto_menu_id"`
	GrupoModificadorID int    `json:"grupo_modificador_id"   db:"grupo_modificador_id"`
}

// NuevoGrupoModificadorRequest request para crear grupo
type NuevoGrupoModificadorRequest struct {
	LocalID         int    `json:"local_id"         validate:"required"`
	Nombre          string `json:"nombre"           validate:"required,min=2,max=100"`
	TipoSeleccion   string `json:"tipo_seleccion"`
	MinimoSeleccion int    `json:"minimo_seleccion"`
	MaximoSeleccion int    `json:"maximo_seleccion"`
	EsObligatorio   bool   `json:"es_obligatorio"`
}

// ActualizarGrupoModificadorRequest request para actualizar grupo
type ActualizarGrupoModificadorRequest struct {
	Nombre          string `json:"nombre"`
	TipoSeleccion   string `json:"tipo_seleccion"`
	MinimoSeleccion *int   `json:"minimo_seleccion"`
	MaximoSeleccion *int   `json:"maximo_seleccion"`
	EsObligatorio   *bool  `json:"es_obligatorio"`
	Activo          *bool  `json:"activo"`
}

// NuevoModificadorRequest request para crear modificador
type NuevoModificadorRequest struct {
	GrupoModificadorID int     `json:"grupo_modificador_id" validate:"required"`
	Nombre             string  `json:"nombre"               validate:"required,min=1,max=100"`
	PrecioAdicional    float64 `json:"precio_adicional"     validate:"gte=0"`
	Orden              int     `json:"orden"`
}

// ActualizarModificadorRequest request para actualizar modificador
type ActualizarModificadorRequest struct {
	Nombre          string   `json:"nombre"`
	PrecioAdicional *float64 `json:"precio_adicional"`
	Disponible      *bool    `json:"disponible"`
	Orden           *int     `json:"orden"`
	Activo          *bool    `json:"activo"`
}

// AsignarGrupoModificadorRequest request para asignar grupo a producto
type AsignarGrupoModificadorRequest struct {
	ProductoMenuID     int64 `json:"producto_menu_id"     validate:"required"`
	GrupoModificadorID int   `json:"grupo_modificador_id" validate:"required"`
}
