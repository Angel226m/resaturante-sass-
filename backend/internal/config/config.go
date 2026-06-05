package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

// ==========================================
// Configuración de la aplicación
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Config contiene toda la configuración de la aplicación
type Config struct {
	Env              string
	GinMode          string
	ServerPort       string
	ServerHost       string
	AllowedHosts     []string
	MaxRequestBytes  int64
	DBHost           string
	DBPort           string
	DBName           string
	DBUser           string
	DBPassword       string
	DBSSLMode        string
	RedisHost        string
	RedisPort        string
	RedisPassword    string
	CORSOrigin       string
	JWTSecret        string
	JWTRefreshSecret string
	EncryptionKey    string
	ResendAPIKey     string
	EnableWS         bool
	CORSOrigins      []string
}

// CargarConfig carga la configuración desde variables de entorno
func CargarConfig() *Config {
	enableWS, _ := strconv.ParseBool(getEnv("ENABLE_WEBSOCKETS", "true"))
	maxRequestBytes, err := strconv.ParseInt(getEnv("MAX_REQUEST_BODY_BYTES", "1048576"), 10, 64)
	if err != nil || maxRequestBytes <= 0 {
		maxRequestBytes = 1048576 // 1MB
	}

	corsOrigins := parseCSV(getEnv("CORS_ORIGIN", "http://localhost:5173"))
	if len(corsOrigins) == 0 {
		corsOrigins = []string{"http://localhost:5173"}
	}

	allowedHosts := parseCSV(getEnv("ALLOWED_HOSTS", "localhost,127.0.0.1,backend,nginx"))
	if len(allowedHosts) == 0 {
		allowedHosts = []string{"localhost", "127.0.0.1", "backend", "nginx"}
	}

	return &Config{
		Env:              getEnv("ENV", "development"),
		GinMode:          getEnv("GIN_MODE", "debug"),
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		ServerHost:       getEnv("SERVER_HOST", "0.0.0.0"),
		AllowedHosts:     allowedHosts,
		MaxRequestBytes:  maxRequestBytes,
		DBHost:           getEnv("DB_HOST", "db"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBName:           getEnv("DB_NAME", "restauflow"),
		DBUser:           getEnv("DB_USER", "postgres"),
		DBPassword:       getEnv("DB_PASSWORD", "postgres"),
		DBSSLMode:        getEnv("DB_SSL_MODE", "disable"),
		RedisHost:        getEnv("REDIS_HOST", "redis"),
		RedisPort:        getEnv("REDIS_PORT", "6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		CORSOrigin:       getEnv("CORS_ORIGIN", "http://localhost:5173"),
		JWTSecret:        getEnv("JWT_SECRET", ""),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", ""),
		EncryptionKey:    getEnv("ENCRYPTION_KEY", ""),
		ResendAPIKey:     getEnv("RESEND_API_KEY", ""),
		EnableWS:         enableWS,
		CORSOrigins:      corsOrigins,
	}
}

// ConectarDB establece conexión con PostgreSQL y retorna *sql.DB
func ConectarDB(cfg *Config) *sql.DB {
	sslMode := cfg.DBSSLMode

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, sslMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Error al abrir conexión con PostgreSQL: %v", err)
	}

	// Pool de conexiones optimizado
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	// Verificar conexión
	if err := db.Ping(); err != nil {
		log.Fatalf("Error al conectar con PostgreSQL: %v", err)
	}

	log.Println("✓ Conectado a PostgreSQL:", cfg.DBName)
	return db
}

// ConectarRedis establece conexión con Redis
func ConectarRedis(cfg *Config) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisHost + ":" + cfg.RedisPort,
		Password: cfg.RedisPassword,
		DB:       0,
	})

	log.Println("✓ Conectado a Redis:", cfg.RedisHost+":"+cfg.RedisPort)
	return rdb
}

// EsDesarrollo retorna true si estamos en modo desarrollo
func (c *Config) EsDesarrollo() bool {
	return c.Env == "development"
}

// EsProduccion retorna true si estamos en modo producción
func (c *Config) EsProduccion() bool {
	return c.Env == "production"
}

// getEnv obtiene variable de entorno con valor por defecto
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func parseCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
