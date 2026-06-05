package middleware

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: Tenant
// SET LOCAL app.tenant_id para RLS en PostgreSQL
// ==========================================

func Tenant(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := ObtenerTenantID(c)
		if tenantID == "" {
			utils.Unauthorized(c, "Tenant no identificado")
			c.Abort()
			return
		}

		// Verificar que el tenant existe y está activo
		var estado string
		var deletedAt *time.Time
		err := db.QueryRow(
			"SELECT estado, deleted_at FROM tenants WHERE id = $1",
			tenantID,
		).Scan(&estado, &deletedAt)

		if err != nil {
			log.Printf("[ERROR] Tenant no encontrado: %s - %v", tenantID, err)
			utils.Unauthorized(c, "Tenant no encontrado")
			c.Abort()
			return
		}

		if estado != "activo" || deletedAt != nil {
			utils.Forbidden(c, "Tenant suspendido o eliminado")
			c.Abort()
			return
		}

		// Guardar para uso posterior en transacciones
		c.Set("tenant_id", tenantID)
		c.Next()
	}
}

// TenantFromRequest resuelve tenant_id desde headers/query/body para rutas publicas.
// Soporta tanto slug (la-buena-mesa) como UUID del tenant.
func TenantFromRequest(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if existing := strings.TrimSpace(ObtenerTenantID(c)); existing != "" {
			c.Next()
			return
		}

		candidate := strings.TrimSpace(c.GetHeader("X-Tenant-ID"))
		if candidate == "" {
			candidate = strings.TrimSpace(c.GetHeader("X-Tenant-Slug"))
		}
		if candidate == "" {
			candidate = strings.TrimSpace(c.Query("tenant_id"))
		}
		if candidate == "" {
			candidate = strings.TrimSpace(c.Query("tenant_slug"))
		}
		if candidate == "" {
			candidate = strings.TrimSpace(c.Query("slug"))
		}

		if candidate == "" && (c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH") {
			body, err := io.ReadAll(c.Request.Body)
			if err == nil {
				c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
				if len(body) > 0 {
					var payload map[string]any
					if json.Unmarshal(body, &payload) == nil {
						if v, ok := payload["tenant_id"].(string); ok {
							candidate = strings.TrimSpace(v)
						}
						if candidate == "" {
							if v, ok := payload["tenant_slug"].(string); ok {
								candidate = strings.TrimSpace(v)
							}
						}
						if candidate == "" {
							if v, ok := payload["slug"].(string); ok {
								candidate = strings.TrimSpace(v)
							}
						}
					}
				}
			}
		}

		if candidate != "" {
			var tenantID string
			err := db.QueryRow(`
				SELECT id::text
				FROM tenants
				WHERE (id::text = $1 OR slug = $1)
				  AND deleted_at IS NULL
				LIMIT 1
			`, candidate).Scan(&tenantID)
			if err == nil {
				c.Set("tenant_id", tenantID)
			}
		}

		c.Next()
	}
}

// SetTenantEnTransaccion establece el tenant_id en una transacción SQL para RLS
func SetTenantEnTransaccion(tx *sql.Tx, tenantID string) error {
	_, err := tx.Exec("SET LOCAL app.tenant_id = $1", tenantID)
	if err != nil {
		log.Printf("[ERROR] No se pudo establecer tenant_id en transacción: %v", err)
	}
	return err
}

// SetTenantEnConexion establece el tenant_id en una conexión SQL para RLS
func SetTenantEnConexion(db *sql.DB, tenantID string) (*sql.Tx, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec("SET LOCAL app.tenant_id = $1", tenantID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	return tx, nil
}
