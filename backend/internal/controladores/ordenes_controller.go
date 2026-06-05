package controladores

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/ordenes"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Órdenes (Órdenes, Items, Tickets Cocina)
// ==========================================

type OrdenesController struct {
	Service *servicios.OrdenesService
}

func NuevoOrdenesController(svc *servicios.OrdenesService) *OrdenesController {
	return &OrdenesController{Service: svc}
}

// ---- ÓRDENES ----

func (c *OrdenesController) ListarOrdenes(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	rol := middleware.ObtenerRol(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	filtros := ordenes.FiltrosOrden{
		LocalID:    localID,
		Estado:     ctx.Query("estado"),
		TipoOrden:  ctx.Query("tipo_orden"),
		MesaID:     parseOptionalInt(ctx.Query("mesa_id")),
		MeseroID:   parseOptionalInt64(ctx.Query("mesero_id")),
		FechaDesde: ctx.Query("fecha_desde"),
		FechaHasta: ctx.Query("fecha_hasta"),
		Pagina:     pagina,
		PorPagina:  porPagina,
	}

	if strings.EqualFold(rol, "mesero") {
		if usuarioID > 0 {
			filtros.MeseroID = &usuarioID
		}

		// Mesero no debe consultar pedidos de delivery desde este endpoint.
		if filtros.TipoOrden == "" || strings.EqualFold(filtros.TipoOrden, "delivery") {
			filtros.TipoOrden = "mesa"
		}
	}

	ords, total, err := c.Service.ListarOrdenes(tenantID, filtros)
	if err != nil {
		utils.InternalError(ctx, "error al listar órdenes", err)
		return
	}
	utils.PaginatedResponse(ctx, "órdenes obtenidas", ords, total, pagina, porPagina)
}

func (c *OrdenesController) ObtenerOrden(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	orden, err := c.Service.ObtenerOrden(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "orden no encontrada")
		return
	}
	utils.SuccessResponse(ctx, "orden obtenida", orden)
}

func (c *OrdenesController) CrearOrden(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	var req ordenes.NuevaOrdenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	orden, err := c.Service.CrearOrden(tenantID, usuarioID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear orden", err)
		return
	}
	utils.CreatedResponse(ctx, "orden creada", orden)
}

func (c *OrdenesController) CambiarEstadoOrden(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	var req ordenes.CambiarEstadoOrdenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.CambiarEstadoOrden(tenantID, id, req, usuarioID); err != nil {
		utils.InternalError(ctx, "error al cambiar estado", err)
		return
	}
	utils.SuccessResponse(ctx, "estado actualizado", nil)
}

func (c *OrdenesController) AgregarItemOrden(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	var req ordenes.NuevoItemOrdenReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.AgregarItemOrden(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al agregar item", err)
		return
	}
	utils.SuccessResponse(ctx, "item agregado", nil)
}

func (c *OrdenesController) ContarOrdenesActivas(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	total, err := c.Service.ContarOrdenesActivas(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al contar órdenes", err)
		return
	}
	utils.SuccessResponse(ctx, "órdenes activas", gin.H{"total": total})
}

// ---- TICKETS COCINA ----

func (c *OrdenesController) ListarTicketsCocina(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	filtros := ordenes.FiltrosTicketCocina{
		LocalID:        localID,
		Estado:         ctx.Query("estado"),
		EstacionCocina: ctx.Query("estacion_cocina"),
		Prioridad:      parseOptionalInt(ctx.Query("prioridad")),
	}
	tickets, err := c.Service.ListarTicketsCocina(tenantID, filtros)
	if err != nil {
		utils.InternalError(ctx, "error al listar tickets", err)
		return
	}
	utils.SuccessResponse(ctx, "tickets obtenidos", tickets)
}

func (c *OrdenesController) CrearTicketCocina(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var body struct {
		OrdenID   int64  `json:"orden_id"     validate:"required"`
		Estacion  string `json:"estacion"     validate:"required"`
		Prioridad int    `json:"prioridad"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	ticket, err := c.Service.CrearTicketCocina(tenantID, body.OrdenID, body.Estacion, body.Prioridad)
	if err != nil {
		utils.InternalError(ctx, "error al crear ticket", err)
		return
	}
	utils.CreatedResponse(ctx, "ticket creado", ticket)
}

func (c *OrdenesController) CambiarEstadoTicket(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	var req ordenes.CambiarEstadoTicketRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.CambiarEstadoTicket(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al cambiar estado del ticket", err)
		return
	}
	utils.SuccessResponse(ctx, "estado del ticket actualizado", nil)
}
