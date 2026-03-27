package controladores

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/local"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Local (Locales, Zonas, Mesas, Configuración)
// ==========================================

type LocalController struct {
	Service *servicios.LocalService
}

func NuevoLocalController(svc *servicios.LocalService) *LocalController {
	return &LocalController{Service: svc}
}

// ---- LOCALES ----

func (c *LocalController) ListarLocales(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	locales, err := c.Service.ListarLocales(tenantID)
	if err != nil {
		utils.InternalError(ctx, "error al listar locales", err)
		return
	}
	utils.SuccessResponse(ctx, "locales obtenidos", locales)
}

func (c *LocalController) ObtenerLocal(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	l, err := c.Service.ObtenerLocal(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "local no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "local obtenido", l)
}

func (c *LocalController) CrearLocal(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req local.NuevoLocalRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	l, err := c.Service.CrearLocal(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear local", err)
		return
	}
	utils.CreatedResponse(ctx, "local creado", l)
}

func (c *LocalController) EliminarLocal(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	if err := c.Service.EliminarLocal(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar local", err)
		return
	}
	utils.NoContent(ctx)
}

func (c *LocalController) ActualizarLocal(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	var req local.ActualizarLocalRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarLocal(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al actualizar local", err)
		return
	}
	utils.SuccessResponse(ctx, "local actualizado", nil)
}

// ---- ZONAS ----

func (c *LocalController) ListarZonas(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	zonas, err := c.Service.ListarZonas(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar zonas", err)
		return
	}
	utils.SuccessResponse(ctx, "zonas obtenidas", zonas)
}

func (c *LocalController) CrearZona(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req local.NuevaZonaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	zona, err := c.Service.CrearZona(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear zona", err)
		return
	}
	utils.CreatedResponse(ctx, "zona creada", zona)
}

func (c *LocalController) ActualizarZona(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	var req local.ActualizarZonaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarZona(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al actualizar zona", err)
		return
	}
	utils.SuccessResponse(ctx, "zona actualizada", nil)
}

func (c *LocalController) EliminarZona(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	if err := c.Service.EliminarZona(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar zona", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- MESAS ----

func (c *LocalController) ListarMesas(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	mesas, err := c.Service.ListarMesas(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar mesas", err)
		return
	}
	utils.SuccessResponse(ctx, "mesas obtenidas", mesas)
}

func (c *LocalController) ObtenerMesa(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	mesa, err := c.Service.ObtenerMesa(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "mesa no encontrada")
		return
	}
	utils.SuccessResponse(ctx, "mesa obtenida", mesa)
}

func (c *LocalController) CrearMesa(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req local.NuevaMesaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	mesa, err := c.Service.CrearMesa(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear mesa", err)
		return
	}
	utils.CreatedResponse(ctx, "mesa creada", mesa)
}

func (c *LocalController) CambiarEstadoMesa(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	var req local.CambiarEstadoMesaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.CambiarEstadoMesa(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al cambiar estado", err)
		return
	}
	utils.SuccessResponse(ctx, "estado de mesa actualizado", nil)
}

func (c *LocalController) ActualizarMesa(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	var req local.ActualizarMesaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarMesa(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al actualizar mesa", err)
		return
	}
	utils.SuccessResponse(ctx, "mesa actualizada", nil)
}

func (c *LocalController) EliminarMesa(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	if err := c.Service.EliminarMesa(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar mesa", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- CONFIGURACIÓN ----

func (c *LocalController) ObtenerConfiguracion(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	config, err := c.Service.ObtenerConfiguracion(tenantID, localID)
	if err != nil {
		utils.NotFound(ctx, "configuración no encontrada")
		return
	}
	utils.SuccessResponse(ctx, "configuración obtenida", config)
}

func (c *LocalController) ActualizarConfiguracion(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	var req local.ActualizarConfiguracionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarConfiguracion(tenantID, localID, req); err != nil {
		utils.InternalError(ctx, "error al actualizar configuración", err)
		return
	}
	utils.SuccessResponse(ctx, "configuración actualizada", nil)
}
