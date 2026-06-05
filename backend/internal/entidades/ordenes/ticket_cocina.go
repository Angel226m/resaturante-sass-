package ordenes

import "time"

// ==========================================
// Entidad: TicketCocina
// RestauFlow SaaS Multi-Tenant
// ==========================================

// TicketCocina ticket enviado a cocina/bar
type TicketCocina struct {
	ID             int64      `json:"id"                   db:"id"`
	TenantID       string     `json:"tenant_id"            db:"tenant_id"`
	OrdenID        int64      `json:"orden_id"             db:"orden_id"`
	LocalID        int        `json:"local_id"             db:"local_id"`
	NumeroTicket   int        `json:"numero_ticket"        db:"numero_ticket"`
	EstacionCocina string     `json:"estacion_cocina"      db:"estacion_cocina"`
	Estado         string     `json:"estado"               db:"estado"`
	Prioridad      int        `json:"prioridad"            db:"prioridad"`
	TiempoEstimado int        `json:"tiempo_estimado"      db:"tiempo_estimado"`
	FechaInicio    *time.Time `json:"fecha_inicio,omitempty"     db:"fecha_inicio"`
	FechaTerminado *time.Time `json:"fecha_terminado,omitempty"  db:"fecha_terminado"`
	CocineroID     *int64     `json:"cocinero_id,omitempty"      db:"cocinero_id"`
	Notas          string     `json:"notas,omitempty"      db:"notas"`
	CreatedAt      time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales
	NumeroOrden    string      `json:"numero_orden,omitempty"     db:"-"`
	NombreCocinero string      `json:"nombre_cocinero,omitempty"  db:"-"`
	Items          []ItemOrden `json:"items,omitempty"            db:"-"`
}

// CambiarEstadoTicketRequest request para cambiar estado de ticket cocina
type CambiarEstadoTicketRequest struct {
	Estado     string `json:"estado"     validate:"required"`
	CocineroID *int64 `json:"cocinero_id"`
}

// FiltrosTicketCocina filtros para listar tickets
type FiltrosTicketCocina struct {
	LocalID        int    `json:"local_id"`
	Estado         string `json:"estado"`
	EstacionCocina string `json:"estacion_cocina"`
	Prioridad      *int   `json:"prioridad"`
}
