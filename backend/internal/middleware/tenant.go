package middleware

import (
	"database/sql"
	"log"
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
		var activo bool
		var deletedAt *time.Time
		err := db.QueryRow(
			"SELECT activo, deleted_at FROM tenants WHERE id = $1",
			tenantID,
		).Scan(&activo, &deletedAt)

		if err != nil {
			log.Printf("[ERROR] Tenant no encontrado: %s - %v", tenantID, err)
			utils.Unauthorized(c, "Tenant no encontrado")
			c.Abort()
			return
		}

		if !activo || deletedAt != nil {
			utils.Forbidden(c, "Tenant suspendido o eliminado")
			c.Abort()
			return
		}

		// Guardar para uso posterior en transacciones
		c.Set("tenant_id", tenantID)
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
