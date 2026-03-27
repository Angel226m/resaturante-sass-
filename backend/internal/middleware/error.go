package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: ErrorHandler
// Recupera panics y errores no controlados
// ==========================================

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC] %v\n%s", err, debug.Stack())
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
				utils.InternalError(c, lastErr.Error(), lastErr.Err)
			}
		}
	}
}
