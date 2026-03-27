package delivery

import "time"

// ==========================================
// Entidad: ZonaDelivery
// RestauFlow SaaS Multi-Tenant
// ==========================================

// ZonaDelivery zona de cobertura de delivery
type ZonaDelivery struct {
	ID                int       `json:"id_zona_delivery"     db:"id"`
	TenantID          string    `json:"tenant_id"            db:"tenant_id"`
	LocalID           int       `json:"local_id"             db:"local_id"`
	Nombre            string    `json:"nombre"               db:"nombre"`
	RadioKM           float64   `json:"radio_km"             db:"radio_km"`
	CostoEnvio        float64   `json:"costo_envio"          db:"costo_envio"`
	TiempoEstimadoMin int       `json:"tiempo_estimado_min"  db:"tiempo_estimado_min"`
	Activo            bool      `json:"activo"               db:"activo"`
	CreatedAt         time.Time `json:"created_at"           db:"created_at"`
}

// NuevaZonaDeliveryRequest request para crear zona de delivery
type NuevaZonaDeliveryRequest struct {
	LocalID           int     `json:"local_id"           validate:"required"`
	Nombre            string  `json:"nombre"             validate:"required,min=2,max=100"`
	RadioKM           float64 `json:"radio_km"           validate:"required,gt=0"`
	CostoEnvio        float64 `json:"costo_envio"        validate:"gte=0"`
	TiempoEstimadoMin int     `json:"tiempo_estimado_min" validate:"gt=0"`
}

// ActualizarZonaDeliveryRequest request para actualizar
type ActualizarZonaDeliveryRequest struct {
	Nombre            *string  `json:"nombre"`
	RadioKM           *float64 `json:"radio_km"`
	CostoEnvio        *float64 `json:"costo_envio"`
	TiempoEstimadoMin *int     `json:"tiempo_estimado_min"`
	Activo            *bool    `json:"activo"`
}
