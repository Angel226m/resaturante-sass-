package ordenes

import "time"

// ==========================================
// Entidad: ItemOrden + ModificadorItemOrden
// RestauFlow SaaS Multi-Tenant
// ==========================================

// ItemOrden item/plato de una orden
type ItemOrden struct {
	ID                int64     `json:"id_item_orden"        db:"id"`
	TenantID          string    `json:"tenant_id"            db:"tenant_id"`
	OrdenID           int64     `json:"orden_id"             db:"orden_id"`
	ProductoMenuID    int64     `json:"producto_menu_id"     db:"producto_menu_id"`
	VarianteID        *int64    `json:"variante_id,omitempty" db:"variante_id"`
	Cantidad          int       `json:"cantidad"             db:"cantidad"`
	PrecioUnitario    float64   `json:"precio_unitario"      db:"precio_unitario"`
	PrecioModificadores float64 `json:"precio_modificadores" db:"precio_modificadores"`
	Descuento         float64   `json:"descuento"            db:"descuento"`
	Subtotal          float64   `json:"subtotal"             db:"subtotal"`
	Estado            string    `json:"estado"               db:"estado"`
	Notas             string    `json:"notas,omitempty"      db:"notas"`
	CreatedAt         time.Time `json:"created_at"           db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	NombreProducto    string                 `json:"nombre_producto,omitempty"    db:"-"`
	NombreVariante    string                 `json:"nombre_variante,omitempty"    db:"-"`
	Modificadores     []ModificadorItemOrden `json:"modificadores,omitempty"      db:"-"`
}

// ModificadorItemOrden modificador aplicado a un item de orden
type ModificadorItemOrden struct {
	ID              int64   `json:"id"                   db:"id"`
	TenantID        string  `json:"tenant_id"            db:"tenant_id"`
	ItemOrdenID     int64   `json:"item_orden_id"        db:"item_orden_id"`
	ModificadorID   int64   `json:"modificador_id"       db:"modificador_id"`
	Cantidad        int     `json:"cantidad"             db:"cantidad"`
	PrecioAdicional float64 `json:"precio_adicional"     db:"precio_adicional"`
	// Campos virtuales
	NombreModificador string `json:"nombre_modificador,omitempty" db:"-"`
}

// NuevoItemOrdenReq request para agregar item a orden
type NuevoItemOrdenReq struct {
	ProductoMenuID int64                    `json:"producto_menu_id" validate:"required"`
	VarianteID     *int64                   `json:"variante_id"`
	Cantidad       int                      `json:"cantidad"         validate:"required,min=1"`
	Notas          string                   `json:"notas"`
	Modificadores  []NuevoModificadorItemReq `json:"modificadores"`
}

// NuevoModificadorItemReq modificador para item nuevo
type NuevoModificadorItemReq struct {
	ModificadorID int64 `json:"modificador_id" validate:"required"`
	Cantidad      int   `json:"cantidad"       validate:"min=1"`
}

// ActualizarItemOrdenRequest request para actualizar item
type ActualizarItemOrdenRequest struct {
	Cantidad *int   `json:"cantidad"`
	Notas    string `json:"notas"`
}
