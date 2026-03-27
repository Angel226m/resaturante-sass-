package menu

import "time"

// ==========================================
// Entidad: MenuHorario
// RestauFlow SaaS Multi-Tenant
// ==========================================

// MenuHorario horario de disponibilidad de categorías del menú
type MenuHorario struct {
	ID              int       `json:"id_menu_horario"      db:"id"`
	TenantID        string    `json:"tenant_id"            db:"tenant_id"`
	CategoriaMenuID int       `json:"categoria_menu_id"    db:"categoria_menu_id"`
	DiaSemana       int       `json:"dia_semana"           db:"dia_semana"`
	HoraInicio      string    `json:"hora_inicio"          db:"hora_inicio"`
	HoraFin         string    `json:"hora_fin"             db:"hora_fin"`
	Activo          bool      `json:"activo"               db:"activo"`
	CreatedAt       time.Time `json:"created_at"           db:"created_at"`
}

// NuevoMenuHorarioRequest request para crear horario de menú
type NuevoMenuHorarioRequest struct {
	CategoriaMenuID int    `json:"categoria_menu_id" validate:"required"`
	DiaSemana       int    `json:"dia_semana"        validate:"required,min=0,max=6"`
	HoraInicio      string `json:"hora_inicio"       validate:"required"`
	HoraFin         string `json:"hora_fin"          validate:"required"`
}

// ActualizarMenuHorarioRequest request para actualizar horario
type ActualizarMenuHorarioRequest struct {
	DiaSemana  *int   `json:"dia_semana"`
	HoraInicio string `json:"hora_inicio"`
	HoraFin    string `json:"hora_fin"`
	Activo     *bool  `json:"activo"`
}
