package menu

import "time"

// ==========================================
// Entidad: Combo + DetalleCombo
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Combo combo de productos del menú
type Combo struct {
	ID          int64      `json:"id_combo"             db:"id"`
	TenantID    string     `json:"tenant_id"            db:"tenant_id"`
	LocalID     int        `json:"local_id"             db:"local_id"`
	Nombre      string     `json:"nombre"               db:"nombre"`
	Descripcion string     `json:"descripcion"          db:"descripcion"`
	PrecioCombo float64    `json:"precio_combo"         db:"precio_combo"`
	ImagenURL   string     `json:"imagen_url,omitempty" db:"imagen_url"`
	FechaInicio *time.Time `json:"fecha_inicio,omitempty" db:"fecha_inicio"`
	FechaFin    *time.Time `json:"fecha_fin,omitempty"    db:"fecha_fin"`
	Disponible  bool       `json:"disponible"           db:"disponible"`
	Activo      bool       `json:"activo"               db:"activo"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt   time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	Detalle      []DetalleCombo `json:"detalle,omitempty" db:"-"`
	PrecioNormal float64        `json:"precio_normal,omitempty" db:"-"`
	Ahorro       float64        `json:"ahorro,omitempty"        db:"-"`
}

// DetalleCombo detalle de un combo
type DetalleCombo struct {
	ID             int64  `json:"id_detalle_combo"     db:"id"`
	TenantID       string `json:"tenant_id"            db:"tenant_id"`
	ComboID        int64  `json:"combo_id"             db:"combo_id"`
	ProductoMenuID int64  `json:"producto_menu_id"     db:"producto_menu_id"`
	Cantidad       int    `json:"cantidad"             db:"cantidad"`
	// Campos virtuales
	NombreProducto string  `json:"nombre_producto,omitempty" db:"-"`
	PrecioUnitario float64 `json:"precio_unitario,omitempty" db:"-"`
}

// NuevoComboRequest request para crear combo
type NuevoComboRequest struct {
	LocalID     int                    `json:"local_id"     validate:"required"`
	Nombre      string                 `json:"nombre"       validate:"required,min=2,max=200"`
	Descripcion string                 `json:"descripcion"`
	PrecioCombo float64                `json:"precio_combo" validate:"required,gt=0"`
	ImagenURL   string                 `json:"imagen_url"`
	FechaInicio *time.Time             `json:"fecha_inicio"`
	FechaFin    *time.Time             `json:"fecha_fin"`
	Detalle     []NuevoDetalleComboReq `json:"detalle"      validate:"required,min=2"`
}

// NuevoDetalleComboReq detalle para crear combo
type NuevoDetalleComboReq struct {
	ProductoMenuID int64 `json:"producto_menu_id" validate:"required"`
	Cantidad       int   `json:"cantidad"         validate:"required,min=1"`
}

// ActualizarComboRequest request para actualizar combo
type ActualizarComboRequest struct {
	Nombre      string     `json:"nombre"`
	Descripcion string     `json:"descripcion"`
	PrecioCombo *float64   `json:"precio_combo"`
	ImagenURL   string     `json:"imagen_url"`
	FechaInicio *time.Time `json:"fecha_inicio"`
	FechaFin    *time.Time `json:"fecha_fin"`
	Disponible  *bool      `json:"disponible"`
	Activo      *bool      `json:"activo"`
}
