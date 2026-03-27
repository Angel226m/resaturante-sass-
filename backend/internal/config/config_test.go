package config

import (
	"os"
	"testing"
)

// ==========================================
// Tests: Config
// ==========================================

func TestCargarConfig_Defaults(t *testing.T) {
	// Limpiar variables que puedan existir
	vars := []string{"ENV", "GIN_MODE", "SERVER_PORT", "SERVER_HOST", "DB_HOST", "DB_PORT", "DB_NAME",
		"DB_USER", "DB_PASSWORD", "REDIS_HOST", "REDIS_PORT", "CORS_ORIGIN", "JWT_SECRET",
		"JWT_REFRESH_SECRET", "ENCRYPTION_KEY", "ENABLE_WEBSOCKETS"}
	for _, v := range vars {
		os.Unsetenv(v)
	}

	cfg := CargarConfig()

	if cfg.Env != "development" {
		t.Errorf("Env: esperaba 'development', obtuvo %q", cfg.Env)
	}
	if cfg.GinMode != "debug" {
		t.Errorf("GinMode: esperaba 'debug', obtuvo %q", cfg.GinMode)
	}
	if cfg.ServerPort != "8080" {
		t.Errorf("ServerPort: esperaba '8080', obtuvo %q", cfg.ServerPort)
	}
	if cfg.ServerHost != "0.0.0.0" {
		t.Errorf("ServerHost: esperaba '0.0.0.0', obtuvo %q", cfg.ServerHost)
	}
	if cfg.DBHost != "db" {
		t.Errorf("DBHost: esperaba 'db', obtuvo %q", cfg.DBHost)
	}
	if cfg.DBPort != "5432" {
		t.Errorf("DBPort: esperaba '5432', obtuvo %q", cfg.DBPort)
	}
	if cfg.DBName != "restauflow" {
		t.Errorf("DBName: esperaba 'restauflow', obtuvo %q", cfg.DBName)
	}
	if cfg.DBUser != "postgres" {
		t.Errorf("DBUser: esperaba 'postgres', obtuvo %q", cfg.DBUser)
	}
	if cfg.RedisHost != "redis" {
		t.Errorf("RedisHost: esperaba 'redis', obtuvo %q", cfg.RedisHost)
	}
	if cfg.CORSOrigin != "http://localhost:5173" {
		t.Errorf("CORSOrigin: esperaba 'http://localhost:5173', obtuvo %q", cfg.CORSOrigin)
	}
	if !cfg.EnableWS {
		t.Error("EnableWS: esperaba true por defecto")
	}
}

func TestCargarConfig_FromEnv(t *testing.T) {
	os.Setenv("ENV", "production")
	os.Setenv("SERVER_PORT", "3000")
	os.Setenv("DB_HOST", "prod-db.example.com")
	os.Setenv("ENABLE_WEBSOCKETS", "false")
	defer func() {
		os.Unsetenv("ENV")
		os.Unsetenv("SERVER_PORT")
		os.Unsetenv("DB_HOST")
		os.Unsetenv("ENABLE_WEBSOCKETS")
	}()

	cfg := CargarConfig()

	if cfg.Env != "production" {
		t.Errorf("Env: esperaba 'production', obtuvo %q", cfg.Env)
	}
	if cfg.ServerPort != "3000" {
		t.Errorf("ServerPort: esperaba '3000', obtuvo %q", cfg.ServerPort)
	}
	if cfg.DBHost != "prod-db.example.com" {
		t.Errorf("DBHost: esperaba 'prod-db.example.com', obtuvo %q", cfg.DBHost)
	}
	if cfg.EnableWS {
		t.Error("EnableWS: esperaba false")
	}
}

func TestConfig_EsDesarrollo(t *testing.T) {
	cfg := &Config{Env: "development"}
	if !cfg.EsDesarrollo() {
		t.Error("esperaba true para ENV=development")
	}

	cfg.Env = "production"
	if cfg.EsDesarrollo() {
		t.Error("esperaba false para ENV=production")
	}
}

func TestConfig_EsProduccion(t *testing.T) {
	cfg := &Config{Env: "production"}
	if !cfg.EsProduccion() {
		t.Error("esperaba true para ENV=production")
	}

	cfg.Env = "development"
	if cfg.EsProduccion() {
		t.Error("esperaba false para ENV=development")
	}
}

func TestGetEnv_WithValue(t *testing.T) {
	os.Setenv("TEST_VAR_RESTAUFLOW", "valor-test")
	defer os.Unsetenv("TEST_VAR_RESTAUFLOW")

	result := getEnv("TEST_VAR_RESTAUFLOW", "default")
	if result != "valor-test" {
		t.Errorf("esperaba 'valor-test', obtuvo %q", result)
	}
}

func TestGetEnv_Default(t *testing.T) {
	os.Unsetenv("TEST_VAR_NO_EXISTE")

	result := getEnv("TEST_VAR_NO_EXISTE", "mi-default")
	if result != "mi-default" {
		t.Errorf("esperaba 'mi-default', obtuvo %q", result)
	}
}
