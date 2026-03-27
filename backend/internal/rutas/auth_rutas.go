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
	auth.Use(middleware.Tenant(db))

	// Login con credenciales (rate limited)
	auth.POST("/login", middleware.RateLimitLogin(rdb), authCtrl.Login)

	// Login con PIN (rate limited)
	auth.POST("/login-pin", middleware.RateLimitLogin(rdb), authCtrl.LoginPIN)

	// Refresh token
	auth.POST("/refresh", middleware.AuthRefresh(db), authCtrl.RefrescarToken)

	// Logout (no requiere auth estricto)
	auth.POST("/logout", authCtrl.Logout)

	// Recuperación de contraseña
	auth.POST("/recuperar-password", middleware.RateLimitRecuperacion(rdb), authCtrl.SolicitarRecuperacion)
	auth.POST("/resetear-password", authCtrl.RecuperarContrasena)
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
