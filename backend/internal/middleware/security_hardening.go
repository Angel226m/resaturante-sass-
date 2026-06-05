package middleware

import (
	"net"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// MaxBodyBytes limits request bodies to reduce DoS risk on JSON/form endpoints.
func MaxBodyBytes(maxBytes int64) gin.HandlerFunc {
	if maxBytes <= 0 {
		maxBytes = 1048576 // 1MB default
	}

	return func(c *gin.Context) {
		if c.Request.ContentLength > maxBytes {
			utils.ErrorResponse(c, http.StatusRequestEntityTooLarge, "request demasiado grande", nil)
			c.Abort()
			return
		}

		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		c.Next()
	}
}

// ValidateHost blocks requests with unexpected Host values to prevent host header abuse.
func ValidateHost(allowedHosts []string) gin.HandlerFunc {
	allowed := make(map[string]struct{}, len(allowedHosts))
	for _, host := range allowedHosts {
		h := strings.ToLower(strings.TrimSpace(host))
		if h != "" {
			allowed[h] = struct{}{}
		}
	}

	return func(c *gin.Context) {
		if len(allowed) == 0 {
			c.Next()
			return
		}

		host := strings.ToLower(strings.TrimSpace(c.Request.Host))
		if host == "" {
			utils.BadRequest(c, "host inválido")
			c.Abort()
			return
		}

		if parsedHost, _, err := net.SplitHostPort(host); err == nil {
			host = parsedHost
		}

		if _, ok := allowed[host]; !ok {
			utils.BadRequest(c, "host no permitido")
			c.Abort()
			return
		}

		c.Next()
	}
}
