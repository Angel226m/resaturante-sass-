package controladores

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/caja"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Caja (Turnos, Métodos Pago, Pagos, Comprobantes)
// ==========================================

type CajaController struct {
	Service *servicios.CajaService
}

func NuevoCajaController(svc *servicios.CajaService) *CajaController {
	return &CajaController{Service: svc}
}

// ---- TURNOS CAJA ----

func (c *CajaController) ObtenerTurnoActivo(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	turno, err := c.Service.ObtenerTurnoActivo(tenantID, localID, usuarioID)
	if err != nil {
		utils.NotFound(ctx, "no hay turno activo")
		return
	}
	utils.SuccessResponse(ctx, "turno activo", turno)
}

func (c *CajaController) AbrirTurno(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	var req caja.AbrirTurnoCajaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	turno, err := c.Service.AbrirTurno(tenantID, usuarioID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "turno abierto", turno)
}

func (c *CajaController) CerrarTurno(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	turnoID, _ := parseID64(ctx.Param("id"))
	var req caja.CerrarTurnoCajaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	turno, err := c.Service.CerrarTurno(tenantID, turnoID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "turno cerrado", turno)
}

func (c *CajaController) ObtenerResumenTurno(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	turnoID, _ := parseID64(ctx.Param("id"))
	resumen, err := c.Service.ObtenerResumenTurno(tenantID, turnoID)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "resumen del turno", resumen)
}

// ---- MÉTODOS DE PAGO ----

func (c *CajaController) ListarMetodosPago(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	metodos, err := c.Service.ListarMetodosPago(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "métodos de pago obtenidos", metodos)
}

func (c *CajaController) CrearMetodoPago(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req caja.NuevoMetodoPagoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	metodo, err := c.Service.CrearMetodoPago(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "método de pago creado", metodo)
}

// ---- PAGOS ----

func (c *CajaController) CrearPago(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	turnoID, _ := parseID64(ctx.Param("turnoId"))
	var req caja.NuevoPagoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	pago, err := c.Service.CrearPago(tenantID, turnoID, usuarioID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "pago registrado", pago)
}

func (c *CajaController) AnularPago(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	pagoID, _ := parseID64(ctx.Param("id"))
	var req caja.AnularPagoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "motivo requerido")
		return
	}
	if err := c.Service.AnularPago(tenantID, pagoID, req); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "pago anulado", nil)
}

func (c *CajaController) ListarPagosPorTurno(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	turnoID, _ := parseID64(ctx.Param("turnoId"))
	pagos, err := c.Service.ListarPagosPorTurno(tenantID, turnoID)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "pagos obtenidos", pagos)
}

// ---- COMPROBANTES ----

func (c *CajaController) CrearComprobante(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req caja.NuevoComprobanteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	comp, err := c.Service.CrearComprobante(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "comprobante creado", comp)
}

func (c *CajaController) AnularComprobante(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err := c.Service.AnularComprobante(tenantID, id); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "comprobante anulado", nil)
}
