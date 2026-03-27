package plataforma

import "time"

// ==========================================
// Entidad: Plan de suscripción
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Plan representa un plan de suscripción de la plataforma
type Plan struct {
	ID                       int       `json:"id_plan"                        db:"id"`
	Nombre                   string    `json:"nombre"                         db:"nombre"`
	Descripcion              string    `json:"descripcion,omitempty"          db:"descripcion"`
	PrecioMensual            float64   `json:"precio_mensual"                 db:"precio_mensual"`
	PrecioAnual              *float64  `json:"precio_anual,omitempty"         db:"precio_anual"`
	MaxUsuarios              *int      `json:"max_usuarios,omitempty"         db:"max_usuarios"`
	MaxLocales               int       `json:"max_locales"                    db:"max_locales"`
	MaxMesas                 int       `json:"max_mesas"                      db:"max_mesas"`
	MaxProductosMenu         *int      `json:"max_productos_menu,omitempty"   db:"max_productos_menu"`
	MaxStorageMB             int       `json:"max_storage_mb"                 db:"max_storage_mb"`
	TieneDelivery            bool      `json:"tiene_delivery"                 db:"tiene_delivery"`
	TieneReservas            bool      `json:"tiene_reservas"                 db:"tiene_reservas"`
	TieneCocinaPantalla      bool      `json:"tiene_cocina_pantalla"          db:"tiene_cocina_pantalla"`
	TieneMultiLocal          bool      `json:"tiene_multi_local"              db:"tiene_multi_local"`
	TieneInventarioAvanzado  bool      `json:"tiene_inventario_avanzado"      db:"tiene_inventario_avanzado"`
	TieneRecetas             bool      `json:"tiene_recetas"                  db:"tiene_recetas"`
	TieneCombos              bool      `json:"tiene_combos"                   db:"tiene_combos"`
	TienePromociones         bool      `json:"tiene_promociones"              db:"tiene_promociones"`
	TienePuntosFidelidad     bool      `json:"tiene_puntos_fidelidad"         db:"tiene_puntos_fidelidad"`
	TieneReportesAvanzados   bool      `json:"tiene_reportes_avanzados"       db:"tiene_reportes_avanzados"`
	TieneWebsockets          bool      `json:"tiene_websockets"               db:"tiene_websockets"`
	TieneAPIAccess           bool      `json:"tiene_api_access"               db:"tiene_api_access"`
	TieneQRMesa              bool      `json:"tiene_qr_mesa"                  db:"tiene_qr_mesa"`
	TieneFacturacionSunat    bool      `json:"tiene_facturacion_sunat"        db:"tiene_facturacion_sunat"`
	OrdenDisplay             int       `json:"orden_display"                  db:"orden_display"`
	EsPopular                bool      `json:"es_popular"                     db:"es_popular"`
	Activo                   bool      `json:"activo"                         db:"activo"`
	CreatedAt                time.Time `json:"created_at"                     db:"created_at"`
	UpdatedAt                time.Time `json:"updated_at"                     db:"updated_at"`
}

// CaracteristicaPlan es una línea descriptiva del plan
type CaracteristicaPlan struct {
	ID          int    `json:"id_caracteristica"  db:"id"`
	PlanID      int    `json:"plan_id"            db:"plan_id"`
	Descripcion string `json:"descripcion"        db:"descripcion"`
	Incluido    bool   `json:"incluido"           db:"incluido"`
	Orden       int    `json:"orden"              db:"orden"`
}

// NuevoPlanRequest request para crear un plan
type NuevoPlanRequest struct {
	Nombre        string  `json:"nombre"         validate:"required,min=2,max=50"`
	Descripcion   string  `json:"descripcion"`
	PrecioMensual float64 `json:"precio_mensual" validate:"required,gt=0"`
	PrecioAnual   float64 `json:"precio_anual"`
	MaxUsuarios   *int    `json:"max_usuarios"`
	MaxLocales    int     `json:"max_locales"`
	MaxMesas      int     `json:"max_mesas"`
}

// ActualizarPlanRequest request para actualizar un plan
type ActualizarPlanRequest struct {
	Nombre        string  `json:"nombre"`
	Descripcion   string  `json:"descripcion"`
	PrecioMensual float64 `json:"precio_mensual"`
	PrecioAnual   float64 `json:"precio_anual"`
	Activo        *bool   `json:"activo"`
}
