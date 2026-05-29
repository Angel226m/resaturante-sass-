package utils

import (
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// ==========================================
// JWT HttpOnly — access + refresh
// RestauFlow SaaS Multi-Tenant
// ==========================================

// JWTClaims son los claims del token de acceso
type JWTClaims struct {
	UserID   int    `json:"user_id"`
	TenantID string `json:"tenant_id"`
	Rol      string `json:"rol"`
	LocalID  int    `json:"local_id,omitempty"`
	jwt.RegisteredClaims
}

// SuperAdminClaims son los claims del token de superadmin
type SuperAdminClaims struct {
	SuperAdminID int    `json:"superadmin_id"`
	Nivel        string `json:"nivel"`
	jwt.RegisteredClaims
}

// GenerarAccessToken genera un token de acceso JWT (10 minutos)
func GenerarAccessToken(userID int, tenantID, rol string, localID int) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET no configurado")
	}

	claims := JWTClaims{
		UserID:   userID,
		TenantID: tenantID,
		Rol:      rol,
		LocalID:  localID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "usuario:" + strconv.Itoa(userID),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "restauflow",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// RefreshClaims claims del token de refresco con soporte remember-me
type RefreshClaims struct {
	TenantID   string `json:"tid"`
	RememberMe bool   `json:"rem"`
	jwt.RegisteredClaims
}

// GenerarRefreshToken genera un token de refresco JWT
// rememberMe: true → 7 días, false → 1 hora
func GenerarRefreshToken(userID int, tenantID string, rememberMe bool) (string, error) {
	secret := os.Getenv("JWT_REFRESH_SECRET")
	if secret == "" {
		return "", errors.New("JWT_REFRESH_SECRET no configurado")
	}

	duracion := 1 * time.Hour
	if rememberMe {
		duracion = 7 * 24 * time.Hour
	}

	claims := RefreshClaims{
		TenantID:   tenantID,
		RememberMe: rememberMe,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "usuario:" + strconv.Itoa(userID),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duracion)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "restauflow-refresh",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidarAccessToken valida un token de acceso y retorna los claims
func ValidarAccessToken(tokenString string) (*JWTClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET no configurado")
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de firma inesperado")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, errors.New("token de acceso inválido o expirado")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("token de acceso inválido")
	}

	return claims, nil
}

// ValidarRefreshToken valida un token de refresco y retorna subject, tenantID y rememberMe
func ValidarRefreshToken(tokenString string) (string, string, bool, error) {
	secret := os.Getenv("JWT_REFRESH_SECRET")
	if secret == "" {
		return "", "", false, errors.New("JWT_REFRESH_SECRET no configurado")
	}

	token, err := jwt.ParseWithClaims(tokenString, &RefreshClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de firma inesperado")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return "", "", false, errors.New("token de refresco inválido o expirado")
	}

	claims, ok := token.Claims.(*RefreshClaims)
	if !ok || !token.Valid {
		return "", "", false, errors.New("token de refresco inválido")
	}

	return claims.Subject, claims.TenantID, claims.RememberMe, nil
}

// GenerarAccessTokenSuperAdmin genera un token de acceso para SuperAdmin (15 min)
func GenerarAccessTokenSuperAdmin(superAdminID int, nivel string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET no configurado")
	}

	claims := SuperAdminClaims{
		SuperAdminID: superAdminID,
		Nivel:        nivel,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "superadmin:" + strconv.Itoa(superAdminID),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "restauflow-admin",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// GenerarRefreshTokenSuperAdmin genera un refresh token para SuperAdmin
func GenerarRefreshTokenSuperAdmin(superAdminID int) (string, error) {
	secret := os.Getenv("JWT_REFRESH_SECRET")
	if secret == "" {
		return "", errors.New("JWT_REFRESH_SECRET no configurado")
	}

	claims := jwt.RegisteredClaims{
		Subject:   "superadmin:" + strconv.Itoa(superAdminID),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(2 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "restauflow-admin-refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidarAccessTokenSuperAdmin valida token de acceso de SuperAdmin
func ValidarAccessTokenSuperAdmin(tokenString string) (*SuperAdminClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET no configurado")
	}

	token, err := jwt.ParseWithClaims(tokenString, &SuperAdminClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de firma inesperado")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, errors.New("token de superadmin inválido o expirado")
	}

	claims, ok := token.Claims.(*SuperAdminClaims)
	if !ok || !token.Valid {
		return nil, errors.New("token de superadmin inválido")
	}

	return claims, nil
}

// EsDesarrollo verifica si el entorno es desarrollo
func EsDesarrollo() bool {
	return os.Getenv("ENV") == "development"
}
