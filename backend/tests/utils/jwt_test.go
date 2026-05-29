package utils_test

import (
	"os"
	"testing"

	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Tests: JWT (Access + Refresh + SuperAdmin)
// ==========================================

func setupJWTEnv(t *testing.T) {
	t.Helper()
	os.Setenv("JWT_SECRET", "test-secret-key-for-unit-tests!!")
	os.Setenv("JWT_REFRESH_SECRET", "test-refresh-secret-for-tests!!")
	t.Cleanup(func() {
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("JWT_REFRESH_SECRET")
	})
}

// --- Access Token ---
func TestGenerarAccessToken_Success(t *testing.T) {
	setupJWTEnv(t)

	token, err := utils.GenerarAccessToken(1, "tenant-uuid-123", "ADMIN", 10)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if token == "" {
		t.Fatal("token no debe ser vacío")
	}
}

func TestGenerarAccessToken_NoSecret(t *testing.T) {
	os.Unsetenv("JWT_SECRET")
	_, err := utils.GenerarAccessToken(1, "tenant-uuid", "ADMIN", 1)
	if err == nil {
		t.Fatal("esperaba error cuando JWT_SECRET no está configurado")
	}
}

func TestValidarAccessToken_Success(t *testing.T) {
	setupJWTEnv(t)

	token, _ := utils.GenerarAccessToken(42, "tenant-abc", "MESERO", 5)
	claims, err := utils.ValidarAccessToken(token)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if claims.UserID != 42 {
		t.Errorf("UserID: esperaba 42, obtuvo %d", claims.UserID)
	}
	if claims.TenantID != "tenant-abc" {
		t.Errorf("TenantID: esperaba 'tenant-abc', obtuvo %q", claims.TenantID)
	}
	if claims.Rol != "MESERO" {
		t.Errorf("Rol: esperaba 'MESERO', obtuvo %q", claims.Rol)
	}
	if claims.LocalID != 5 {
		t.Errorf("LocalID: esperaba 5, obtuvo %d", claims.LocalID)
	}
}

func TestValidarAccessToken_InvalidToken(t *testing.T) {
	setupJWTEnv(t)

	_, err := utils.ValidarAccessToken("token.invalido.aqui")
	if err == nil {
		t.Fatal("esperaba error para token inválido")
	}
}

func TestValidarAccessToken_WrongSecret(t *testing.T) {
	os.Setenv("JWT_SECRET", "secret-original-para-generar!!!")
	token, _ := utils.GenerarAccessToken(1, "t", "ADMIN", 1)

	os.Setenv("JWT_SECRET", "secret-diferente-para-validar!!")
	_, err := utils.ValidarAccessToken(token)
	if err == nil {
		t.Fatal("esperaba error cuando el secret no coincide")
	}
	os.Unsetenv("JWT_SECRET")
}

// --- Refresh Token ---
func TestGenerarRefreshToken_Success(t *testing.T) {
	setupJWTEnv(t)

	token, err := utils.GenerarRefreshToken(1, "tenant-uuid", false)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if token == "" {
		t.Fatal("refresh token no debe ser vacío")
	}
}

func TestGenerarRefreshToken_RememberMe(t *testing.T) {
	setupJWTEnv(t)

	token, err := utils.GenerarRefreshToken(1, "tenant-uuid", true)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if token == "" {
		t.Fatal("refresh token con rememberMe no debe ser vacío")
	}
}

func TestValidarRefreshToken_Success(t *testing.T) {
	setupJWTEnv(t)

	token, _ := utils.GenerarRefreshToken(99, "tenant-xyz", false)
	subject, tenantID, rememberMe, err := utils.ValidarRefreshToken(token)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if subject != "usuario:99" {
		t.Errorf("Subject: esperaba 'usuario:99', obtuvo %q", subject)
	}
	if tenantID != "tenant-xyz" {
		t.Errorf("TenantID: esperaba 'tenant-xyz', obtuvo %q", tenantID)
	}
	if rememberMe {
		t.Error("rememberMe: esperaba false para token sin remember-me")
	}
}

func TestValidarRefreshToken_RememberMe(t *testing.T) {
	setupJWTEnv(t)

	token, _ := utils.GenerarRefreshToken(7, "tenant-rem", true)
	_, _, rememberMe, err := utils.ValidarRefreshToken(token)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if !rememberMe {
		t.Error("rememberMe: esperaba true para token con remember-me")
	}
}

func TestValidarRefreshToken_Invalid(t *testing.T) {
	setupJWTEnv(t)

	_, _, _, err := utils.ValidarRefreshToken("token.invalido.test")
	if err == nil {
		t.Fatal("esperaba error para refresh token inválido")
	}
}

// --- SuperAdmin Token ---
func TestGenerarAccessTokenSuperAdmin_Success(t *testing.T) {
	setupJWTEnv(t)

	token, err := utils.GenerarAccessTokenSuperAdmin(1, "superadmin")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if token == "" {
		t.Fatal("token de superadmin no debe ser vacío")
	}
}

func TestValidarAccessTokenSuperAdmin_Success(t *testing.T) {
	setupJWTEnv(t)

	token, _ := utils.GenerarAccessTokenSuperAdmin(7, "admin")
	claims, err := utils.ValidarAccessTokenSuperAdmin(token)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if claims.SuperAdminID != 7 {
		t.Errorf("SuperAdminID: esperaba 7, obtuvo %d", claims.SuperAdminID)
	}
	if claims.Nivel != "admin" {
		t.Errorf("Nivel: esperaba 'admin', obtuvo %q", claims.Nivel)
	}
}

func TestValidarAccessTokenSuperAdmin_Invalid(t *testing.T) {
	setupJWTEnv(t)

	_, err := utils.ValidarAccessTokenSuperAdmin("token-falso")
	if err == nil {
		t.Fatal("esperaba error para token de superadmin inválido")
	}
}

func TestGenerarRefreshTokenSuperAdmin_Success(t *testing.T) {
	setupJWTEnv(t)

	token, err := utils.GenerarRefreshTokenSuperAdmin(3)
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if token == "" {
		t.Fatal("refresh token de superadmin no debe ser vacío")
	}
}

// --- Cross-validation: tokens no deben ser intercambiables ---
func TestAccessToken_NoUsableAsRefresh(t *testing.T) {
	setupJWTEnv(t)

	accessToken, _ := utils.GenerarAccessToken(1, "t", "ADMIN", 1)
	_, _, _, err := utils.ValidarRefreshToken(accessToken)
	if err == nil {
		t.Fatal("access token no debería validar como refresh token")
	}
}

func TestEsDesarrollo(t *testing.T) {
	os.Setenv("ENV", "development")
	if !utils.EsDesarrollo() {
		t.Error("esperaba true para ENV=development")
	}

	os.Setenv("ENV", "production")
	if utils.EsDesarrollo() {
		t.Error("esperaba false para ENV=production")
	}
	os.Unsetenv("ENV")
}
