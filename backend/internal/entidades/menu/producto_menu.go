package menu

import "time"

// ==========================================
// Entidad: ProductoMenu
// RestauFlow SaaS Multi-Tenant
// ==========================================

// ProductoMenu producto del menú del restaurante
type ProductoMenu struct {
	ID                int64      `json:"id_producto_menu"         db:"id"`
	TenantID          string     `json:"tenant_id"                db:"tenant_id"`
	LocalID           int        `json:"local_id"                 db:"local_id"`
	CategoriaMenuID   int        `json:"categoria_menu_id"        db:"categoria_menu_id"`
	Nombre            string     `json:"nombre"                   db:"nombre"`
	Descripcion       string     `json:"descripcion"              db:"descripcion"`
	PrecioBase        float64    `json:"precio_base"              db:"precio_base"`
	ImagenURL         string     `json:"imagen_url,omitempty"     db:"imagen_url"`
	TiempoPreparacion int        `json:"tiempo_preparacion"       db:"tiempo_preparacion"`
	Calorias          *int       `json:"calorias,omitempty"       db:"calorias"`
	Alergenos         string     `json:"alergenos,omitempty"      db:"alergenos"`
	EsVegetariano     bool       `json:"es_vegetariano"           db:"es_vegetariano"`
	EsVegano          bool       `json:"es_vegano"                db:"es_vegano"`
	EsGlutenFree      bool       `json:"es_gluten_free"           db:"es_gluten_free"`
	EsPopular         bool       `json:"es_popular"               db:"es_popular"`
	EsNuevo           bool       `json:"es_nuevo"                 db:"es_nuevo"`
	Disponible        bool       `json:"disponible"               db:"disponible"`
	Orden             int        `json:"orden"                    db:"orden"`
	Activo            bool       `json:"activo"                   db:"activo"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty"     db:"deleted_at"`
	CreatedAt         time.Time  `json:"created_at"               db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"               db:"updated_at"`
	// Campos virtuales
	NombreCategoria     string               `json:"nombre_categoria,omitempty"  db:"-"`
	Imagenes            []ProductoMenuImagen `json:"imagenes,omitempty"          db:"-"`
	Variantes           []VarianteProducto   `json:"variantes,omitempty"         db:"-"`
	GruposModificadores []GrupoModificador   `json:"grupos_modificadores,omitempty" db:"-"`
}

// NuevoProductoMenuRequest request para crear producto
type NuevoProductoMenuRequest struct {
	LocalID           int     `json:"local_id"            validate:"required"`
	CategoriaMenuID   int     `json:"categoria_menu_id"   validate:"required"`
	Nombre            string  `json:"nombre"              validate:"required,min=2,max=200"`
	Descripcion       string  `json:"descripcion"`
	PrecioBase        float64 `json:"precio_base"         validate:"required,gt=0"`
	ImagenURL         string  `json:"imagen_url"`
	TiempoPreparacion int     `json:"tiempo_preparacion"`
	Calorias          *int    `json:"calorias"`
	Alergenos         string  `json:"alergenos"`
	EsVegetariano     bool    `json:"es_vegetariano"`
	EsVegano          bool    `json:"es_vegano"`
	EsGlutenFree      bool    `json:"es_gluten_free"`
	EsPopular         bool    `json:"es_popular"`
	EsNuevo           bool    `json:"es_nuevo"`
	Orden             int     `json:"orden"`
}

// ActualizarProductoMenuRequest request para actualizar producto
type ActualizarProductoMenuRequest struct {
	CategoriaMenuID   *int     `json:"categoria_menu_id"`
	Nombre            string   `json:"nombre"`
	Descripcion       string   `json:"descripcion"`
	PrecioBase        *float64 `json:"precio_base"`
	ImagenURL         string   `json:"imagen_url"`
	TiempoPreparacion *int     `json:"tiempo_preparacion"`
	Calorias          *int     `json:"calorias"`
	Alergenos         string   `json:"alergenos"`
	EsVegetariano     *bool    `json:"es_vegetariano"`
	EsVegano          *bool    `json:"es_vegano"`
	EsGlutenFree      *bool    `json:"es_gluten_free"`
	EsPopular         *bool    `json:"es_popular"`
	EsNuevo           *bool    `json:"es_nuevo"`
	Disponible        *bool    `json:"disponible"`
	Orden             *int     `json:"orden"`
	Activo            *bool    `json:"activo"`
}

// CambiarDisponibilidadRequest request para cambiar disponibilidad
type CambiarDisponibilidadRequest struct {
	Disponible bool `json:"disponible"`
}
