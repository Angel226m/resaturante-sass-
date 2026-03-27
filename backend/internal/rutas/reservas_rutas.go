package rutas

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Reservas
// /api/v1/reservas/...
// ==========================================

func registrarRutasReservas(autenticado *gin.RouterGroup, reservasCtrl *controladores.ReservasController) {
	reservas := autenticado.Group("/reservas")
	reservas.Use(middleware.RequiereFeature("reservas"))
	{
		reservas.GET("", reservasCtrl.ListarReservas)
		reservas.GET("/:id", reservasCtrl.ObtenerReserva)
		reservas.POST("", reservasCtrl.CrearReserva)
		reservas.PATCH("/:id/estado", reservasCtrl.CambiarEstadoReserva)
		reservas.POST("/disponibilidad", reservasCtrl.ConsultarDisponibilidad)
		reservas.GET("/hoy/total", reservasCtrl.ContarReservasHoy)
	}
}
