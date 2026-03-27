package auth

import "time"

// ==========================================
// Entidad: SuperAdmin de la plataforma
// RestauFlow SaaS Multi-Tenant
// ==========================================

// SuperAdmin es un administrador de la plataforma (no pertenece a ningún tenant)
type SuperAdmin struct {
	ID            int        `json:"id_superadmin"            db:"id"`
	Nombre        string     `json:"nombre"                   db:"nombre"`
	Apellidos     string     `json:"apellidos"                db:"apellidos"`
	Correo        string     `json:"correo"                   db:"correo"`
	NumeroCelular string     `json:"numero_celular,omitempty" db:"numero_celular"`
	Contrasena    string     `json:"-"                        db:"contrasena"`
	Nivel         string     `json:"nivel"                    db:"nivel"`
	Activo        bool       `json:"activo"                   db:"activo"`
	DeletedAt     *time.Time `json:"deleted_at,omitempty"     db:"deleted_at"`
	UltimoLogin   *time.Time `json:"ultimo_login,omitempty"   db:"ultimo_login"`
	CreatedAt     time.Time  `json:"created_at"               db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"               db:"updated_at"`
}

// LoginSuperAdminRequest request para login de superadmin
type LoginSuperAdminRequest struct {
	Correo     string `json:"correo"     validate:"required"`
	Contrasena string `json:"contrasena" validate:"required"`
}

// NuevoSuperAdminRequest request para crear superadmin
type NuevoSuperAdminRequest struct {
	Nombre        string `json:"nombre"        validate:"required,min=2,max=100"`
	Apellidos     string `json:"apellidos"     validate:"required,min=2,max=100"`
	Correo        string `json:"correo"        validate:"required"`
	NumeroCelular string `json:"numero_celular"`
	Contrasena    string `json:"contrasena"    validate:"required,min=8"`
	Nivel         string `json:"nivel"`
}
