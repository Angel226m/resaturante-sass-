package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/config"
	"github.com/restauflow/backend/internal/jobs"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/rutas"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// RestauFlow SaaS — Punto de entrada
// OWASP Hardened | ISO 27001
// ==========================================

func main() {
	// Cargar configuración
	cfg := config.CargarConfig()

	// Validar configuración crítica en producción
	if cfg.Env == "production" {
		if cfg.JWTSecret == "" || cfg.JWTRefreshSecret == "" {
			log.Fatal("FATAL: JWT_SECRET y JWT_REFRESH_SECRET son obligatorios en producción")
		}
		if cfg.EncryptionKey == "" {
			log.Fatal("FATAL: ENCRYPTION_KEY es obligatoria en producción")
		}
		if len(cfg.JWTSecret) < 32 {
			log.Fatal("FATAL: JWT_SECRET debe tener al menos 32 caracteres")
		}
	}

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
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(cfg.GinMode)
	}

	// Crear router
	router := gin.New()

	// --- Middleware de seguridad global (orden importa) ---

	// 1. Recovery (siempre primero)
	router.Use(gin.Recovery())

	// 2. Error handler personalizado
	router.Use(middleware.ErrorHandler())

	// 3. Security headers middleware
	router.Use(middleware.SecurityHeaders())

	// 4. Request ID
	router.Use(middleware.RequestID())

	// 5. Logger
	router.Use(middleware.Logger())

	// 6. IP Blacklist
	router.Use(middleware.CheckBlacklist(rdb))

	// 7. Host header validation (prevents Host header injection)
	router.Use(middleware.ValidateHost(cfg.AllowedHosts))

	// 8. CORS (hardened)
	corsConfig := cors.Config{
		AllowOrigins:     cfg.CORSOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-Id", "X-RateLimit-Limit", "X-RateLimit-Remaining"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(corsConfig))

	// 9. Request size limit for all body types (OWASP API4)
	router.Use(middleware.MaxBodyBytes(cfg.MaxRequestBytes))

	// 10. HTTPS redirect en producción
	if cfg.Env == "production" {
		router.Use(middleware.RequireHTTPS())
	}

	// Limitar tamaño de body (previene DoS)
	router.MaxMultipartMemory = 8 << 20 // 8 MB

	// Trusted proxies (OWASP: validate X-Forwarded-For)
	if err := router.SetTrustedProxies([]string{"10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"}); err != nil {
		log.Fatalf("FATAL: trusted proxies inválidos: %v", err)
	}

	// Iniciar WebSocket Hub si está habilitado
	if cfg.EnableWS {
		hub := utils.GetWSHub()
		go hub.Ejecutar()
		log.Println("✓ WebSocket Hub iniciado")
	}

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
