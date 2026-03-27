package plataforma

import "time"

// ==========================================
// Entidad: Factura de Plataforma
// RestauFlow SaaS Multi-Tenant
// ==========================================

// FacturaPlataforma representa una factura emitida al tenant
type FacturaPlataforma struct {
	ID                   int64      `json:"id_factura"                  db:"id"`
	TenantID             string     `json:"tenant_id"                   db:"tenant_id"`
	SuscripcionID        *int64     `json:"suscripcion_id,omitempty"    db:"suscripcion_id"`
	NumeroFactura        string     `json:"numero_factura"              db:"numero_factura"`
	Concepto             string     `json:"concepto"                    db:"concepto"`
	Monto                float64    `json:"monto"                       db:"monto"`
	Estado               string     `json:"estado"                      db:"estado"`
	FechaEmision         time.Time  `json:"fecha_emision"               db:"fecha_emision"`
	FechaVencimiento     *time.Time `json:"fecha_vencimiento,omitempty" db:"fecha_vencimiento"`
	FechaPago            *time.Time `json:"fecha_pago,omitempty"        db:"fecha_pago"`
	MercadopagoPaymentID string     `json:"mercadopago_payment_id,omitempty" db:"mercadopago_payment_id"`
	CreatedAt            time.Time  `json:"created_at"                  db:"created_at"`
}

// HistorialCambioPlan registra cambios de plan (INMUTABLE)
type HistorialCambioPlan struct {
	ID             int64     `json:"id"                db:"id"`
	TenantID       string    `json:"tenant_id"         db:"tenant_id"`
	SuscripcionID  *int64    `json:"suscripcion_id"    db:"suscripcion_id"`
	PlanAnteriorID *int      `json:"plan_anterior_id"  db:"plan_anterior_id"`
	PlanNuevoID    int       `json:"plan_nuevo_id"     db:"plan_nuevo_id"`
	Motivo         string    `json:"motivo"            db:"motivo"`
	RealizadoPor   string    `json:"realizado_por"     db:"realizado_por"`
	CreatedAt      time.Time `json:"created_at"        db:"created_at"`
}
