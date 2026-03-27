package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: RateLimit
// Sliding window con Redis
// ==========================================

func RateLimit(redisClient *redis.Client, maxRequests int, ventana time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		if redisClient == nil {
			c.Next()
			return
		}

		ip := c.ClientIP()
		key := fmt.Sprintf("rl:%s:%s", c.Request.URL.Path, ip)
		ctx := context.Background()
		ahora := time.Now().UnixNano()

		pipe := redisClient.Pipeline()

		// Eliminar entradas fuera de la ventana
		pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", ahora-ventana.Nanoseconds()))

		// Agregar la solicitud actual
		pipe.ZAdd(ctx, key, redis.Z{Score: float64(ahora), Member: ahora})

		// Contar solicitudes en la ventana
		conteo := pipe.ZCard(ctx, key)

		// Establecer expiración
		pipe.Expire(ctx, key, ventana)

		_, err := pipe.Exec(ctx)
		if err != nil {
			// Si Redis falla, dejar pasar
			c.Next()
			return
		}

		if conteo.Val() > int64(maxRequests) {
			c.Header("Retry-After", fmt.Sprintf("%d", int(ventana.Seconds())))
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
			c.Header("X-RateLimit-Remaining", "0")
			utils.TooManyRequests(c, "Demasiadas solicitudes, intente más tarde")
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", int64(maxRequests)-conteo.Val()))
		c.Next()
	}
}

// RateLimitLogin rate limit específico para login (más restrictivo)
func RateLimitLogin(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimit(redisClient, 5, 15*time.Minute)
}

// RateLimitAPI rate limit general para API
func RateLimitAPI(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimit(redisClient, 100, 1*time.Minute)
}

// RateLimitSuperAdmin rate limit más permisivo para superadmin
func RateLimitSuperAdmin(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimit(redisClient, 200, 1*time.Minute)
}

// RateLimitWebhook rate limit para webhooks
func RateLimitWebhook(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimit(redisClient, 50, 1*time.Minute)
}

// RateLimitRecuperacion rate limit para recuperación de contraseña
func RateLimitRecuperacion(redisClient *redis.Client) gin.HandlerFunc {
	return RateLimit(redisClient, 3, 30*time.Minute)
}

// CheckBlacklist verifica IP en blacklist de Redis
func CheckBlacklist(redisClient *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		if redisClient == nil {
			c.Next()
			return
		}

		ip := c.ClientIP()
		ctx := context.Background()
		key := fmt.Sprintf("blacklist:%s", ip)

		existe, _ := redisClient.Exists(ctx, key).Result()
		if existe > 0 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"mensaje": "Acceso bloqueado",
			})
			return
		}

		c.Next()
	}
}
