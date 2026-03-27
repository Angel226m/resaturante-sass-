package auth

import "time"

// ==========================================
// Entidad: Token de recuperación
// RestauFlow SaaS Multi-Tenant
// ==========================================

// TokenRecuperacion es un token para recuperar contraseña, verificar o invitar
type TokenRecuperacion struct {
	ID           int64     `json:"id"             db:"id"`
	TenantID     *string   `json:"tenant_id"      db:"tenant_id"`
	UsuarioID    *int      `json:"usuario_id"     db:"usuario_id"`
	SuperAdminID *int      `json:"superadmin_id"  db:"superadmin_id"`
	Token        string    `json:"token"          db:"token"`
	Tipo         string    `json:"tipo"           db:"tipo"`
	Usado        bool      `json:"usado"          db:"usado"`
	ExpiresAt    time.Time `json:"expires_at"     db:"expires_at"`
	CreatedAt    time.Time `json:"created_at"     db:"created_at"`
}

// RecuperarContrasenaRequest request para solicitar recuperación
type RecuperarContrasenaRequest struct {
	Correo string `json:"correo" validate:"required"`
}

// ResetearContrasenaRequest request para resetear con token
type ResetearContrasenaRequest struct {
	Token           string `json:"token"           validate:"required"`
	NuevaContrasena string `json:"nueva_contrasena" validate:"required,min=8"`
}
