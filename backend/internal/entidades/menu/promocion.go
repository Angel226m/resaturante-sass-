package menu

import "time"

// ==========================================
// Entidad: Promocion + Cupon
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Promocion promoción sobre productos del menú
type Promocion struct {
	ID             int64      `json:"id_promocion"         db:"id"`
	TenantID       string     `json:"tenant_id"            db:"tenant_id"`
	LocalID        int        `json:"local_id"             db:"local_id"`
	Nombre         string     `json:"nombre"               db:"nombre"`
	Descripcion    string     `json:"descripcion"          db:"descripcion"`
	TipoDescuento  string     `json:"tipo_descuento"       db:"tipo_descuento"`
	ValorDescuento float64    `json:"valor_descuento"      db:"valor_descuento"`
	FechaInicio    time.Time  `json:"fecha_inicio"         db:"fecha_inicio"`
	FechaFin       time.Time  `json:"fecha_fin"            db:"fecha_fin"`
	DiasAplicables string     `json:"dias_aplicables"      db:"dias_aplicables"`
	HoraInicio     string     `json:"hora_inicio,omitempty" db:"hora_inicio"`
	HoraFin        string     `json:"hora_fin,omitempty"    db:"hora_fin"`
	AplicaA        string     `json:"aplica_a"             db:"aplica_a"`
	ProductoMenuID *int64     `json:"producto_menu_id,omitempty" db:"producto_menu_id"`
	CategoriaID    *int       `json:"categoria_id,omitempty"     db:"categoria_id"`
	UsosMaximos    int        `json:"usos_maximos"         db:"usos_maximos"`
	UsosActuales   int        `json:"usos_actuales"        db:"usos_actuales"`
	Activo         bool       `json:"activo"               db:"activo"`
	DeletedAt      *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt      time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"           db:"updated_at"`
}

// Cupon cupón de descuento
type Cupon struct {
	ID                int64      `json:"id_cupon"             db:"id"`
	TenantID          string     `json:"tenant_id"            db:"tenant_id"`
	LocalID           int        `json:"local_id"             db:"local_id"`
	Codigo            string     `json:"codigo"               db:"codigo"`
	Descripcion       string     `json:"descripcion"          db:"descripcion"`
	TipoDescuento     string     `json:"tipo_descuento"       db:"tipo_descuento"`
	ValorDescuento    float64    `json:"valor_descuento"      db:"valor_descuento"`
	MontoMinimo       float64    `json:"monto_minimo"         db:"monto_minimo"`
	MontoMaxDescuento float64    `json:"monto_max_descuento"  db:"monto_max_descuento"`
	FechaInicio       time.Time  `json:"fecha_inicio"         db:"fecha_inicio"`
	FechaFin          time.Time  `json:"fecha_fin"            db:"fecha_fin"`
	UsosMaximos       int        `json:"usos_maximos"         db:"usos_maximos"`
	UsosPorCliente    int        `json:"usos_por_cliente"     db:"usos_por_cliente"`
	UsosActuales      int        `json:"usos_actuales"        db:"usos_actuales"`
	ClienteID         *int64     `json:"cliente_id,omitempty" db:"cliente_id"`
	Activo            bool       `json:"activo"               db:"activo"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt         time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"           db:"updated_at"`
}

// NuevaPromocionRequest request para crear promoción
type NuevaPromocionRequest struct {
	LocalID        int       `json:"local_id"        validate:"required"`
	Nombre         string    `json:"nombre"          validate:"required,min=2,max=200"`
	Descripcion    string    `json:"descripcion"`
	TipoDescuento  string    `json:"tipo_descuento"  validate:"required"`
	ValorDescuento float64   `json:"valor_descuento" validate:"required,gt=0"`
	FechaInicio    time.Time `json:"fecha_inicio"    validate:"required"`
	FechaFin       time.Time `json:"fecha_fin"       validate:"required"`
	DiasAplicables string    `json:"dias_aplicables"`
	HoraInicio     string    `json:"hora_inicio"`
	HoraFin        string    `json:"hora_fin"`
	AplicaA        string    `json:"aplica_a"        validate:"required"`
	ProductoMenuID *int64    `json:"producto_menu_id"`
	CategoriaID    *int      `json:"categoria_id"`
	UsosMaximos    int       `json:"usos_maximos"`
}

// ActualizarPromocionRequest request para actualizar promoción
type ActualizarPromocionRequest struct {
	Nombre         string     `json:"nombre"`
	Descripcion    string     `json:"descripcion"`
	TipoDescuento  string     `json:"tipo_descuento"`
	ValorDescuento *float64   `json:"valor_descuento"`
	FechaInicio    *time.Time `json:"fecha_inicio"`
	FechaFin       *time.Time `json:"fecha_fin"`
	DiasAplicables string     `json:"dias_aplicables"`
	HoraInicio     string     `json:"hora_inicio"`
	HoraFin        string     `json:"hora_fin"`
	UsosMaximos    *int       `json:"usos_maximos"`
	Activo         *bool      `json:"activo"`
}

// NuevoCuponRequest request para crear cupón
type NuevoCuponRequest struct {
	LocalID           int       `json:"local_id"           validate:"required"`
	Codigo            string    `json:"codigo"             validate:"required,min=3,max=50"`
	Descripcion       string    `json:"descripcion"`
	TipoDescuento     string    `json:"tipo_descuento"     validate:"required"`
	ValorDescuento    float64   `json:"valor_descuento"    validate:"required,gt=0"`
	MontoMinimo       float64   `json:"monto_minimo"`
	MontoMaxDescuento float64   `json:"monto_max_descuento"`
	FechaInicio       time.Time `json:"fecha_inicio"     validate:"required"`
	FechaFin          time.Time `json:"fecha_fin"        validate:"required"`
	UsosMaximos       int       `json:"usos_maximos"`
	UsosPorCliente    int       `json:"usos_por_cliente"`
	ClienteID         *int64    `json:"cliente_id"`
}

// ActualizarCuponRequest request para actualizar cupón
type ActualizarCuponRequest struct {
	Descripcion       string     `json:"descripcion"`
	ValorDescuento    *float64   `json:"valor_descuento"`
	MontoMinimo       *float64   `json:"monto_minimo"`
	MontoMaxDescuento *float64   `json:"monto_max_descuento"`
	FechaInicio       *time.Time `json:"fecha_inicio"`
	FechaFin          *time.Time `json:"fecha_fin"`
	UsosMaximos       *int       `json:"usos_maximos"`
	Activo            *bool      `json:"activo"`
}

// ValidarCuponRequest request para validar cupón
type ValidarCuponRequest struct {
	Codigo    string  `json:"codigo"    validate:"required"`
	ClienteID *int64  `json:"cliente_id"`
	Monto     float64 `json:"monto"     validate:"required,gt=0"`
}

// CuponValidado resultado de validación de cupón
type CuponValidado struct {
	Valido         bool    `json:"valido"`
	Descuento      float64 `json:"descuento"`
	Mensaje        string  `json:"mensaje"`
	CuponID        int64   `json:"cupon_id,omitempty"`
	TipoDescuento  string  `json:"tipo_descuento,omitempty"`
	ValorDescuento float64 `json:"valor_descuento,omitempty"`
}
