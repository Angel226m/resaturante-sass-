package local

import "time"

// ==========================================
// Entidades: Local, Zona, Mesa, Configuración
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Local representa una sucursal del restaurante
type Local struct {
	ID              int        `json:"id_local"             db:"id"`
	TenantID        string     `json:"tenant_id"            db:"tenant_id"`
	Nombre          string     `json:"nombre"               db:"nombre"`
	Direccion       string     `json:"direccion"            db:"direccion"`
	Distrito        string     `json:"distrito,omitempty"   db:"distrito"`
	Provincia       string     `json:"provincia,omitempty"  db:"provincia"`
	Departamento    string     `json:"departamento,omitempty" db:"departamento"`
	Telefono        string     `json:"telefono,omitempty"   db:"telefono"`
	Correo          string     `json:"correo,omitempty"     db:"correo"`
	Latitud         *float64   `json:"latitud,omitempty"    db:"latitud"`
	Longitud        *float64   `json:"longitud,omitempty"   db:"longitud"`
	EsPrincipal     bool       `json:"es_principal"         db:"es_principal"`
	NumeroPisos     int        `json:"numero_pisos"         db:"numero_pisos"`
	HorarioApertura string     `json:"horario_apertura,omitempty" db:"horario_apertura"`
	HorarioCierre   string     `json:"horario_cierre,omitempty"   db:"horario_cierre"`
	AceptaReservas  bool       `json:"acepta_reservas"      db:"acepta_reservas"`
	AceptaDelivery  bool       `json:"acepta_delivery"      db:"acepta_delivery"`
	RadioDeliveryKM float64    `json:"radio_delivery_km"    db:"radio_delivery_km"`
	Activo          bool       `json:"activo"               db:"activo"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt       time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	TotalMesas int `json:"total_mesas,omitempty"  db:"-"`
	TotalZonas int `json:"total_zonas,omitempty"  db:"-"`
}

// NuevoLocalRequest request para crear local
type NuevoLocalRequest struct {
	Nombre          string   `json:"nombre"          validate:"required,min=3,max=200"`
	Direccion       string   `json:"direccion"       validate:"required"`
	Distrito        string   `json:"distrito"`
	Provincia       string   `json:"provincia"`
	Departamento    string   `json:"departamento"`
	Telefono        string   `json:"telefono"`
	Correo          string   `json:"correo"`
	Latitud         *float64 `json:"latitud"`
	Longitud        *float64 `json:"longitud"`
	EsPrincipal     bool     `json:"es_principal"`
	NumeroPisos     int      `json:"numero_pisos"`
	HorarioApertura string   `json:"horario_apertura"`
	HorarioCierre   string   `json:"horario_cierre"`
	AceptaReservas  bool     `json:"acepta_reservas"`
	AceptaDelivery  bool     `json:"acepta_delivery"`
	RadioDeliveryKM float64  `json:"radio_delivery_km"`
}

// ActualizarLocalRequest request para actualizar un local
type ActualizarLocalRequest struct {
	Nombre          string   `json:"nombre"`
	Direccion       string   `json:"direccion"`
	Distrito        string   `json:"distrito"`
	Provincia       string   `json:"provincia"`
	Departamento    string   `json:"departamento"`
	Telefono        string   `json:"telefono"`
	Correo          string   `json:"correo"`
	Latitud         *float64 `json:"latitud"`
	Longitud        *float64 `json:"longitud"`
	NumeroPisos     *int     `json:"numero_pisos"`
	HorarioApertura string   `json:"horario_apertura"`
	HorarioCierre   string   `json:"horario_cierre"`
	AceptaReservas  *bool    `json:"acepta_reservas"`
	AceptaDelivery  *bool    `json:"acepta_delivery"`
	RadioDeliveryKM *float64 `json:"radio_delivery_km"`
	Activo          *bool    `json:"activo"`
}
