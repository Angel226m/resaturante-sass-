package delivery

import "time"

// ==========================================
// Entidad: DeliveryOrden + SeguimientoDelivery
// RestauFlow SaaS Multi-Tenant
// ==========================================

// DeliveryOrden extensión de una orden tipo delivery
type DeliveryOrden struct {
	ID                    int64      `json:"id_delivery_orden"          db:"id"`
	TenantID              string     `json:"tenant_id"                  db:"tenant_id"`
	OrdenID               int64      `json:"orden_id"                   db:"orden_id"`
	ZonaDeliveryID        *int       `json:"zona_delivery_id,omitempty" db:"zona_delivery_id"`
	RepartidorID          *int       `json:"repartidor_id,omitempty"    db:"repartidor_id"`
	DireccionEntregaID    *int64     `json:"direccion_entrega_id,omitempty" db:"direccion_entrega_id"`
	EstadoDelivery        string     `json:"estado_delivery"            db:"estado_delivery"`
	CostoEnvio            float64    `json:"costo_envio"                db:"costo_envio"`
	DistanciaKM           *float64   `json:"distancia_km,omitempty"     db:"distancia_km"`
	InstruccionesEntrega  string     `json:"instrucciones_entrega,omitempty" db:"instrucciones_entrega"`
	CodigoConfirmacion    string     `json:"codigo_confirmacion,omitempty"   db:"codigo_confirmacion"`
	LatitudEntrega        *float64   `json:"latitud_entrega,omitempty"  db:"latitud_entrega"`
	LongitudEntrega       *float64   `json:"longitud_entrega,omitempty" db:"longitud_entrega"`
	TiempoEstimadoEntrega *time.Time `json:"tiempo_estimado_entrega,omitempty" db:"tiempo_estimado_entrega"`
	TiempoRealEntrega     *time.Time `json:"tiempo_real_entrega,omitempty"     db:"tiempo_real_entrega"`
	CreatedAt             time.Time  `json:"created_at"                 db:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"                 db:"updated_at"`
	// Campos virtuales
	NumeroOrden      string                `json:"numero_orden,omitempty"       db:"-"`
	NombreRepartidor string                `json:"nombre_repartidor,omitempty"  db:"-"`
	NombreZona       string                `json:"nombre_zona,omitempty"        db:"-"`
	Seguimiento      []SeguimientoDelivery `json:"seguimiento,omitempty"        db:"-"`
}

// SeguimientoDelivery registro de seguimiento GPS/estado del delivery
type SeguimientoDelivery struct {
	ID             int64     `json:"id"                   db:"id"`
	TenantID       string    `json:"tenant_id"            db:"tenant_id"`
	DeliveryID     int64     `json:"delivery_id"          db:"delivery_id"`
	RepartidorID   int       `json:"repartidor_id"        db:"repartidor_id"`
	Latitud        float64   `json:"latitud"              db:"latitud"`
	Longitud       float64   `json:"longitud"             db:"longitud"`
	EstadoDelivery string    `json:"estado_delivery"      db:"estado_delivery"`
	CreatedAt      time.Time `json:"created_at"           db:"created_at"`
}

// NuevoDeliveryOrdenRequest request para crear delivery de orden
type NuevoDeliveryOrdenRequest struct {
	OrdenID              int64    `json:"orden_id"               validate:"required"`
	ZonaDeliveryID       *int     `json:"zona_delivery_id"`
	DireccionEntregaID   *int64   `json:"direccion_entrega_id"`
	InstruccionesEntrega string   `json:"instrucciones_entrega"`
	LatitudEntrega       *float64 `json:"latitud_entrega"`
	LongitudEntrega      *float64 `json:"longitud_entrega"`
}

// AsignarRepartidorRequest request para asignar repartidor
type AsignarRepartidorRequest struct {
	RepartidorID int `json:"repartidor_id" validate:"required"`
}

// ActualizarEstadoDeliveryRequest request para cambiar estado delivery
type ActualizarEstadoDeliveryRequest struct {
	EstadoDelivery string   `json:"estado_delivery" validate:"required"`
	Latitud        *float64 `json:"latitud"`
	Longitud       *float64 `json:"longitud"`
}

// FiltrosDelivery filtros para listar deliveries
type FiltrosDelivery struct {
	LocalID      int    `json:"local_id"`
	Estado       string `json:"estado"`
	RepartidorID *int64 `json:"repartidor_id"`
	FechaDesde   string `json:"fecha_desde"`
	FechaHasta   string `json:"fecha_hasta"`
	Pagina       int    `json:"pagina"`
	PorPagina    int    `json:"por_pagina"`
}
