package rutas

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Órdenes (Órdenes, Items, Tickets Cocina)
// /api/v1/ordenes/...
// ==========================================

func registrarRutasOrdenes(autenticado *gin.RouterGroup, ordenesCtrl *controladores.OrdenesController) {
	ordenes := autenticado.Group("/ordenes")
	{
		ordenes.GET("", ordenesCtrl.ListarOrdenes)
		ordenes.GET("/:id", ordenesCtrl.ObtenerOrden)
		ordenes.POST("", middleware.RequiereRol("admin", "gerente", "mesero", "cajero"), ordenesCtrl.CrearOrden)
		ordenes.PATCH("/:id/estado", ordenesCtrl.CambiarEstadoOrden)
		ordenes.POST("/:id/items", ordenesCtrl.AgregarItemOrden)
		ordenes.GET("/activas/total", ordenesCtrl.ContarOrdenesActivas)
	}

	// Tickets cocina
	tickets := autenticado.Group("/cocina/tickets")
	{
		tickets.GET("", ordenesCtrl.ListarTicketsCocina)
		tickets.POST("", ordenesCtrl.CrearTicketCocina)
		tickets.PATCH("/:id/estado", middleware.RequiereRol("admin", "gerente", "cocinero"), ordenesCtrl.CambiarEstadoTicket)
	}
}
