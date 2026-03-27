package controladores

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/delivery"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Delivery (Zonas, Delivery Órdenes, Seguimiento)
// ==========================================

type DeliveryController struct {
	Service *servicios.DeliveryService
}

func NuevoDeliveryController(svc *servicios.DeliveryService) *DeliveryController {
	return &DeliveryController{Service: svc}
}

// ---- ZONAS DELIVERY ----

func (c *DeliveryController) ListarZonas(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	zonas, err := c.Service.ListarZonas(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "zonas obtenidas", zonas)
}

func (c *DeliveryController) CrearZona(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req delivery.NuevaZonaDeliveryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	zona, err := c.Service.CrearZona(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "zona creada", zona)
}

func (c *DeliveryController) ActualizarZona(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	var req delivery.ActualizarZonaDeliveryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	zona, err := c.Service.ActualizarZona(tenantID, id, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "zona actualizada", zona)
}

func (c *DeliveryController) EliminarZona(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	if err := c.Service.EliminarZona(tenantID, id); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.NoContent(ctx)
}

// ---- DELIVERY ÓRDENES ----

func (c *DeliveryController) ListarDeliveryOrdenes(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	filtros := delivery.FiltrosDelivery{
		Estado:       ctx.Query("estado"),
		RepartidorID: parseOptionalInt64(ctx.Query("repartidor_id")),
		FechaDesde:   ctx.Query("fecha_desde"),
		FechaHasta:   ctx.Query("fecha_hasta"),
	}
	deliveries, total, err := c.Service.ListarDeliveryOrdenes(tenantID, filtros, pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.PaginatedResponse(ctx, "deliveries obtenidos", deliveries, total, pagina, porPagina)
}

func (c *DeliveryController) ObtenerDeliveryOrden(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	d, err := c.Service.ObtenerDeliveryOrden(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "delivery no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "delivery obtenido", d)
}

func (c *DeliveryController) CrearDeliveryOrden(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req delivery.NuevoDeliveryOrdenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	d, err := c.Service.CrearDeliveryOrden(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "delivery creado", d)
}

func (c *DeliveryController) AsignarRepartidor(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	var req delivery.AsignarRepartidorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.AsignarRepartidor(tenantID, id, req); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "repartidor asignado", nil)
}

func (c *DeliveryController) ActualizarEstadoDelivery(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	// repartidorID se extrae del usuario autenticado o del body
	var req delivery.ActualizarEstadoDeliveryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	repartidorID, _ := strconv.Atoi(ctx.Query("repartidor_id"))
	if repartidorID == 0 {
		repartidorID = int(middleware.ObtenerUsuarioID(ctx))
	}
	if err := c.Service.ActualizarEstado(tenantID, id, repartidorID, req); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "estado actualizado", nil)
}

func (c *DeliveryController) ObtenerSeguimiento(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	seg, err := c.Service.ObtenerSeguimiento(tenantID, id)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "seguimiento obtenido", seg)
}
