package rutas

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Caja (Turnos, Métodos Pago, Pagos, Comprobantes)
// /api/v1/caja/...
// ==========================================

func registrarRutasCaja(autenticado *gin.RouterGroup, cajaCtrl *controladores.CajaController) {
	caja := autenticado.Group("/caja")
	caja.Use(middleware.RequiereRol("admin", "gerente", "cajero"))

	// Turnos
	turnos := caja.Group("/turnos")
	{
		turnos.GET("/activo", cajaCtrl.ObtenerTurnoActivo)
		turnos.POST("/abrir", cajaCtrl.AbrirTurno)
		turnos.POST("/:id/cerrar", cajaCtrl.CerrarTurno)
		turnos.GET("/:id/resumen", cajaCtrl.ObtenerResumenTurno)
	}

	// Métodos de pago
	metodos := caja.Group("/metodos-pago")
	{
		metodos.GET("", cajaCtrl.ListarMetodosPago)
		metodos.POST("", middleware.EsAdminOGerente(), cajaCtrl.CrearMetodoPago)
	}

	// Pagos
	pagos := caja.Group("/pagos")
	{
		pagos.POST("/turno/:turnoId", cajaCtrl.CrearPago)
		pagos.POST("/:id/anular", middleware.EsAdminOGerente(), cajaCtrl.AnularPago)
		pagos.GET("/turno/:turnoId", cajaCtrl.ListarPagosPorTurno)
	}

	// Comprobantes
	comprobantes := caja.Group("/comprobantes")
	{
		comprobantes.POST("", cajaCtrl.CrearComprobante)
		comprobantes.POST("/:id/anular", middleware.EsAdminOGerente(), cajaCtrl.AnularComprobante)
	}
}
