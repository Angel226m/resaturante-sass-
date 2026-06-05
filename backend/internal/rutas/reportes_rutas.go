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

	// Dashboard — visible para todo el personal interno
	reportes.GET("/dashboard", middleware.EsPersonalInterno(), reportesCtrl.ObtenerDashboard)

	// Resumen diario (solo admin/gerente)
	resumen := reportes.Group("/resumen-diario")
	resumen.Use(middleware.EsAdminOGerente())
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
