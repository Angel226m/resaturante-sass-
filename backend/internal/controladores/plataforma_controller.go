package controladores

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/plataforma"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Plataforma (SuperAdmin) — Planes, Tenants, Suscripciones, Facturas
// ==========================================

type PlataformaController struct {
	Service *servicios.PlataformaService
}

func NuevoPlataformaController(svc *servicios.PlataformaService) *PlataformaController {
	return &PlataformaController{Service: svc}
}

// ---- PLANES ----

func (c *PlataformaController) ListarPlanes(ctx *gin.Context) {
	planes, err := c.Service.ListarPlanes()
	if err != nil {
		utils.InternalError(ctx, "error al listar planes", err)
		return
	}
	utils.SuccessResponse(ctx, "planes obtenidos", planes)
}

func (c *PlataformaController) ObtenerPlan(ctx *gin.Context) {
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	plan, err := c.Service.ObtenerPlan(int(id))
	if err != nil {
		utils.NotFound(ctx, "plan no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "plan obtenido", plan)
}

func (c *PlataformaController) CrearPlan(ctx *gin.Context) {
	var req plataforma.NuevoPlanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	plan, err := c.Service.CrearPlan(req)
	if err != nil {
		utils.InternalError(ctx, "error al crear plan", err)
		return
	}
	utils.CreatedResponse(ctx, "plan creado", plan)
}

func (c *PlataformaController) ActualizarPlan(ctx *gin.Context) {
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	var req plataforma.ActualizarPlanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	plan, err := c.Service.ActualizarPlan(int(id), req)
	if err != nil {
		utils.InternalError(ctx, "error al actualizar plan", err)
		return
	}
	utils.SuccessResponse(ctx, "plan actualizado", plan)
}

func (c *PlataformaController) EliminarPlan(ctx *gin.Context) {
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	if err := c.Service.EliminarPlan(int(id)); err != nil {
		utils.InternalError(ctx, "error al eliminar plan", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- TENANTS ----

func (c *PlataformaController) ListarTenants(ctx *gin.Context) {
	pagina, porPagina := obtenerPaginacion(ctx)
	tenants, total, err := c.Service.ListarTenants(pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, "error al listar tenants", err)
		return
	}
	utils.PaginatedResponse(ctx, "tenants obtenidos", tenants, total, pagina, porPagina)
}

func (c *PlataformaController) ObtenerTenant(ctx *gin.Context) {
	id := ctx.Param("id")
	tenant, err := c.Service.ObtenerTenant(id)
	if err != nil {
		utils.NotFound(ctx, "tenant no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "tenant obtenido", tenant)
}

func (c *PlataformaController) CrearTenant(ctx *gin.Context) {
	var req plataforma.NuevoTenantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	tenant, err := c.Service.CrearTenantConSuscripcion(req)
	if err != nil {
		utils.Conflict(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "tenant creado", tenant)
}

func (c *PlataformaController) ActualizarTenant(ctx *gin.Context) {
	id := ctx.Param("id")
	var req plataforma.ActualizarTenantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	tenant, err := c.Service.ActualizarTenant(id, req)
	if err != nil {
		utils.InternalError(ctx, "error al actualizar tenant", err)
		return
	}
	utils.SuccessResponse(ctx, "tenant actualizado", tenant)
}

func (c *PlataformaController) EliminarTenant(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.Service.EliminarTenant(id); err != nil {
		utils.InternalError(ctx, "error al eliminar tenant", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- SUSCRIPCIONES ----

func (c *PlataformaController) ObtenerSuscripcion(ctx *gin.Context) {
	id := ctx.Param("id")
	sub, err := c.Service.ObtenerSuscripcionActiva(id)
	if err != nil {
		utils.NotFound(ctx, "suscripción no encontrada")
		return
	}
	utils.SuccessResponse(ctx, "suscripción obtenida", sub)
}

func (c *PlataformaController) CambiarPlan(ctx *gin.Context) {
	id := ctx.Param("id")
	var req plataforma.CambiarPlanRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.CambiarPlan(id, req); err != nil {
		utils.InternalError(ctx, "error al cambiar plan", err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"ok": true, "mensaje": "plan cambiado"})
}

// ---- FACTURAS ----

func (c *PlataformaController) ListarFacturas(ctx *gin.Context) {
	id := ctx.Param("id")
	pagina, porPagina := obtenerPaginacion(ctx)
	facturas, total, err := c.Service.ListarFacturas(id, pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, "error al listar facturas", err)
		return
	}
	utils.PaginatedResponse(ctx, "facturas obtenidas", facturas, total, pagina, porPagina)
}
