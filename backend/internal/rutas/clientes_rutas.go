package rutas

import (
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Rutas: Clientes (CRUD, Búsqueda, Direcciones, Puntos)
// /api/v1/clientes/...
// ==========================================

func registrarRutasClientes(autenticado *gin.RouterGroup, clientesCtrl *controladores.ClientesController) {
	clientes := autenticado.Group("/clientes")

	// CRUD Clientes
	{
		clientes.GET("", clientesCtrl.ListarClientes)
		clientes.GET("/buscar", clientesCtrl.BuscarClientes)
		clientes.GET("/:id", clientesCtrl.ObtenerCliente)
		clientes.POST("", clientesCtrl.CrearCliente)
		clientes.PUT("/:id", clientesCtrl.ActualizarCliente)
		clientes.DELETE("/:id", middleware.EsAdminOGerente(), clientesCtrl.EliminarCliente)
		clientes.POST("/:id/visita", clientesCtrl.RegistrarVisita)
	}

	// Direcciones
	direcciones := clientes.Group("/direcciones")
	{
		direcciones.POST("", clientesCtrl.CrearDireccion)
		direcciones.DELETE("/:id", clientesCtrl.EliminarDireccion)
	}
}
