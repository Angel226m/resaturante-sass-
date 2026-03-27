package rutas

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Locales, Zonas, Mesas, Configuración
// /api/v1/locales/...
// ==========================================

func registrarRutasLocales(autenticado *gin.RouterGroup, db *sql.DB, localCtrl *controladores.LocalController) {
	locales := autenticado.Group("/locales")
	locales.Use(middleware.Audit(db))
	{
		locales.GET("", localCtrl.ListarLocales)
		locales.GET("/:id", localCtrl.ObtenerLocal)
		locales.POST("", middleware.EsAdmin(), localCtrl.CrearLocal)
		locales.PUT("/:id", middleware.EsAdmin(), localCtrl.ActualizarLocal)
		locales.DELETE("/:id", middleware.EsAdmin(), localCtrl.EliminarLocal)
	}

	// Zonas de un local
	zonas := autenticado.Group("/zonas")
	zonas.Use(middleware.Audit(db))
	{
		zonas.GET("", localCtrl.ListarZonas)
		zonas.POST("", middleware.EsAdminOGerente(), localCtrl.CrearZona)
		zonas.PUT("/:id", middleware.EsAdminOGerente(), localCtrl.ActualizarZona)
		zonas.DELETE("/:id", middleware.EsAdminOGerente(), localCtrl.EliminarZona)
	}

	// Mesas
	mesas := autenticado.Group("/mesas")
	mesas.Use(middleware.Audit(db))
	{
		mesas.GET("", localCtrl.ListarMesas)
		mesas.POST("", middleware.EsAdminOGerente(), localCtrl.CrearMesa)
		mesas.PUT("/:id", middleware.EsAdminOGerente(), localCtrl.ActualizarMesa)
		mesas.DELETE("/:id", middleware.EsAdminOGerente(), localCtrl.EliminarMesa)
		mesas.PATCH("/:id/estado", localCtrl.CambiarEstadoMesa)
	}

	// Configuración del restaurante
	config := autenticado.Group("/configuracion")
	config.Use(middleware.Audit(db))
	{
		config.GET("", localCtrl.ObtenerConfiguracion)
		config.PUT("", middleware.EsAdmin(), localCtrl.ActualizarConfiguracion)
	}
}
