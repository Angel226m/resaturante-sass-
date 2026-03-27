package local

import "time"

// ==========================================
// Entidad: Mesa
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Mesa representa una mesa del restaurante
type Mesa struct {
	ID        int        `json:"id_mesa"              db:"id"`
	TenantID  string     `json:"tenant_id"            db:"tenant_id"`
	LocalID   int        `json:"local_id"             db:"local_id"`
	ZonaID    *int       `json:"zona_id,omitempty"    db:"zona_id"`
	Numero    string     `json:"numero"               db:"numero"`
	Capacidad int        `json:"capacidad"            db:"capacidad"`
	Estado    string     `json:"estado"               db:"estado"`
	Forma     string     `json:"forma"                db:"forma"`
	PosicionX int        `json:"posicion_x"           db:"posicion_x"`
	PosicionY int        `json:"posicion_y"           db:"posicion_y"`
	QRCodigo  string     `json:"qr_codigo,omitempty"  db:"qr_codigo"`
	QRURL     string     `json:"qr_url,omitempty"     db:"qr_url"`
	Activo    bool       `json:"activo"               db:"activo"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos virtuales (populated via JOINs)
	NombreZona    string `json:"nombre_zona,omitempty"     db:"-"`
	Piso          int    `json:"piso,omitempty"            db:"-"`
	NombreLocal   string `json:"nombre_local,omitempty"    db:"-"`
	OrdenActiva   *int64 `json:"orden_activa_id,omitempty" db:"-"`
	TiempoOcupada string `json:"tiempo_ocupada,omitempty"  db:"-"`
}

// NuevaMesaRequest request para crear mesa
type NuevaMesaRequest struct {
	LocalID   int    `json:"local_id"   validate:"required"`
	ZonaID    *int   `json:"zona_id"`
	Numero    string `json:"numero"     validate:"required,min=1,max=10"`
	Capacidad int    `json:"capacidad"  validate:"required,min=1"`
	Forma     string `json:"forma"`
	PosicionX int    `json:"posicion_x"`
	PosicionY int    `json:"posicion_y"`
}

// ActualizarMesaRequest request para actualizar mesa
type ActualizarMesaRequest struct {
	ZonaID    *int   `json:"zona_id"`
	Numero    string `json:"numero"`
	Capacidad *int   `json:"capacidad"`
	Estado    string `json:"estado"`
	Forma     string `json:"forma"`
	PosicionX *int   `json:"posicion_x"`
	PosicionY *int   `json:"posicion_y"`
	Activo    *bool  `json:"activo"`
}

// CambiarEstadoMesaRequest request para cambiar estado de mesa
type CambiarEstadoMesaRequest struct {
	Estado string `json:"estado" validate:"required"`
}
