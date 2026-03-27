package plataforma

import "time"

// ==========================================
// Entidad: Tenant (restaurante que usa el SaaS)
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Tenant representa un restaurante suscrito a la plataforma
type Tenant struct {
	ID              string    `json:"id_tenant"           db:"id"`
	Nombre          string    `json:"nombre"              db:"nombre"`
	Slug            string    `json:"slug"                db:"slug"`
	RUC             string    `json:"ruc,omitempty"       db:"ruc"`
	CorreoContacto  string    `json:"correo_contacto"     db:"correo_contacto"`
	Telefono        string    `json:"telefono,omitempty"  db:"telefono"`
	Direccion       string    `json:"direccion,omitempty" db:"direccion"`
	LogoURL         string    `json:"logo_url,omitempty"  db:"logo_url"`
	ColorPrimario   string    `json:"color_primario"      db:"color_primario"`
	ColorSecundario string    `json:"color_secundario"    db:"color_secundario"`
	TipoRestaurante string    `json:"tipo_restaurante"    db:"tipo_restaurante"`
	Estado          string    `json:"estado"              db:"estado"`
	DiasTrial       int       `json:"dias_trial"          db:"dias_trial"`
	CreatedAt       time.Time `json:"created_at"          db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"          db:"updated_at"`
}

// NuevoTenantRequest request para crear un tenant
type NuevoTenantRequest struct {
	Nombre          string `json:"nombre"           validate:"required,min=3,max=200"`
	Slug            string `json:"slug"             validate:"required,min=3,max=100"`
	RUC             string `json:"ruc"`
	CorreoContacto  string `json:"correo_contacto"  validate:"required"`
	Telefono        string `json:"telefono"`
	Direccion       string `json:"direccion"`
	TipoRestaurante string `json:"tipo_restaurante"`
	PlanID          int    `json:"plan_id"          validate:"required"`
}

// ActualizarTenantRequest request para actualizar un tenant
type ActualizarTenantRequest struct {
	Nombre          string `json:"nombre"`
	RUC             string `json:"ruc"`
	CorreoContacto  string `json:"correo_contacto"`
	Telefono        string `json:"telefono"`
	Direccion       string `json:"direccion"`
	LogoURL         string `json:"logo_url"`
	ColorPrimario   string `json:"color_primario"`
	ColorSecundario string `json:"color_secundario"`
	TipoRestaurante string `json:"tipo_restaurante"`
	Estado          string `json:"estado"`
}
