package utils

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// ==========================================
// Password — bcrypt costo 14
// RestauFlow SaaS Multi-Tenant
// ==========================================

const bcryptCost = 14

// HashPassword genera un hash bcrypt con costo 14
func HashPassword(password string) (string, error) {
	if len(password) < 8 {
		return "", errors.New("la contraseña debe tener al menos 8 caracteres")
	}

	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", errors.New("error al generar hash de contraseña")
	}

	return string(bytes), nil
}

// CheckPasswordHash verifica una contraseña contra su hash bcrypt
func CheckPasswordHash(password, hash string) bool {
	// Verificar que parece un hash bcrypt válido
	if !strings.HasPrefix(hash, "$2a$") && !strings.HasPrefix(hash, "$2b$") {
		return false
	}

	defer func() {
		// Recover de cualquier panic inesperado en bcrypt
		recover()
	}()

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
