package local

import "time"

// ==========================================
// Entidad: ConfiguracionRestaurante
// RestauFlow SaaS Multi-Tenant
// ==========================================

// ConfiguracionRestaurante configuración general del restaurante/local
type ConfiguracionRestaurante struct {
	ID                      int       `json:"id_configuracion"           db:"id"`
	TenantID                string    `json:"tenant_id"                  db:"tenant_id"`
	LocalID                 int       `json:"local_id"                   db:"local_id"`
	Moneda                  string    `json:"moneda"                     db:"moneda"`
	SimboloMoneda           string    `json:"simbolo_moneda"             db:"simbolo_moneda"`
	ZonaHoraria             string    `json:"zona_horaria"               db:"zona_horaria"`
	FormatoFecha            string    `json:"formato_fecha"              db:"formato_fecha"`
	IGV                     float64   `json:"igv"                        db:"igv_porcentaje"`
	IncluyeIGV              bool      `json:"incluye_igv"                db:"precio_incluye_igv"`
	PropinaSugerida         bool      `json:"propina_sugerida"           db:"propina_sugerida"`
	PorcentajePropina       float64   `json:"porcentaje_propina"         db:"propina_porcentaje"`
	CobrarCubierto          bool      `json:"cobrar_cubierto"            db:"cobrar_cubierto"`
	PrecioCubierto          float64   `json:"precio_cubierto"            db:"precio_cubierto"`
	MensajeTicket           string    `json:"mensaje_ticket,omitempty"   db:"mensaje_ticket"`
	MensajeWifi             string    `json:"mensaje_wifi,omitempty"     db:"mensaje_wifi"`
	CorreoNotificaciones    string    `json:"correo_notificaciones,omitempty" db:"correo_notificaciones"`
	EnviarEmailReserva      bool      `json:"enviar_email_reserva"       db:"enviar_email_reserva"`
	EnviarEmailOrden        bool      `json:"enviar_email_orden"         db:"enviar_email_orden"`
	TiempoPreparacionBase   int       `json:"tiempo_preparacion_base"    db:"tiempo_preparacion_default_min"`
	AlertaOrdenDemorada     int       `json:"alerta_orden_demorada"      db:"minutos_alerta_orden_demorada"`
	PermiteOrdenarSinMesero bool      `json:"permite_ordenar_sin_mesero" db:"permite_ordenar_sin_mesero"`
	PermitirReservas        bool      `json:"permitir_reservas"          db:"permitir_reservas"`
	TiempoMaxReserva        int       `json:"tiempo_max_reserva"         db:"tiempo_max_reserva"`
	PermitirDelivery        bool      `json:"permitir_delivery"          db:"permitir_delivery"`
	UpdatedAt               time.Time `json:"updated_at"                 db:"updated_at"`
}

// ActualizarConfiguracionRequest request para actualizar configuración
type ActualizarConfiguracionRequest struct {
	Moneda                  string   `json:"moneda"`
	SimboloMoneda           string   `json:"simbolo_moneda"`
	ZonaHoraria             string   `json:"zona_horaria"`
	FormatoFecha            string   `json:"formato_fecha"`
	IGV                     *float64 `json:"igv"`
	IncluyeIGV              *bool    `json:"incluye_igv"`
	PropinaSugerida         *bool    `json:"propina_sugerida"`
	PorcentajePropina       *float64 `json:"porcentaje_propina"`
	CobrarCubierto          *bool    `json:"cobrar_cubierto"`
	PrecioCubierto          *float64 `json:"precio_cubierto"`
	MensajeTicket           string   `json:"mensaje_ticket"`
	MensajeWifi             string   `json:"mensaje_wifi"`
	CorreoNotificaciones    string   `json:"correo_notificaciones"`
	EnviarEmailReserva      *bool    `json:"enviar_email_reserva"`
	EnviarEmailOrden        *bool    `json:"enviar_email_orden"`
	TiempoPreparacionBase   *int     `json:"tiempo_preparacion_base"`
	AlertaOrdenDemorada     *int     `json:"alerta_orden_demorada"`
	PermiteOrdenarSinMesero *bool    `json:"permite_ordenar_sin_mesero"`
	PermitirReservas        *bool    `json:"permitir_reservas"`
	TiempoMaxReserva        *int     `json:"tiempo_max_reserva"`
	PermitirDelivery        *bool    `json:"permitir_delivery"`
}
