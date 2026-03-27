package middleware

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: Auth
// Valida JWT access token de HttpOnly cookie
// ==========================================

func Auth(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Obtener token de cookie HttpOnly
		token, err := c.Cookie("access_token")
		if err != nil || token == "" {
			// Intentar desde header Authorization como fallback
			auth := c.GetHeader("Authorization")
			if auth != "" && strings.HasPrefix(auth, "Bearer ") {
				token = strings.TrimPrefix(auth, "Bearer ")
			}
		}

		if token == "" {
			utils.Unauthorized(c, "Token de acceso requerido")
			c.Abort()
			return
		}

		// 2. Validar token
		claims, err := utils.ValidarAccessToken(token)
		if err != nil {
			utils.Unauthorized(c, "Token inválido o expirado")
			c.Abort()
			return
		}

		// 3. Verificar que el usuario existe y está activo
		var activo bool
		var deletedAt *time.Time
		err = db.QueryRow(
			"SELECT activo, deleted_at FROM usuarios WHERE id = $1 AND tenant_id = $2",
			claims.UserID, claims.TenantID,
		).Scan(&activo, &deletedAt)

		if err != nil {
			utils.Unauthorized(c, "Usuario no encontrado")
			c.Abort()
			return
		}

		if !activo || deletedAt != nil {
			utils.Forbidden(c, "Usuario desactivado")
			c.Abort()
			return
		}

		// 4. Setear datos en contexto
		c.Set("usuario_id", claims.UserID)
		c.Set("tenant_id", claims.TenantID)
		c.Set("rol", claims.Rol)
		c.Set("local_id", claims.LocalID)

		c.Next()
	}
}

// AuthSuperAdmin middleware de autenticación para superadmins
func AuthSuperAdmin(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("sa_access_token")
		if err != nil || token == "" {
			auth := c.GetHeader("Authorization")
			if auth != "" && strings.HasPrefix(auth, "Bearer ") {
				token = strings.TrimPrefix(auth, "Bearer ")
			}
		}

		if token == "" {
			utils.Unauthorized(c, "Token de superadmin requerido")
			c.Abort()
			return
		}

		claims, err := utils.ValidarAccessTokenSuperAdmin(token)
		if err != nil {
			utils.Unauthorized(c, "Token inválido o expirado")
			c.Abort()
			return
		}

		// Verificar que superadmin existe y está activo
		var activo bool
		err = db.QueryRow(
			"SELECT activo FROM superadmins WHERE id = $1",
			claims.SuperAdminID,
		).Scan(&activo)

		if err != nil || !activo {
			utils.Unauthorized(c, "SuperAdmin no encontrado o inactivo")
			c.Abort()
			return
		}

		c.Set("superadmin_id", claims.SuperAdminID)
		c.Set("nivel", claims.Nivel)

		c.Next()
	}
}

// AuthRefresh middleware para validar refresh token
func AuthRefresh(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("refresh_token")
		if err != nil || token == "" {
			utils.Unauthorized(c, "Refresh token requerido")
			c.Abort()
			return
		}

		subject, tenantID, err := utils.ValidarRefreshToken(token)
		if err != nil {
			utils.Unauthorized(c, "Refresh token inválido o expirado")
			c.Abort()
			return
		}

		c.Set("refresh_subject", subject)
		c.Set("refresh_tenant_id", tenantID)

		c.Next()
	}
}

// ObtenerUsuarioID helper para obtener usuario_id del contexto
func ObtenerUsuarioID(c *gin.Context) int64 {
	id, _ := c.Get("usuario_id")
	if v, ok := id.(int64); ok {
		return v
	}
	return 0
}

// ObtenerTenantID helper para obtener tenant_id del contexto
func ObtenerTenantID(c *gin.Context) string {
	id, _ := c.Get("tenant_id")
	if v, ok := id.(string); ok {
		return v
	}
	return ""
}

// ObtenerRol helper para obtener rol del contexto
func ObtenerRol(c *gin.Context) string {
	rol, _ := c.Get("rol")
	if v, ok := rol.(string); ok {
		return v
	}
	return ""
}

// ObtenerLocalID helper para obtener local_id del contexto
func ObtenerLocalID(c *gin.Context) int {
	id, _ := c.Get("local_id")
	if v, ok := id.(int); ok {
		return v
	}
	return 0
}

// ObtenerSuperAdminID helper para obtener superadmin_id
func ObtenerSuperAdminID(c *gin.Context) int {
	id, _ := c.Get("superadmin_id")
	if v, ok := id.(int); ok {
		return v
	}
	return 0
}

// ObtenerNivelSuperAdmin helper para obtener nivel de superadmin
func ObtenerNivelSuperAdmin(c *gin.Context) string {
	nivel, _ := c.Get("nivel")
	if v, ok := nivel.(string); ok {
		return v
	}
	return ""
}

// RequireHTTPS fuerza HTTPS en producción
func RequireHTTPS() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetHeader("X-Forwarded-Proto") == "http" {
			target := "https://" + c.Request.Host + c.Request.URL.String()
			c.Redirect(http.StatusMovedPermanently, target)
			c.Abort()
			return
		}
		c.Next()
	}
}
