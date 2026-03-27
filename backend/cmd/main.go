package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/config"
	"github.com/restauflow/backend/internal/jobs"
	"github.com/restauflow/backend/internal/rutas"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// RestauFlow SaaS — Punto de entrada
// ==========================================

func main() {
	// Cargar configuración
	cfg := config.CargarConfig()

	// Inicializar cifrado AES-256-GCM
	if cfg.EncryptionKey != "" {
		utils.InitCrypto(cfg.EncryptionKey)
		log.Println("✓ Cifrado AES-256-GCM inicializado")
	} else {
		log.Println("⚠ ENCRYPTION_KEY no configurada — cifrado deshabilitado")
	}

	// Conectar a PostgreSQL
	db := config.ConectarDB(cfg)
	defer db.Close()

	// Conectar a Redis
	rdb := config.ConectarRedis(cfg)
	defer rdb.Close()

	// Configurar modo Gin
	gin.SetMode(cfg.GinMode)

	// Crear router
	router := gin.New()

	// Middleware global
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Configurar CORS
	corsConfig := cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-Id"},
		AllowCredentials: true,
	}
	router.Use(cors.New(corsConfig))

	// Iniciar WebSocket Hub si está habilitado
	if cfg.EnableWS {
		hub := utils.GetWSHub()
		go hub.Ejecutar()
		log.Println("✓ WebSocket Hub iniciado")
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "restauflow-backend",
			"env":     cfg.Env,
		})
	})

	// Registrar todas las rutas
	rutas.RegistrarRutas(router, db, rdb, cfg)

	// Iniciar cron jobs
	cronScheduler := jobs.IniciarJobs(db, rdb, cfg)
	defer cronScheduler.Stop()

	// Iniciar servidor
	addr := cfg.ServerHost + ":" + cfg.ServerPort
	log.Printf("✓ RestauFlow Backend iniciado en %s (modo: %s)", addr, cfg.Env)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Error al iniciar servidor: %v", err)
		os.Exit(1)
	}
}
