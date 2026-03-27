package middleware

import (
	"database/sql"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Middleware: Plan
// Verifica que el tenant tenga plan activo
// y que no haya excedido límites del plan
// ==========================================

// PlanInfo información del plan del tenant en contexto
type PlanInfo struct {
	PlanID            int
	NombrePlan        string
	MaxLocales        int
	MaxUsuarios       *int
	MaxProductosMenu  *int
	PermiteReservas   bool
	PermiteDelivery   bool
	PermiteMultiLocal bool
	PermiteReportes   bool
	PermiteAPI        bool
}

func Plan(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := ObtenerTenantID(c)
		if tenantID == "" {
			utils.Unauthorized(c, "Tenant no identificado")
			c.Abort()
			return
		}

		// Obtener suscripción activa y plan
		var planInfo PlanInfo
		err := db.QueryRow(`
			SELECT p.id, p.nombre, p.max_locales, p.max_usuarios, p.max_productos_menu,
				   p.tiene_reservas, p.tiene_delivery,
				   p.tiene_multi_local, p.tiene_reportes_avanzados, p.tiene_api_access
			FROM suscripciones s
			JOIN planes p ON p.id = s.plan_id
			WHERE s.tenant_id = $1
			  AND s.estado IN ('activa','trial')
			ORDER BY s.created_at DESC
			LIMIT 1
		`, tenantID).Scan(
			&planInfo.PlanID, &planInfo.NombrePlan,
			&planInfo.MaxLocales, &planInfo.MaxUsuarios, &planInfo.MaxProductosMenu,
			&planInfo.PermiteReservas, &planInfo.PermiteDelivery,
			&planInfo.PermiteMultiLocal, &planInfo.PermiteReportes, &planInfo.PermiteAPI,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				utils.Forbidden(c, "No tiene suscripción activa")
			} else {
				log.Printf("[ERROR] Error consultando plan del tenant %s: %v", tenantID, err)
				utils.InternalError(c, "Error verificando plan", err)
			}
			c.Abort()
			return
		}

		// Setear info del plan en contexto
		c.Set("plan_info", planInfo)
		c.Set("plan_id", planInfo.PlanID)
		c.Set("nombre_plan", planInfo.NombrePlan)

		c.Next()
	}
}

// RequiereFeature middleware que verifica si una feature del plan está habilitada
func RequiereFeature(feature string) gin.HandlerFunc {
	return func(c *gin.Context) {
		planInfoRaw, exists := c.Get("plan_info")
		if !exists {
			utils.Forbidden(c, "Plan no verificado")
			c.Abort()
			return
		}

		planInfo, ok := planInfoRaw.(PlanInfo)
		if !ok {
			utils.InternalError(c, "Error interno de plan", nil)
			c.Abort()
			return
		}

		permitido := false
		switch feature {
		case "reservas":
			permitido = planInfo.PermiteReservas
		case "delivery":
			permitido = planInfo.PermiteDelivery
		case "multi_local":
			permitido = planInfo.PermiteMultiLocal
		case "reportes":
			permitido = planInfo.PermiteReportes
		case "api":
			permitido = planInfo.PermiteAPI
		default:
			permitido = true
		}

		if !permitido {
			utils.Forbidden(c, "Su plan no incluye esta funcionalidad: "+feature)
			c.Abort()
			return
		}

		c.Next()
	}
}

// ObtenerPlanInfo helper para obtener PlanInfo del contexto
func ObtenerPlanInfo(c *gin.Context) *PlanInfo {
	planInfoRaw, exists := c.Get("plan_info")
	if !exists {
		return nil
	}
	planInfo, ok := planInfoRaw.(PlanInfo)
	if !ok {
		return nil
	}
	return &planInfo
}
