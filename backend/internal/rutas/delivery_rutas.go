package rutas

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Delivery (Zonas, Delivery Órdenes, Seguimiento)
// /api/v1/delivery/...
// ==========================================

func registrarRutasDelivery(autenticado *gin.RouterGroup, deliveryCtrl *controladores.DeliveryController) {
	delivery := autenticado.Group("/delivery")
	delivery.Use(middleware.RequiereFeature("delivery"))

	// Zonas de delivery
	zonas := delivery.Group("/zonas")
	{
		zonas.GET("", deliveryCtrl.ListarZonas)
		zonas.POST("", middleware.EsAdminOGerente(), deliveryCtrl.CrearZona)
		zonas.PUT("/:id", middleware.EsAdminOGerente(), deliveryCtrl.ActualizarZona)
		zonas.DELETE("/:id", middleware.EsAdminOGerente(), deliveryCtrl.EliminarZona)
	}

	// Órdenes de delivery
	ordenes := delivery.Group("/ordenes")
	{
		ordenes.GET("", deliveryCtrl.ListarDeliveryOrdenes)
		ordenes.GET("/:id", deliveryCtrl.ObtenerDeliveryOrden)
		ordenes.POST("", middleware.RequiereRol("admin", "gerente", "cajero"), deliveryCtrl.CrearDeliveryOrden)
		ordenes.POST("/:id/asignar", middleware.EsAdminOGerente(), deliveryCtrl.AsignarRepartidor)
		ordenes.PATCH("/:id/estado", deliveryCtrl.ActualizarEstadoDelivery)
		ordenes.GET("/:id/seguimiento", deliveryCtrl.ObtenerSeguimiento)
	}
}
