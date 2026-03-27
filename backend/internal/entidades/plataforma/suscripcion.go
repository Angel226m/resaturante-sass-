package plataforma

import "time"

// ==========================================
// Entidad: Suscripción
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Suscripcion representa la suscripción de un tenant a un plan
type Suscripcion struct {
	ID                        int64      `json:"id_suscripcion"              db:"id"`
	TenantID                  string     `json:"tenant_id"                   db:"tenant_id"`
	PlanID                    int        `json:"plan_id"                     db:"plan_id"`
	Estado                    string     `json:"estado"                      db:"estado"`
	TipoFacturacion           string     `json:"tipo_facturacion"            db:"tipo_facturacion"`
	FechaInicio               time.Time  `json:"fecha_inicio"                db:"fecha_inicio"`
	FechaVencimiento          time.Time  `json:"fecha_vencimiento"           db:"fecha_vencimiento"`
	FechaCancelacion          *time.Time `json:"fecha_cancelacion,omitempty" db:"fecha_cancelacion"`
	PrecioPagado              *float64   `json:"precio_pagado,omitempty"     db:"precio_pagado"`
	MercadopagoSubscriptionID string     `json:"mercadopago_subscription_id,omitempty" db:"mercadopago_subscription_id"`
	RenovacionAutomatica      bool       `json:"renovacion_automatica"       db:"renovacion_automatica"`
	CreatedAt                 time.Time  `json:"created_at"                  db:"created_at"`
	UpdatedAt                 time.Time  `json:"updated_at"                  db:"updated_at"`
	// Campos virtuales para joins
	NombrePlan string `json:"nombre_plan,omitempty" db:"-"`
}

// NuevaSuscripcionRequest request para crear suscripción
type NuevaSuscripcionRequest struct {
	TenantID        string  `json:"tenant_id"        validate:"required"`
	PlanID          int     `json:"plan_id"          validate:"required"`
	TipoFacturacion string  `json:"tipo_facturacion"`
	PrecioPagado    float64 `json:"precio_pagado"`
}

// CambiarPlanRequest request para cambiar el plan de un tenant
type CambiarPlanRequest struct {
	PlanID  int    `json:"plan_id"  validate:"required"`
	Periodo string `json:"periodo"`
	Motivo  string `json:"motivo"`
}
