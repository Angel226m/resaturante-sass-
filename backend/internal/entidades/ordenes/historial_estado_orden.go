package ordenes

import "time"

// ==========================================
// Entidad: HistorialEstadoOrden
// RestauFlow SaaS Multi-Tenant
// ==========================================

// HistorialEstadoOrden historial de cambios de estado de una orden
type HistorialEstadoOrden struct {
	ID             int64     `json:"id"                   db:"id"`
	TenantID       string    `json:"tenant_id"            db:"tenant_id"`
	OrdenID        int64     `json:"orden_id"             db:"orden_id"`
	EstadoAnterior string    `json:"estado_anterior"      db:"estado_anterior"`
	EstadoNuevo    string    `json:"estado_nuevo"         db:"estado_nuevo"`
	UsuarioID      *int64    `json:"usuario_id,omitempty" db:"usuario_id"`
	Motivo         string    `json:"motivo,omitempty"     db:"motivo"`
	CreatedAt      time.Time `json:"created_at"           db:"created_at"`
	// Campos virtuales
	NombreUsuario  string `json:"nombre_usuario,omitempty" db:"-"`
}
