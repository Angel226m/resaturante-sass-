package reportes

import "time"

// ==========================================
// Entidad: ResumenDiario + AuditLog
// RestauFlow SaaS Multi-Tenant
// ==========================================

// ResumenDiario snapshot diario para dashboard rápido (tabla: resumen_diario)
type ResumenDiario struct {
	ID                         int64     `json:"id"                             db:"id"`
	TenantID                   string    `json:"tenant_id"                      db:"tenant_id"`
	LocalID                    *int      `json:"local_id,omitempty"             db:"local_id"`
	Fecha                      time.Time `json:"fecha"                          db:"fecha"`
	TotalVentas                float64   `json:"total_ventas"                   db:"total_ventas"`
	NumeroOrdenes              int       `json:"numero_ordenes"                 db:"numero_ordenes"`
	NumeroOrdenesMesa          int       `json:"numero_ordenes_mesa"            db:"numero_ordenes_mesa"`
	NumeroOrdenesDelivery      int       `json:"numero_ordenes_delivery"        db:"numero_ordenes_delivery"`
	NumeroOrdenesLlevar        int       `json:"numero_ordenes_llevar"          db:"numero_ordenes_llevar"`
	TicketPromedio             float64   `json:"ticket_promedio"                db:"ticket_promedio"`
	TotalPropinas              float64   `json:"total_propinas"                 db:"total_propinas"`
	TotalDescuentos            float64   `json:"total_descuentos"              db:"total_descuentos"`
	ClientesNuevos             int       `json:"clientes_nuevos"                db:"clientes_nuevos"`
	ProductoMasVendidoID       *int64    `json:"producto_mas_vendido_id,omitempty" db:"producto_mas_vendido_id"`
	CantidadProductoMasVendido int       `json:"cantidad_producto_mas_vendido"  db:"cantidad_producto_mas_vendido"`
	CreatedAt                  time.Time `json:"created_at"                     db:"created_at"`
	UpdatedAt                  time.Time `json:"updated_at"                     db:"updated_at"`
}

// AuditLog registro de auditoría inmutable (tabla: audit_log)
type AuditLog struct {
	ID              int64     `json:"id"                            db:"id"`
	TenantID        *string   `json:"tenant_id,omitempty"           db:"tenant_id"`
	UsuarioID       *int      `json:"usuario_id,omitempty"          db:"usuario_id"`
	SuperAdminID    *int      `json:"superadmin_id,omitempty"       db:"superadmin_id"`
	Accion          string    `json:"accion"                        db:"accion"`
	TablaAfectada   *string   `json:"tabla_afectada,omitempty"      db:"tabla_afectada"`
	RegistroID      *string   `json:"registro_id,omitempty"         db:"registro_id"`
	DatosAnteriores *string   `json:"datos_anteriores,omitempty"    db:"datos_anteriores"`
	DatosNuevos     *string   `json:"datos_nuevos,omitempty"        db:"datos_nuevos"`
	IPOrigen        *string   `json:"ip_origen,omitempty"           db:"ip_origen"`
	UserAgent       *string   `json:"user_agent,omitempty"          db:"user_agent"`
	MetodoHTTP      *string   `json:"metodo_http,omitempty"         db:"metodo_http"`
	Path            *string   `json:"path,omitempty"                db:"path"`
	StatusCode      *int      `json:"status_code,omitempty"         db:"status_code"`
	DuracionMs      *int      `json:"duracion_ms,omitempty"         db:"duracion_ms"`
	CreatedAt       time.Time `json:"created_at"                    db:"created_at"`
}

// ==========================================
// DTOs y Filtros
// ==========================================

// FiltrosAuditLog filtros para listar audit logs
type FiltrosAuditLog struct {
	UsuarioID  *int64 `json:"usuario_id"`
	Accion     string `json:"accion"`
	Tabla      string `json:"tabla"`
	FechaDesde string `json:"fecha_desde"`
	FechaHasta string `json:"fecha_hasta"`
	Pagina     int    `json:"pagina"`
	PorPagina  int    `json:"por_pagina"`
}

// FiltrosResumenDiario filtros para listar resúmenes diarios
type FiltrosResumenDiario struct {
	LocalID    int    `json:"local_id"`
	FechaDesde string `json:"fecha_desde"`
	FechaHasta string `json:"fecha_hasta"`
}

// DashboardResumen resumen general para dashboard
type DashboardResumen struct {
	// KPIs principales
	VentasHoy       float64 `json:"ventas_hoy"`
	VentasAyer      float64 `json:"ventas_ayer"`
	CrecimientoPorc float64 `json:"crecimiento_porc"` // % crecimiento vs ayer
	OrdenesHoy      int     `json:"ordenes_hoy"`
	TicketPromedio  float64 `json:"ticket_promedio"`

	// Estado en tiempo real
	OrdenesActivas int     `json:"ordenes_activas"`
	MesasOcupadas  int     `json:"mesas_ocupadas"`
	TotalMesas     int     `json:"total_mesas"`
	OcupacionPorc  float64 `json:"ocupacion_porc"` // % ocupación mesas
	ReservasHoy    int     `json:"reservas_hoy"`
	ClientesHoy    int     `json:"clientes_hoy"`

	// Ventas por período
	VentasSemana float64 `json:"ventas_semana"`
	VentasMes    float64 `json:"ventas_mes"`

	// Rankings
	ProductosMasVendidos []ProductoVendido   `json:"productos_mas_vendidos"`
	VentasPorHora        []VentaPorHora      `json:"ventas_por_hora"`
	VentasPorCategoria   []VentaPorCategoria `json:"ventas_por_categoria"`

	// Ordenes por tipo
	OrdenesMesa       int `json:"ordenes_mesa"`
	OrdenesDelivery   int `json:"ordenes_delivery"`
	OrdenesParaLlevar int `json:"ordenes_para_llevar"`
}

// VentaPorCategoria ventas agrupadas por categoría de menú
type VentaPorCategoria struct {
	CategoriaID int64   `json:"categoria_id"`
	Nombre      string  `json:"nombre"`
	Total       float64 `json:"total"`
	Cantidad    int     `json:"cantidad"`
}

// ProductoVendido producto más vendido del día
type ProductoVendido struct {
	ProductoID int64   `json:"producto_id"`
	Nombre     string  `json:"nombre"`
	Cantidad   int     `json:"cantidad"`
	Total      float64 `json:"total"`
}

// VentaPorHora ventas agrupadas por hora
type VentaPorHora struct {
	Hora  int     `json:"hora"`
	Total float64 `json:"total"`
	Count int     `json:"cantidad"`
}
