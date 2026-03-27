package controladores

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/menu"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Menú (Categorías, Productos, Variantes, Modificadores, Combos, Promos, Cupones)
// ==========================================

type MenuController struct {
	Service *servicios.MenuService
}

func NuevoMenuController(svc *servicios.MenuService) *MenuController {
	return &MenuController{Service: svc}
}

// ---- CATEGORÍAS ----

func (c *MenuController) ListarCategorias(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	cats, err := c.Service.ListarCategorias(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar categorías", err)
		return
	}
	utils.SuccessResponse(ctx, "categorías obtenidas", cats)
}

func (c *MenuController) ObtenerCategoria(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	cat, err := c.Service.ObtenerCategoria(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "categoría no encontrada")
		return
	}
	utils.SuccessResponse(ctx, "categoría obtenida", cat)
}

func (c *MenuController) CrearCategoria(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevaCategoriaMenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	cat, err := c.Service.CrearCategoria(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear categoría", err)
		return
	}
	utils.CreatedResponse(ctx, "categoría creada", cat)
}

func (c *MenuController) ActualizarCategoria(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	var req menu.ActualizarCategoriaMenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarCategoria(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al actualizar categoría", err)
		return
	}
	utils.SuccessResponse(ctx, "categoría actualizada", nil)
}

func (c *MenuController) EliminarCategoria(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	if err := c.Service.EliminarCategoria(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar categoría", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- PRODUCTOS ----

func (c *MenuController) ListarProductos(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	var categoriaID *int
	if catStr := ctx.Query("categoria_id"); catStr != "" {
		cid, _ := strconv.Atoi(catStr)
		categoriaID = &cid
	}
	prods, err := c.Service.ListarProductos(tenantID, localID, categoriaID)
	if err != nil {
		utils.InternalError(ctx, "error al listar productos", err)
		return
	}
	utils.SuccessResponse(ctx, "productos obtenidos", prods)
}

func (c *MenuController) ObtenerProducto(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	prod, err := c.Service.ObtenerProducto(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "producto no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "producto obtenido", prod)
}

func (c *MenuController) CrearProducto(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevoProductoMenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	prod, err := c.Service.CrearProducto(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear producto", err)
		return
	}
	utils.CreatedResponse(ctx, "producto creado", prod)
}

func (c *MenuController) ActualizarProducto(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	var req menu.ActualizarProductoMenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.ActualizarProducto(tenantID, id, req); err != nil {
		utils.InternalError(ctx, "error al actualizar producto", err)
		return
	}
	utils.SuccessResponse(ctx, "producto actualizado", nil)
}

func (c *MenuController) EliminarProducto(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	if err := c.Service.EliminarProducto(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar producto", err)
		return
	}
	utils.NoContent(ctx)
}

func (c *MenuController) CambiarDisponibilidad(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	var body struct {
		Disponible bool `json:"disponible"`
	}
	ctx.ShouldBindJSON(&body)
	if err := c.Service.CambiarDisponibilidad(tenantID, id, body.Disponible); err != nil {
		utils.InternalError(ctx, "error al cambiar disponibilidad", err)
		return
	}
	utils.SuccessResponse(ctx, "disponibilidad actualizada", nil)
}

// ---- VARIANTES ----

func (c *MenuController) ListarVariantes(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	productoID, err := parseID64(ctx.Param("productoId"))
	if err != nil {
		utils.BadRequest(ctx, "productoId inválido")
		return
	}
	variantes, err := c.Service.ListarVariantes(tenantID, productoID)
	if err != nil {
		utils.InternalError(ctx, "error al listar variantes", err)
		return
	}
	utils.SuccessResponse(ctx, "variantes obtenidas", variantes)
}

func (c *MenuController) CrearVariante(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevaVarianteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	v, err := c.Service.CrearVariante(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear variante", err)
		return
	}
	utils.CreatedResponse(ctx, "variante creada", v)
}

func (c *MenuController) EliminarVariante(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	if err := c.Service.EliminarVariante(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar variante", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- MODIFICADORES ----

func (c *MenuController) ListarGruposModificadores(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	grupos, err := c.Service.ListarGruposModificadores(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar grupos", err)
		return
	}
	utils.SuccessResponse(ctx, "grupos obtenidos", grupos)
}

func (c *MenuController) ObtenerGrupoModificador(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	grupo, err := c.Service.ObtenerGrupoModificador(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "grupo no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "grupo obtenido", grupo)
}

func (c *MenuController) CrearGrupoModificador(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevoGrupoModificadorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	grupo, err := c.Service.CrearGrupoModificador(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear grupo", err)
		return
	}
	utils.CreatedResponse(ctx, "grupo creado", grupo)
}

func (c *MenuController) CrearModificador(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevoModificadorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	mod, err := c.Service.CrearModificador(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear modificador", err)
		return
	}
	utils.CreatedResponse(ctx, "modificador creado", mod)
}

func (c *MenuController) AsignarGrupoAProducto(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.AsignarGrupoModificadorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.AsignarGrupoAProducto(tenantID, req); err != nil {
		utils.InternalError(ctx, "error al asignar grupo", err)
		return
	}
	utils.SuccessResponse(ctx, "grupo asignado al producto", nil)
}

func (c *MenuController) DesasignarGrupoDeProducto(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	productoID, err := parseID64(ctx.Param("productoId"))
	if err != nil {
		utils.BadRequest(ctx, "productoId inválido")
		return
	}
	grupoID, _ := strconv.Atoi(ctx.Param("grupoId"))
	if err := c.Service.DesasignarGrupoDeProducto(tenantID, productoID, grupoID); err != nil {
		utils.InternalError(ctx, "error al desasignar grupo", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- COMBOS ----

func (c *MenuController) ListarCombos(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	combos, err := c.Service.ListarCombos(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar combos", err)
		return
	}
	utils.SuccessResponse(ctx, "combos obtenidos", combos)
}

func (c *MenuController) ObtenerCombo(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	combo, err := c.Service.ObtenerCombo(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "combo no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "combo obtenido", combo)
}

func (c *MenuController) CrearCombo(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevoComboRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	combo, err := c.Service.CrearCombo(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear combo", err)
		return
	}
	utils.CreatedResponse(ctx, "combo creado", combo)
}

// ---- PROMOCIONES ----

func (c *MenuController) ListarPromociones(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	promos, err := c.Service.ListarPromociones(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar promociones", err)
		return
	}
	utils.SuccessResponse(ctx, "promociones obtenidas", promos)
}

func (c *MenuController) CrearPromocion(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevaPromocionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	promo, err := c.Service.CrearPromocion(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear promoción", err)
		return
	}
	utils.CreatedResponse(ctx, "promoción creada", promo)
}

// ---- CUPONES ----

func (c *MenuController) ListarCupones(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	cupones, err := c.Service.ListarCupones(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar cupones", err)
		return
	}
	utils.SuccessResponse(ctx, "cupones obtenidos", cupones)
}

func (c *MenuController) CrearCupon(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevoCuponRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	cupon, err := c.Service.CrearCupon(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear cupón", err)
		return
	}
	utils.CreatedResponse(ctx, "cupón creado", cupon)
}

func (c *MenuController) ValidarCupon(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	var req menu.ValidarCuponRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	resultado, err := c.Service.ValidarCupon(tenantID, localID, req)
	if err != nil {
		utils.BadRequest(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "cupón validado", resultado)
}

// ---- IMÁGENES ----

func (c *MenuController) AgregarImagen(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevaImagenProductoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	img, err := c.Service.AgregarImagen(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al agregar imagen", err)
		return
	}
	utils.CreatedResponse(ctx, "imagen agregada", img)
}

func (c *MenuController) EliminarImagen(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	if err := c.Service.EliminarImagen(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar imagen", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- HORARIOS ----

func (c *MenuController) ListarHorarios(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	horarios, err := c.Service.ListarHorarios(tenantID, localID)
	if err != nil {
		utils.InternalError(ctx, "error al listar horarios", err)
		return
	}
	utils.SuccessResponse(ctx, "horarios obtenidos", horarios)
}

func (c *MenuController) CrearHorario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req menu.NuevoMenuHorarioRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	h, err := c.Service.CrearHorario(tenantID, req)
	if err != nil {
		utils.InternalError(ctx, "error al crear horario", err)
		return
	}
	utils.CreatedResponse(ctx, "horario creado", h)
}

func (c *MenuController) EliminarHorario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, _ := strconv.Atoi(ctx.Param("id"))
	if err := c.Service.EliminarHorario(tenantID, id); err != nil {
		utils.InternalError(ctx, "error al eliminar horario", err)
		return
	}
	utils.NoContent(ctx)
}
