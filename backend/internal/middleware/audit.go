package middleware

import (
	"database/sql"
	"encoding/json"
	"log"

	"github.com/gin-gonic/gin"
)

// ==========================================
// Middleware: Audit
// Registra acciones importantes en audit_log
// ==========================================

func Audit(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Solo auditar si la operación fue exitosa (2xx)
		status := c.Writer.Status()
		if status < 200 || status >= 300 {
			return
		}

		// Solo auditar métodos que modifican datos
		metodo := c.Request.Method
		if metodo == "GET" || metodo == "OPTIONS" || metodo == "HEAD" {
			return
		}

		// Obtener datos del contexto
		tenantID := ObtenerTenantID(c)
		usuarioID := ObtenerUsuarioID(c)
		superAdminID := ObtenerSuperAdminID(c)

		// Obtener datos de auditoría seteados por el controlador
		accion, _ := c.Get("audit_accion")
		tabla, _ := c.Get("audit_tabla")
		registroID, _ := c.Get("audit_registro_id")
		datosAnteriores, _ := c.Get("audit_datos_anteriores")
		datosNuevos, _ := c.Get("audit_datos_nuevos")

		if accion == nil || tabla == nil {
			return
		}

		// Serializar datos
		var datosAntStr, datosNuevStr *string
		if datosAnteriores != nil {
			b, _ := json.Marshal(datosAnteriores)
			s := string(b)
			datosAntStr = &s
		}
		if datosNuevos != nil {
			b, _ := json.Marshal(datosNuevos)
			s := string(b)
			datosNuevStr = &s
		}

		var regIDStr string
		if registroID != nil {
			regIDStr = registroID.(string)
		}

		ip := c.ClientIP()
		userAgent := c.Request.UserAgent()

		// Insertar registro de auditoría
		var queryUsuarioID *int64
		var querySuperAdminID *int
		if usuarioID > 0 {
			queryUsuarioID = &usuarioID
		}
		if superAdminID > 0 {
			querySuperAdminID = &superAdminID
		}

		_, err := db.Exec(`
			INSERT INTO audit_log (tenant_id, usuario_id, superadmin_id, accion, tabla, registro_id,
				datos_anteriores, datos_nuevos, ip, user_agent)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`,
			tenantID, queryUsuarioID, querySuperAdminID,
			accion, tabla, regIDStr,
			datosAntStr, datosNuevStr,
			ip, userAgent,
		)

		if err != nil {
			log.Printf("[ERROR] Error al crear audit_log: %v", err)
		}
	}
}

// SetAuditInfo helper para setear datos de auditoría desde controlador
func SetAuditInfo(c *gin.Context, accion, tabla, registroID string, datosAnteriores, datosNuevos interface{}) {
	c.Set("audit_accion", accion)
	c.Set("audit_tabla", tabla)
	c.Set("audit_registro_id", registroID)
	if datosAnteriores != nil {
		c.Set("audit_datos_anteriores", datosAnteriores)
	}
	if datosNuevos != nil {
		c.Set("audit_datos_nuevos", datosNuevos)
	}
}
