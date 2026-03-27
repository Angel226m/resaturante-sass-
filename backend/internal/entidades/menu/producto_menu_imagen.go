package menu

import "time"

// ==========================================
// Entidad: ProductoMenuImagen
// RestauFlow SaaS Multi-Tenant
// ==========================================

// ProductoMenuImagen imagen adicional de un producto del menú
type ProductoMenuImagen struct {
	ID             int64     `json:"id_imagen"            db:"id"`
	TenantID       string    `json:"tenant_id"            db:"tenant_id"`
	ProductoMenuID int64     `json:"producto_menu_id"     db:"producto_menu_id"`
	URL            string    `json:"url"                  db:"url"`
	AltTexto       string    `json:"alt_texto,omitempty"  db:"alt_texto"`
	Orden          int       `json:"orden"                db:"orden"`
	EsPrincipal    bool      `json:"es_principal"         db:"es_principal"`
	CreatedAt      time.Time `json:"created_at"           db:"created_at"`
}

// NuevaImagenProductoRequest request para agregar imagen
type NuevaImagenProductoRequest struct {
	ProductoMenuID int64  `json:"producto_menu_id" validate:"required"`
	URL            string `json:"url"              validate:"required,url"`
	AltTexto       string `json:"alt_texto"`
	Orden          int    `json:"orden"`
	EsPrincipal    bool   `json:"es_principal"`
}
