package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// ==========================================
// Middleware: Logger
// Registra método, ruta, status, latencia, IP
// ==========================================

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		inicio := time.Now()
		ruta := c.Request.URL.Path
		metodo := c.Request.Method

		c.Next()

		latencia := time.Since(inicio)
		status := c.Writer.Status()
		ip := c.ClientIP()

		if status >= 400 {
			log.Printf("[ERROR] [%s] %s %s → %d (%v) IP: %s", metodo, ruta, c.Request.URL.RawQuery, status, latencia, ip)
		} else {
			log.Printf("[INFO] [%s] %s → %d (%v) IP: %s", metodo, ruta, status, latencia, ip)
		}
	}
}
