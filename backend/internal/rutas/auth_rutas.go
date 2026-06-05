package rutas

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Auth (Login público + operaciones privadas)
// ==========================================

func registrarRutasAuthPublico(api *gin.RouterGroup, db *sql.DB, rdb *redis.Client, authCtrl *controladores.AuthController) {
	auth := api.Group("/auth")

	// Login con credenciales (rate limited)
	auth.POST("/login", middleware.TenantFromRequest(db), middleware.Tenant(db), middleware.RateLimitLogin(rdb), authCtrl.Login)

	// Login con PIN (rate limited)
	auth.POST("/login-pin", middleware.TenantFromRequest(db), middleware.Tenant(db), middleware.RateLimitLogin(rdb), authCtrl.LoginPIN)

	// Refresh token (no usa Tenant porque AuthRefresh setea tenant_id en contexto)
	auth.POST("/refresh", middleware.AuthRefresh(db), authCtrl.RefrescarToken)

	// Logout (no requiere auth estricto)
	auth.POST("/logout", authCtrl.Logout)

	// Recuperación de contraseña
	auth.POST("/recuperar-password", middleware.TenantFromRequest(db), middleware.Tenant(db), middleware.RateLimitRecuperacion(rdb), authCtrl.SolicitarRecuperacion)
	auth.POST("/resetear-password", middleware.TenantFromRequest(db), middleware.Tenant(db), authCtrl.RecuperarContrasena)
}

func registrarRutasAuthPrivado(autenticado *gin.RouterGroup, authCtrl *controladores.AuthController) {
	auth := autenticado.Group("/auth")

	// Mi perfil
	auth.GET("/perfil", authCtrl.MiPerfil)

	// Gestión de usuarios (admin)
	usuarios := auth.Group("/usuarios")
	usuarios.Use(middleware.EsAdmin())
	{
		usuarios.GET("", authCtrl.ListarUsuarios)
		usuarios.GET("/:id", authCtrl.ObtenerUsuario)
		usuarios.POST("", authCtrl.CrearUsuario)
		usuarios.PUT("/:id", authCtrl.ActualizarUsuario)
		usuarios.DELETE("/:id", authCtrl.EliminarUsuario)
	}
}
