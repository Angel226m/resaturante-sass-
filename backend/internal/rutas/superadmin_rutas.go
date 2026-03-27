package rutas

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: SuperAdmin (Plataforma)
// /api/v1/superadmin/...
// ==========================================

func registrarRutasSuperAdmin(api *gin.RouterGroup, db *sql.DB, rdb *redis.Client, plataformaCtrl *controladores.PlataformaController, authCtrl *controladores.AuthController) {
	sa := api.Group("/superadmin")
	sa.Use(middleware.RateLimitSuperAdmin(rdb))

	// Login superadmin (público)
	sa.POST("/login", authCtrl.LoginSuperAdmin)

	// Rutas protegidas superadmin
	protegido := sa.Group("")
	protegido.Use(middleware.AuthSuperAdmin(db))

	// Planes
	planes := protegido.Group("/planes")
	{
		planes.GET("", plataformaCtrl.ListarPlanes)
		planes.GET("/:id", plataformaCtrl.ObtenerPlan)
		planes.POST("", middleware.RequiereNivelSuperAdmin("full", "soporte"), plataformaCtrl.CrearPlan)
		planes.PUT("/:id", middleware.RequiereNivelSuperAdmin("full", "soporte"), plataformaCtrl.ActualizarPlan)
		planes.DELETE("/:id", middleware.RequiereNivelSuperAdmin("full"), plataformaCtrl.EliminarPlan)
	}

	// Tenants
	tenants := protegido.Group("/tenants")
	{
		tenants.GET("", plataformaCtrl.ListarTenants)
		tenants.GET("/:id", plataformaCtrl.ObtenerTenant)
		tenants.POST("", middleware.RequiereNivelSuperAdmin("full", "soporte"), plataformaCtrl.CrearTenant)
		tenants.PUT("/:id", middleware.RequiereNivelSuperAdmin("full", "soporte"), plataformaCtrl.ActualizarTenant)
		tenants.DELETE("/:id", middleware.RequiereNivelSuperAdmin("full"), plataformaCtrl.EliminarTenant)
	}

	// Suscripciones
	suscripciones := protegido.Group("/suscripciones")
	{
		suscripciones.GET("/:id", plataformaCtrl.ObtenerSuscripcion)
		suscripciones.POST("/:id/cambiar-plan", middleware.RequiereNivelSuperAdmin("full", "soporte"), plataformaCtrl.CambiarPlan)
	}

	// Facturas
	facturas := protegido.Group("/facturas")
	{
		facturas.GET("", plataformaCtrl.ListarFacturas)
	}
}
