package controladores

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/reportes"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Reportes (Dashboard, Resumen Diario, Alertas, Audit Log)
// ==========================================

type ReportesController struct {
	Service *servicios.ReportesService
}

func NuevoReportesController(svc *servicios.ReportesService) *ReportesController {
	return &ReportesController{Service: svc}
}

// ---- DASHBOARD ----

func (c *ReportesController) ObtenerDashboard(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	dash, err := c.Service.ObtenerDashboard(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error obteniendo dashboard", err)
		return
	}
	utils.SuccessResponse(ctx, "dashboard obtenido", dash)
}

// ---- RESUMEN DIARIO ----

func (c *ReportesController) ObtenerResumenDiario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	fecha := ctx.Query("fecha")
	if fecha == "" {
		utils.BadRequest(ctx, "parámetro 'fecha' requerido (YYYY-MM-DD)")
		return
	}
	resumen, err := c.Service.ObtenerResumenDiario(tenantID, localID, fecha)
	if err != nil {
		utils.NotFound(ctx, "resumen no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "resumen obtenido", resumen)
}

func (c *ReportesController) ListarResumenes(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	filtros := reportes.FiltrosResumenDiario{
		FechaDesde: ctx.Query("fecha_desde"),
		FechaHasta: ctx.Query("fecha_hasta"),
	}
	resumenes, total, err := c.Service.ListarResumenes(tenantID, localID, filtros, pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, "error listando resúmenes", err)
		return
	}
	utils.PaginatedResponse(ctx, "resúmenes obtenidos", resumenes, total, pagina, porPagina)
}

func (c *ReportesController) GenerarResumenDiario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	var body struct {
		Fecha string `json:"fecha"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil || body.Fecha == "" {
		utils.BadRequest(ctx, "fecha requerida (YYYY-MM-DD)")
		return
	}
	resumen, err := c.Service.GenerarResumenDiario(tenantID, localID, body.Fecha)
	if err != nil {
		utils.InternalError(ctx, "error generando resumen", err)
		return
	}
	utils.CreatedResponse(ctx, "resumen generado", resumen)
}

// ---- AUDIT LOG ----

func (c *ReportesController) ListarAuditLog(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	filtros := reportes.FiltrosAuditLog{
		UsuarioID:  parseOptionalInt64(ctx.Query("usuario_id")),
		Accion:     ctx.Query("accion"),
		Tabla:      ctx.Query("tabla"),
		FechaDesde: ctx.Query("fecha_desde"),
		FechaHasta: ctx.Query("fecha_hasta"),
	}
	logs, total, err := c.Service.ListarAuditLog(tenantID, filtros, pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, "error listando audit log", err)
		return
	}
	utils.PaginatedResponse(ctx, "audit log obtenido", logs, total, pagina, porPagina)
}
