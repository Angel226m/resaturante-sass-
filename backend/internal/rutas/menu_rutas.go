package rutas

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Menú (Categorías, Productos, Variantes, Modificadores, Combos, Promos, Cupones)
// /api/v1/menu/...
// ==========================================

func registrarRutasMenu(autenticado *gin.RouterGroup, menuCtrl *controladores.MenuController) {
	menu := autenticado.Group("/menu")

	// Categorías
	categorias := menu.Group("/categorias")
	{
		categorias.GET("", menuCtrl.ListarCategorias)
		categorias.GET("/:id", menuCtrl.ObtenerCategoria)
		categorias.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearCategoria)
		categorias.PUT("/:id", middleware.EsAdminOGerente(), menuCtrl.ActualizarCategoria)
		categorias.DELETE("/:id", middleware.EsAdminOGerente(), menuCtrl.EliminarCategoria)
	}

	// Productos
	productos := menu.Group("/productos")
	{
		productos.GET("", menuCtrl.ListarProductos)
		productos.GET("/:id", menuCtrl.ObtenerProducto)
		productos.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearProducto)
		productos.PUT("/:id", middleware.EsAdminOGerente(), menuCtrl.ActualizarProducto)
		productos.DELETE("/:id", middleware.EsAdminOGerente(), menuCtrl.EliminarProducto)
		productos.PATCH("/:id/disponibilidad", menuCtrl.CambiarDisponibilidad)
	}

	// Variantes
	variantes := menu.Group("/variantes")
	{
		variantes.GET("/producto/:productoId", menuCtrl.ListarVariantes)
		variantes.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearVariante)
		variantes.DELETE("/:id", middleware.EsAdminOGerente(), menuCtrl.EliminarVariante)
	}

	// Grupos modificadores
	modificadores := menu.Group("/modificadores")
	{
		modificadores.GET("", menuCtrl.ListarGruposModificadores)
		modificadores.GET("/:id", menuCtrl.ObtenerGrupoModificador)
		modificadores.POST("/grupos", middleware.EsAdminOGerente(), menuCtrl.CrearGrupoModificador)
		modificadores.POST("/items", middleware.EsAdminOGerente(), menuCtrl.CrearModificador)
		modificadores.POST("/asignar", middleware.EsAdminOGerente(), menuCtrl.AsignarGrupoAProducto)
		modificadores.DELETE("/producto/:productoId/grupo/:grupoId", middleware.EsAdminOGerente(), menuCtrl.DesasignarGrupoDeProducto)
	}

	// Combos
	combos := menu.Group("/combos")
	{
		combos.GET("", menuCtrl.ListarCombos)
		combos.GET("/:id", menuCtrl.ObtenerCombo)
		combos.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearCombo)
	}

	// Promociones
	promos := menu.Group("/promociones")
	{
		promos.GET("", menuCtrl.ListarPromociones)
		promos.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearPromocion)
	}

	// Cupones
	cupones := menu.Group("/cupones")
	{
		cupones.GET("", menuCtrl.ListarCupones)
		cupones.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearCupon)
		cupones.POST("/validar", menuCtrl.ValidarCupon)
	}

	// Imágenes
	imagenes := menu.Group("/imagenes")
	{
		imagenes.POST("", middleware.EsAdminOGerente(), menuCtrl.AgregarImagen)
		imagenes.DELETE("/:id", middleware.EsAdminOGerente(), menuCtrl.EliminarImagen)
	}

	// Horarios de menú
	horarios := menu.Group("/horarios")
	{
		horarios.GET("", menuCtrl.ListarHorarios)
		horarios.POST("", middleware.EsAdminOGerente(), menuCtrl.CrearHorario)
		horarios.DELETE("/:id", middleware.EsAdminOGerente(), menuCtrl.EliminarHorario)
	}
}
