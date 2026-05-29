package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
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
}

// CargarConfig carga la configuración desde variables de entorno
func CargarConfig() *Config {
	enableWS, _ := strconv.ParseBool(getEnv("ENABLE_WEBSOCKETS", "true"))

	return &Config{
		Env:              getEnv("ENV", "development"),
		GinMode:          getEnv("GIN_MODE", "debug"),
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		ServerHost:       getEnv("SERVER_HOST", "0.0.0.0"),
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
