package caja

import "time"

// ==========================================
// Entidad: Comprobante
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Comprobante comprobante de pago (boleta/factura/ticket)
type Comprobante struct {
	ID              int64      `json:"id_comprobante"       db:"id"`
	TenantID        string     `json:"tenant_id"            db:"tenant_id"`
	OrdenID         int64      `json:"orden_id"             db:"orden_id"`
	PagoID          int64      `json:"pago_id"              db:"pago_id"`
	TipoComprobante string     `json:"tipo_comprobante"     db:"tipo_comprobante"`
	Serie           string     `json:"serie"                db:"serie"`
	Numero          string     `json:"numero"               db:"numero"`
	FechaEmision    time.Time  `json:"fecha_emision"        db:"fecha_emision"`
	RUCCliente      string     `json:"ruc_cliente,omitempty"     db:"ruc_cliente"`
	RazonSocial     string     `json:"razon_social,omitempty"   db:"razon_social"`
	DireccionFiscal string     `json:"direccion_fiscal,omitempty" db:"direccion_fiscal"`
	Subtotal        float64    `json:"subtotal"             db:"subtotal"`
	IGV             float64    `json:"igv"                  db:"igv"`
	Total           float64    `json:"total"                db:"total"`
	Estado          string     `json:"estado"               db:"estado"`
	PDFURL          string     `json:"pdf_url,omitempty"    db:"pdf_url"`
	HashSUNAT       string     `json:"hash_sunat,omitempty" db:"hash_sunat"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt       time.Time  `json:"created_at"           db:"created_at"`
	// Campos virtuales
	NumeroOrden string `json:"numero_orden,omitempty" db:"-"`
}

// NuevoComprobanteRequest request para emitir comprobante
type NuevoComprobanteRequest struct {
	OrdenID         int64  `json:"orden_id"         validate:"required"`
	PagoID          int64  `json:"pago_id"          validate:"required"`
	TipoComprobante string `json:"tipo_comprobante" validate:"required"`
	RUCCliente      string `json:"ruc_cliente"`
	RazonSocial     string `json:"razon_social"`
	DireccionFiscal string `json:"direccion_fiscal"`
}

// AnularComprobanteRequest request para anular comprobante
type AnularComprobanteRequest struct {
	Motivo string `json:"motivo" validate:"required"`
}
