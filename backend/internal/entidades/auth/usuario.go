package auth

import "time"

// ==========================================
// Entidad: Usuario de tenant
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Usuario representa a un usuario del sistema (mesero, cajero, etc.)
type Usuario struct {
	ID                  int        `json:"id_usuario"                    db:"id"`
	TenantID            string     `json:"tenant_id"                     db:"tenant_id"`
	LocalID             *int       `json:"local_id,omitempty"            db:"local_id"`
	Nombre              string     `json:"nombre"                        db:"nombre"`
	Apellidos           string     `json:"apellidos"                     db:"apellidos"`
	Correo              string     `json:"correo"                        db:"correo"`
	NumeroCelular       string     `json:"numero_celular,omitempty"      db:"numero_celular"`
	Contrasena          string     `json:"-"                             db:"contrasena"`
	Rol                 string     `json:"rol"                           db:"rol"`
	PinAcceso           string     `json:"pin_acceso,omitempty"          db:"pin_acceso"`
	AvatarURL           string     `json:"avatar_url,omitempty"          db:"avatar_url"`
	ColorIdentificacion string     `json:"color_identificacion,omitempty" db:"color_identificacion"`
	Activo              bool       `json:"activo"                        db:"activo"`
	DeletedAt           *time.Time `json:"deleted_at,omitempty"              db:"deleted_at"`
	UltimoLogin         *time.Time `json:"ultimo_login,omitempty"        db:"ultimo_login"`
	CreatedAt           time.Time  `json:"created_at"                    db:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"                    db:"updated_at"`
	// Campos virtuales
	NombreCompleto string `json:"nombre_completo,omitempty" db:"-"`
	NombreLocal    string `json:"nombre_local,omitempty"    db:"-"`
}

// NuevoUsuarioRequest request para crear un usuario
type NuevoUsuarioRequest struct {
	LocalID             *int   `json:"local_id"`
	Nombre              string `json:"nombre"       validate:"required,min=2,max=100"`
	Apellidos           string `json:"apellidos"    validate:"required,min=2,max=100"`
	Correo              string `json:"correo"       validate:"required"`
	NumeroCelular       string `json:"numero_celular"`
	Contrasena          string `json:"contrasena"   validate:"required,min=8"`
	Rol                 string `json:"rol"          validate:"required"`
	PinAcceso           string `json:"pin_acceso"`
	ColorIdentificacion string `json:"color_identificacion"`
}

// ActualizarUsuarioRequest request para actualizar un usuario
type ActualizarUsuarioRequest struct {
	LocalID             *int   `json:"local_id"`
	Nombre              string `json:"nombre"`
	Apellidos           string `json:"apellidos"`
	Correo              string `json:"correo"`
	NumeroCelular       string `json:"numero_celular"`
	Rol                 string `json:"rol"`
	PinAcceso           string `json:"pin_acceso"`
	ColorIdentificacion string `json:"color_identificacion"`
	Activo              *bool  `json:"activo"`
}

// LoginRequest request para iniciar sesión
type LoginRequest struct {
	Correo     string `json:"correo"     validate:"required"`
	Contrasena string `json:"contrasena" validate:"required"`
	RememberMe bool   `json:"remember_me"`
}

// LoginPinRequest login rápido por PIN
type LoginPinRequest struct {
	Pin string `json:"pin" validate:"required"`
}

// CambiarContrasenaRequest request para cambiar contraseña
type CambiarContrasenaRequest struct {
	ContrasenaActual string `json:"contrasena_actual" validate:"required"`
	ContrasenaNueva  string `json:"contrasena_nueva"  validate:"required,min=8"`
}

// LoginResponse respuesta de login exitoso
type LoginResponse struct {
	Usuario      *Usuario `json:"usuario"`
	AccessToken  string   `json:"access_token,omitempty"`
	RefreshToken string   `json:"refresh_token,omitempty"`
}
