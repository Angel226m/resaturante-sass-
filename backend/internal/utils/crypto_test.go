package utils

import (
	"strings"
	"sync"
	"testing"
)

// ==========================================
// Tests: Crypto (AES-256-GCM)
// ==========================================

const testEncryptionKey = "01234567890123456789012345678901" // 32 chars exactas

func initTestCrypto() {
	// Reset del singleton para tests
	gcmCipher = nil
	cryptoOnce = sync.Once{}
	InitCrypto(testEncryptionKey)
}

// --- EncryptFast (determinístico) ---
func TestEncryptFast_Success(t *testing.T) {
	initTestCrypto()

	encrypted, err := EncryptFast("test@email.com")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if encrypted == "" {
		t.Fatal("encrypted no debe ser vacío")
	}
	if encrypted == "test@email.com" {
		t.Fatal("encrypted no debe ser igual al plaintext")
	}
}

func TestEncryptFast_EmptyString(t *testing.T) {
	initTestCrypto()

	encrypted, err := EncryptFast("")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if encrypted != "" {
		t.Fatal("encrypted de vacío debe ser vacío")
	}
}

func TestEncryptFast_Deterministic(t *testing.T) {
	initTestCrypto()

	enc1, _ := EncryptFast("correo@test.com")
	enc2, _ := EncryptFast("correo@test.com")

	if enc1 != enc2 {
		t.Fatal("EncryptFast debe ser determinístico: mismo input = mismo output")
	}
}

func TestEncryptFast_CaseNormalization(t *testing.T) {
	initTestCrypto()

	enc1, _ := EncryptFast("Test@Email.COM")
	enc2, _ := EncryptFast("test@email.com")

	if enc1 != enc2 {
		t.Fatal("EncryptFast debe normalizar a minúsculas")
	}
}

func TestDecryptFast_Success(t *testing.T) {
	initTestCrypto()

	original := "datos-sensibles@test.com"
	encrypted, _ := EncryptFast(original)
	decrypted, err := DecryptFast(encrypted)

	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if decrypted != strings.ToLower(original) {
		t.Errorf("esperaba %q, obtuvo %q", strings.ToLower(original), decrypted)
	}
}

func TestDecryptFast_EmptyString(t *testing.T) {
	initTestCrypto()

	decrypted, err := DecryptFast("")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if decrypted != "" {
		t.Fatal("decrypt de vacío debe ser vacío")
	}
}

func TestDecryptFast_InvalidBase64(t *testing.T) {
	initTestCrypto()

	_, err := DecryptFast("esto-no-es-base64!!!")
	if err == nil {
		t.Fatal("esperaba error para base64 inválido")
	}
}

func TestDecryptFast_TamperedData(t *testing.T) {
	initTestCrypto()

	encrypted, _ := EncryptFast("dato-original")
	// Alterar un byte del final
	if len(encrypted) > 2 {
		tampered := encrypted[:len(encrypted)-2] + "AA"
		_, err := DecryptFast(tampered)
		if err == nil {
			t.Fatal("esperaba error para datos alterados")
		}
	}
}

// --- EncryptSecure (aleatorio) ---
func TestEncryptSecure_Success(t *testing.T) {
	initTestCrypto()

	encrypted, err := EncryptSecure("912345678")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if encrypted == "" {
		t.Fatal("encrypted no debe ser vacío")
	}
}

func TestEncryptSecure_NonDeterministic(t *testing.T) {
	initTestCrypto()

	enc1, _ := EncryptSecure("912345678")
	enc2, _ := EncryptSecure("912345678")

	if enc1 == enc2 {
		t.Fatal("EncryptSecure debe ser no-determinístico: diferente output cada vez")
	}
}

func TestDecryptSecure_Success(t *testing.T) {
	initTestCrypto()

	original := "912345678"
	encrypted, _ := EncryptSecure(original)
	decrypted, err := DecryptSecure(encrypted)

	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if decrypted != original {
		t.Errorf("esperaba %q, obtuvo %q", original, decrypted)
	}
}

func TestEncryptSecure_EmptyString(t *testing.T) {
	initTestCrypto()

	encrypted, err := EncryptSecure("")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if encrypted != "" {
		t.Fatal("encrypted de vacío debe ser vacío")
	}
}

// --- InitCrypto ---
func TestInitCrypto_InvalidKeyLength(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Fatal("esperaba panic para clave de longitud incorrecta")
		}
	}()

	gcmCipher = nil
	cryptoOnce = sync.Once{}
	InitCrypto("clave-corta") // < 32 chars
}

// --- Crypto no inicializado ---
func TestEncryptFast_NotInitialized(t *testing.T) {
	savedCipher := gcmCipher
	gcmCipher = nil
	defer func() { gcmCipher = savedCipher }()

	_, err := EncryptFast("test")
	if err == nil {
		t.Fatal("esperaba error cuando crypto no está inicializado")
	}
}

func TestDecryptFast_NotInitialized(t *testing.T) {
	savedCipher := gcmCipher
	gcmCipher = nil
	defer func() { gcmCipher = savedCipher }()

	_, err := DecryptFast("dGVzdA==")
	if err == nil {
		t.Fatal("esperaba error cuando crypto no está inicializado")
	}
}

// --- Roundtrip tests ---
func TestCrypto_FastRoundtrip_Multiple(t *testing.T) {
	initTestCrypto()

	cases := []string{
		"correo@empresa.com",
		"documento-12345678",
		"20123456789",
	}

	for _, original := range cases {
		encrypted, err := EncryptFast(original)
		if err != nil {
			t.Fatalf("EncryptFast(%q): %v", original, err)
		}
		decrypted, err := DecryptFast(encrypted)
		if err != nil {
			t.Fatalf("DecryptFast: %v", err)
		}
		expected := strings.ToLower(strings.TrimSpace(original))
		if decrypted != expected {
			t.Errorf("roundtrip: esperaba %q, obtuvo %q", expected, decrypted)
		}
	}
}

func TestCrypto_SecureRoundtrip_Multiple(t *testing.T) {
	initTestCrypto()

	cases := []string{
		"912345678",
		"987654321",
		"dato sensible 123",
	}

	for _, original := range cases {
		encrypted, err := EncryptSecure(original)
		if err != nil {
			t.Fatalf("EncryptSecure(%q): %v", original, err)
		}
		decrypted, err := DecryptSecure(encrypted)
		if err != nil {
			t.Fatalf("DecryptSecure: %v", err)
		}
		if decrypted != original {
			t.Errorf("roundtrip: esperaba %q, obtuvo %q", original, decrypted)
		}
	}
}
