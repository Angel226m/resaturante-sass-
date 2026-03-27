package controladores

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/reservas"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Reservas
// ==========================================

type ReservasController struct {
	Service *servicios.ReservasService
}

func NuevoReservasController(svc *servicios.ReservasService) *ReservasController {
	return &ReservasController{Service: svc}
}

func (c *ReservasController) ListarReservas(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	filtros := reservas.FiltrosReserva{
		LocalID:    localID,
		Estado:     ctx.Query("estado"),
		Fecha:      ctx.Query("fecha"),
		FechaDesde: ctx.Query("fecha_desde"),
		FechaHasta: ctx.Query("fecha_hasta"),
		Pagina:     pagina,
		PorPagina:  porPagina,
	}
	res, total, err := c.Service.ListarReservas(tenantID, filtros)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.PaginatedResponse(ctx, "reservas obtenidas", res, total, pagina, porPagina)
}

func (c *ReservasController) ObtenerReserva(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	reserva, err := c.Service.ObtenerReserva(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "reserva no encontrada")
		return
	}
	utils.SuccessResponse(ctx, "reserva obtenida", reserva)
}

func (c *ReservasController) CrearReserva(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req reservas.NuevaReservaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	reserva, err := c.Service.CrearReserva(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "reserva creada", reserva)
}

func (c *ReservasController) CambiarEstadoReserva(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	var req reservas.CambiarEstadoReservaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	if err := c.Service.CambiarEstadoReserva(tenantID, id, req, &usuarioID); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "estado actualizado", nil)
}

func (c *ReservasController) ConsultarDisponibilidad(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	var req reservas.DisponibilidadMesaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	req.LocalID = localID
	mesas, err := c.Service.ConsultarDisponibilidad(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "mesas disponibles", mesas)
}

func (c *ReservasController) ContarReservasHoy(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	total, err := c.Service.ContarReservasHoy(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "reservas de hoy", gin.H{"total": total})
}
