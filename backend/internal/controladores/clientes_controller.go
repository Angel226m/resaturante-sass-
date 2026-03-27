package controladores

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/clientes"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Clientes (Clientes, Direcciones)
// ==========================================

type ClientesController struct {
	Service *servicios.ClientesService
}

func NuevoClientesController(svc *servicios.ClientesService) *ClientesController {
	return &ClientesController{Service: svc}
}

// ---- CLIENTES ----

func (c *ClientesController) ListarClientes(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	clts, total, err := c.Service.ListarClientes(tenantID, localID, pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, "error listando clientes", err)
		return
	}
	utils.PaginatedResponse(ctx, "clientes obtenidos", clts, total, pagina, porPagina)
}

func (c *ClientesController) ObtenerCliente(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	cliente, err := c.Service.ObtenerCliente(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "cliente no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "cliente obtenido", cliente)
}

func (c *ClientesController) CrearCliente(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req clientes.NuevoClienteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	cliente, err := c.Service.CrearCliente(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "cliente creado", cliente)
}

func (c *ClientesController) ActualizarCliente(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	var req clientes.ActualizarClienteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarCliente(tenantID, id, req); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "cliente actualizado", nil)
}

func (c *ClientesController) EliminarCliente(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	if err := c.Service.EliminarCliente(tenantID, id); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.NoContent(ctx)
}

func (c *ClientesController) BuscarClientes(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	query := ctx.Query("q")
	if query == "" {
		utils.BadRequest(ctx, "parámetro 'q' requerido")
		return
	}
	localID := middleware.ObtenerLocalID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	req := clientes.BuscarClienteRequest{
		Termino:   query,
		LocalID:   localID,
		Pagina:    pagina,
		PorPagina: porPagina,
	}
	clts, total, err := c.Service.BuscarClientes(tenantID, req)
	if err != nil {
		utils.BadRequest(ctx, err.Error())
		return
	}
	utils.PaginatedResponse(ctx, "resultados de búsqueda", clts, total, pagina, porPagina)
}

func (c *ClientesController) RegistrarVisita(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	if err := c.Service.RegistrarVisita(tenantID, id); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "visita registrada", nil)
}

// ---- DIRECCIONES ----

func (c *ClientesController) CrearDireccion(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req clientes.NuevaDireccionClienteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	dir, err := c.Service.CrearDireccion(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "dirección creada", dir)
}

func (c *ClientesController) EliminarDireccion(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := parseID64(ctx.Param("id"))
	if err := c.Service.EliminarDireccion(tenantID, id); err != nil {
		utils.InternalError(ctx, err.Error())
		return
	}
	utils.NoContent(ctx)
}
