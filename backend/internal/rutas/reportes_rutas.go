package rutas

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Reportes (Dashboard, Resumen Diario, Alertas, Audit Log)
// /api/v1/reportes/...
// ==========================================

func registrarRutasReportes(autenticado *gin.RouterGroup, db *sql.DB, reportesCtrl *controladores.ReportesController) {
	reportes := autenticado.Group("/reportes")
	reportes.Use(middleware.EsAdminOGerente())

	// Dashboard
	reportes.GET("/dashboard", reportesCtrl.ObtenerDashboard)

	// Resumen diario
	resumen := reportes.Group("/resumen-diario")
	{
		resumen.GET("", reportesCtrl.ObtenerResumenDiario)
		resumen.GET("/historial", reportesCtrl.ListarResumenes)
		resumen.POST("/generar", reportesCtrl.GenerarResumenDiario)
	}

	// Audit log (solo admin)
	auditLog := reportes.Group("/audit-log")
	auditLog.Use(middleware.EsAdmin())
	{
		auditLog.GET("", reportesCtrl.ListarAuditLog)
	}
}
