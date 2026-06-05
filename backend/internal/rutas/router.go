package rutas

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/restauflow/backend/internal/config"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/repositorios"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Router principal — RestauFlow SaaS
// Registra todas las rutas con sus middlewares
// ==========================================

func RegistrarRutas(router *gin.Engine, db *sql.DB, rdb *redis.Client, cfg *config.Config) {
	// Error handler global
	router.Use(middleware.ErrorHandler())

	// ===== Health Check (sin autenticación) =====
	router.GET("/health", func(c *gin.Context) {
		ctx := c.Request.Context()
		dbOK := db.PingContext(ctx) == nil
		redisOK := rdb.Ping(ctx).Err() == nil

		status := "ok"
		code := 200
		if !dbOK || !redisOK {
			status = "degraded"
			code = 503
		}

		c.JSON(code, gin.H{
			"status":  status,
			"service": "restauflow-backend",
			"checks": gin.H{
				"db":    map[string]bool{"ok": dbOK},
				"redis": map[string]bool{"ok": redisOK},
			},
		})
	})
	router.HEAD("/health", func(c *gin.Context) {
		ctx := c.Request.Context()
		dbOK := db.PingContext(ctx) == nil
		redisOK := rdb.Ping(ctx).Err() == nil

		code := 200
		if !dbOK || !redisOK {
			code = 503
		}
		c.Status(code)
	})

	// ===== Repositorios =====
	plataformaRepo := repositorios.NuevoPlataformaRepo(db)
	authRepo := repositorios.NuevoAuthRepo(db)
	localRepo := repositorios.NuevoLocalRepo(db)
	menuRepo := repositorios.NuevoMenuRepo(db)
	clientesRepo := repositorios.NuevoClientesRepo(db)
	reservasRepo := repositorios.NuevoReservasRepo(db)
	ordenesRepo := repositorios.NuevoOrdenesRepo(db)
	cajaRepo := repositorios.NuevoCajaRepo(db)
	deliveryRepo := repositorios.NuevoDeliveryRepo(db)
	reportesRepo := repositorios.NuevoReportesRepo(db)

	// ===== Servicios =====
	plataformaSvc := servicios.NuevoPlataformaService(plataformaRepo)
	authSvc := servicios.NuevoAuthService(authRepo)
	localSvc := servicios.NuevoLocalService(localRepo)
	menuSvc := servicios.NuevoMenuService(menuRepo)
	clientesSvc := servicios.NuevoClientesService(clientesRepo)
	reservasSvc := servicios.NuevoReservasService(reservasRepo)
	ordenesSvc := servicios.NuevoOrdenesService(ordenesRepo)
	cajaSvc := servicios.NuevoCajaService(cajaRepo)
	deliverySvc := servicios.NuevoDeliveryService(deliveryRepo)
	reportesSvc := servicios.NuevoReportesService(reportesRepo)

	// ===== Controladores =====
	plataformaCtrl := controladores.NuevoPlataformaController(plataformaSvc)
	authCtrl := controladores.NuevoAuthController(authSvc)
	localCtrl := controladores.NuevoLocalController(localSvc)
	menuCtrl := controladores.NuevoMenuController(menuSvc)
	clientesCtrl := controladores.NuevoClientesController(clientesSvc)
	reservasCtrl := controladores.NuevoReservasController(reservasSvc)
	ordenesCtrl := controladores.NuevoOrdenesController(ordenesSvc)
	cajaCtrl := controladores.NuevoCajaController(cajaSvc)
	deliveryCtrl := controladores.NuevoDeliveryController(deliverySvc)
	reportesCtrl := controladores.NuevoReportesController(reportesSvc)

	// ===== API v1 =====
	api := router.Group("/api/v1")
	api.Use(middleware.RateLimitAPI(rdb))

	// --- WebSocket (sin auth para simplificar, puede protegerse) ---
	router.GET("/ws", func(c *gin.Context) {
		hub := utils.GetWSHub()
		tenantID := c.Query("tenant_id")
		canal := c.Query("canal")
		if tenantID == "" || canal == "" {
			c.JSON(400, gin.H{"error": "tenant_id y canal requeridos"})
			return
		}
		utils.HandleWebSocket(hub, tenantID, canal, c.Writer, c.Request)
	})

	// --- SuperAdmin (plataforma) ---
	registrarRutasSuperAdmin(api, db, rdb, plataformaCtrl, authCtrl)

	// --- Auth público ---
	registrarRutasAuthPublico(api, db, rdb, authCtrl)

	// --- Rutas con autenticación de tenant ---
	autenticado := api.Group("")
	autenticado.Use(middleware.Auth(db))
	autenticado.Use(middleware.Tenant(db))
	autenticado.Use(middleware.Plan(db))

	// Auth (operaciones privadas)
	registrarRutasAuthPrivado(autenticado, authCtrl)

	// Locales
	registrarRutasLocales(autenticado, db, localCtrl)

	// Menú
	registrarRutasMenu(autenticado, menuCtrl)

	// Clientes
	registrarRutasClientes(autenticado, clientesCtrl)

	// Reservas
	registrarRutasReservas(autenticado, reservasCtrl)

	// Órdenes
	registrarRutasOrdenes(autenticado, ordenesCtrl)

	// Caja
	registrarRutasCaja(autenticado, cajaCtrl)

	// Delivery
	registrarRutasDelivery(autenticado, deliveryCtrl)

	// Reportes
	registrarRutasReportes(autenticado, db, reportesCtrl)
}
