package middleware

import (
	"log"
	"net/http"
	"os"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: ErrorHandler (OWASP Hardened)
// Recupera panics sin exponer detalles internos
// ==========================================

func ErrorHandler() gin.HandlerFunc {
	isProduction := os.Getenv("ENV") == "production"

	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log completo internamente
				log.Printf("[PANIC] %v\n%s", err, debug.Stack())

				// Nunca exponer stack traces al cliente (OWASP A09)
				utils.InternalError(c, "Error interno del servidor", nil)
				c.Abort()
			}
		}()
		c.Next()

		// Si hubo errores en el contexto sin manejar
		if len(c.Errors) > 0 {
			lastErr := c.Errors.Last()
			log.Printf("[ERROR] %s %s → %v", c.Request.Method, c.Request.URL.Path, lastErr.Err)

			if c.Writer.Status() == http.StatusOK {
				if isProduction {
					// En producción, no exponer detalles del error
					utils.InternalError(c, "Error interno del servidor", nil)
				} else {
					utils.InternalError(c, lastErr.Error(), lastErr.Err)
				}
			}
		}
	}
}
