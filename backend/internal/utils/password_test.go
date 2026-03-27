package utils

import (
	"strings"
	"testing"
)

// ==========================================
// Tests: Password (bcrypt)
// ==========================================

func TestHashPassword_Valid(t *testing.T) {
	hash, err := HashPassword("Passw0rd!Seguro")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo error: %v", err)
	}
	if hash == "" {
		t.Fatal("hash no debe ser vacío")
	}
	if !strings.HasPrefix(hash, "$2a$") && !strings.HasPrefix(hash, "$2b$") {
		t.Fatal("hash debe ser bcrypt válido ($2a$ o $2b$)")
	}
}

func TestHashPassword_TooShort(t *testing.T) {
	_, err := HashPassword("1234567")
	if err == nil {
		t.Fatal("esperaba error para contraseña < 8 chars")
	}
}

func TestHashPassword_ExactlyEight(t *testing.T) {
	hash, err := HashPassword("12345678")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo error: %v", err)
	}
	if hash == "" {
		t.Fatal("hash no debe ser vacío")
	}
}

func TestCheckPasswordHash_Correct(t *testing.T) {
	password := "MiContraseña123!"
	hash, _ := HashPassword(password)

	if !CheckPasswordHash(password, hash) {
		t.Fatal("esperaba match correcto")
	}
}

func TestCheckPasswordHash_Incorrect(t *testing.T) {
	hash, _ := HashPassword("PasswordReal1!")

	if CheckPasswordHash("PasswordFalso!", hash) {
		t.Fatal("no debería coincidir con password incorrecto")
	}
}

func TestCheckPasswordHash_InvalidHash(t *testing.T) {
	if CheckPasswordHash("test12345", "not-a-bcrypt-hash") {
		t.Fatal("no debería coincidir con hash inválido")
	}
}

func TestCheckPasswordHash_EmptyHash(t *testing.T) {
	if CheckPasswordHash("test12345", "") {
		t.Fatal("no debería coincidir con hash vacío")
	}
}

func TestHashPassword_Uniqueness(t *testing.T) {
	password := "MismaContraseña1!"
	hash1, _ := HashPassword(password)
	hash2, _ := HashPassword(password)

	if hash1 == hash2 {
		t.Fatal("dos hashes de la misma contraseña deben ser diferentes (salt aleatorio)")
	}
	// Ambos deben verificar correctamente
	if !CheckPasswordHash(password, hash1) || !CheckPasswordHash(password, hash2) {
		t.Fatal("ambos hashes deben verificar correctamente")
	}
}
