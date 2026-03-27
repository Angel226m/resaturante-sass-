package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: Role
// Verifica que el usuario tenga el rol requerido
// ==========================================

// RequiereRol middleware que verifica uno o más roles permitidos
func RequiereRol(rolesPermitidos ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		rol := ObtenerRol(c)
		if rol == "" {
			utils.Unauthorized(c, "Rol no identificado")
			c.Abort()
			return
		}

		permitido := false
		for _, r := range rolesPermitidos {
			if rol == r {
				permitido = true
				break
			}
		}

		if !permitido {
			utils.Forbidden(c, "No tiene permisos para esta acción")
			c.Abort()
			return
		}

		c.Next()
	}
}

// EsAdmin verifica que el usuario sea admin del tenant
func EsAdmin() gin.HandlerFunc {
	return RequiereRol("admin")
}

// EsAdminOGerente verifica admin o gerente
func EsAdminOGerente() gin.HandlerFunc {
	return RequiereRol("admin", "gerente")
}

// EsCajero verifica rol cajero (o superior)
func EsCajero() gin.HandlerFunc {
	return RequiereRol("admin", "gerente", "cajero")
}

// EsMesero verifica rol mesero (o superior)
func EsMesero() gin.HandlerFunc {
	return RequiereRol("admin", "gerente", "cajero", "mesero")
}

// EsCocinero verifica rol cocinero (o superior)
func EsCocinero() gin.HandlerFunc {
	return RequiereRol("admin", "gerente", "cocinero")
}

// EsRepartidor verifica rol repartidor (o superior)
func EsRepartidor() gin.HandlerFunc {
	return RequiereRol("admin", "gerente", "repartidor")
}

// EsPersonalInterno cualquier empleado del restaurante
func EsPersonalInterno() gin.HandlerFunc {
	return RequiereRol("admin", "gerente", "cajero", "mesero", "cocinero", "repartidor", "almacen")
}

// RequiereNivelSuperAdmin middleware para verificar nivel de superadmin
func RequiereNivelSuperAdmin(nivelesPermitidos ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		nivel := ObtenerNivelSuperAdmin(c)
		if nivel == "" {
			utils.Unauthorized(c, "Nivel de superadmin no identificado")
			c.Abort()
			return
		}

		permitido := false
		for _, n := range nivelesPermitidos {
			if nivel == n {
				permitido = true
				break
			}
		}

		if !permitido {
			utils.Forbidden(c, "No tiene permisos de superadmin suficientes")
			c.Abort()
			return
		}

		c.Next()
	}
}
