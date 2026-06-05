package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"strings"
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
		requestID := c.GetString("request_id")

		c.Next()

		latencia := time.Since(inicio)
		status := c.Writer.Status()
		ip := c.ClientIP()

		if status >= 400 {
			log.Printf("[ERROR] [%s] %s %s → %d (%v) IP: %s RID: %s",
				metodo, ruta, c.Request.URL.RawQuery, status, latencia, ip, requestID)
		} else {
			log.Printf("[INFO] [%s] %s → %d (%v) IP: %s RID: %s",
				metodo, ruta, status, latencia, ip, requestID)
		}
	}
}

// ==========================================
// Middleware: SecurityHeaders (OWASP)
// Headers de seguridad en cada respuesta
// ==========================================

func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "0")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
		c.Header("Cross-Origin-Opener-Policy", "same-origin")
		c.Header("Cross-Origin-Resource-Policy", "same-origin")
		c.Header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
		c.Header("Pragma", "no-cache")
		if strings.EqualFold(c.GetHeader("X-Forwarded-Proto"), "https") || c.Request.TLS != nil {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		// Remove server identification
		c.Header("Server", "")
		c.Header("X-Powered-By", "")

		c.Next()
	}
}

// ==========================================
// Middleware: RequestID
// Genera un ID único por request para trazabilidad
// ==========================================

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			b := make([]byte, 16)
			if _, err := rand.Read(b); err != nil {
				b = []byte(time.Now().Format("20060102150405.000000"))
			}
			requestID = hex.EncodeToString(b)
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}
