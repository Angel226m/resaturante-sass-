package utils_test

import (
	"strings"
	"testing"

	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Tests: Crypto (AES-256-GCM)
// ==========================================

const testEncryptionKey = "01234567890123456789012345678901" // 32 chars exactas

func initTestCrypto() {
	utils.ResetCryptoForTesting(testEncryptionKey)
}

// --- EncryptFast (determinístico) ---
func TestEncryptFast_Success(t *testing.T) {
	initTestCrypto()

	encrypted, err := utils.EncryptFast("test@email.com")
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

	encrypted, err := utils.EncryptFast("")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if encrypted != "" {
		t.Fatal("encrypted de vacío debe ser vacío")
	}
}

func TestEncryptFast_Deterministic(t *testing.T) {
	initTestCrypto()

	enc1, _ := utils.EncryptFast("correo@test.com")
	enc2, _ := utils.EncryptFast("correo@test.com")

	if enc1 != enc2 {
		t.Fatal("EncryptFast debe ser determinístico: mismo input = mismo output")
	}
}

func TestEncryptFast_CaseNormalization(t *testing.T) {
	initTestCrypto()

	enc1, _ := utils.EncryptFast("Test@Email.COM")
	enc2, _ := utils.EncryptFast("test@email.com")

	if enc1 != enc2 {
		t.Fatal("EncryptFast debe normalizar a minúsculas")
	}
}

func TestDecryptFast_Success(t *testing.T) {
	initTestCrypto()

	original := "datos-sensibles@test.com"
	encrypted, _ := utils.EncryptFast(original)
	decrypted, err := utils.DecryptFast(encrypted)

	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if decrypted != strings.ToLower(original) {
		t.Errorf("esperaba %q, obtuvo %q", strings.ToLower(original), decrypted)
	}
}

func TestDecryptFast_EmptyString(t *testing.T) {
	initTestCrypto()

	decrypted, err := utils.DecryptFast("")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if decrypted != "" {
		t.Fatal("decrypt de vacío debe ser vacío")
	}
}

func TestDecryptFast_InvalidBase64(t *testing.T) {
	initTestCrypto()

	_, err := utils.DecryptFast("esto-no-es-base64!!!")
	if err == nil {
		t.Fatal("esperaba error para base64 inválido")
	}
}

func TestDecryptFast_TamperedData(t *testing.T) {
	initTestCrypto()

	encrypted, _ := utils.EncryptFast("dato-original")
	// Alterar un byte del final
	if len(encrypted) > 2 {
		tampered := encrypted[:len(encrypted)-2] + "AA"
		_, err := utils.DecryptFast(tampered)
		if err == nil {
			t.Fatal("esperaba error para datos alterados")
		}
	}
}

// --- EncryptSecure (aleatorio) ---
func TestEncryptSecure_Success(t *testing.T) {
	initTestCrypto()

	encrypted, err := utils.EncryptSecure("912345678")
	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if encrypted == "" {
		t.Fatal("encrypted no debe ser vacío")
	}
}

func TestEncryptSecure_NonDeterministic(t *testing.T) {
	initTestCrypto()

	enc1, _ := utils.EncryptSecure("912345678")
	enc2, _ := utils.EncryptSecure("912345678")

	if enc1 == enc2 {
		t.Fatal("EncryptSecure debe ser no-determinístico: diferente output cada vez")
	}
}

func TestDecryptSecure_Success(t *testing.T) {
	initTestCrypto()

	original := "912345678"
	encrypted, _ := utils.EncryptSecure(original)
	decrypted, err := utils.DecryptSecure(encrypted)

	if err != nil {
		t.Fatalf("esperaba nil, obtuvo: %v", err)
	}
	if decrypted != original {
		t.Errorf("esperaba %q, obtuvo %q", original, decrypted)
	}
}

func TestEncryptSecure_EmptyString(t *testing.T) {
	initTestCrypto()

	encrypted, err := utils.EncryptSecure("")
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
		// Restaurar singleton para tests posteriores
		utils.ResetCryptoForTesting(testEncryptionKey)
	}()

	utils.ResetCryptoOnceForTesting()
	utils.InitCrypto("clave-corta") // < 32 chars → panic
}

// --- Crypto no inicializado ---
func TestEncryptFast_NotInitialized(t *testing.T) {
	savedCipher := utils.ClearCryptoForTesting()
	defer utils.RestoreCryptoForTesting(savedCipher)

	_, err := utils.EncryptFast("test")
	if err == nil {
		t.Fatal("esperaba error cuando crypto no está inicializado")
	}
}

func TestDecryptFast_NotInitialized(t *testing.T) {
	savedCipher := utils.ClearCryptoForTesting()
	defer utils.RestoreCryptoForTesting(savedCipher)

	_, err := utils.DecryptFast("dGVzdA==")
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
		encrypted, err := utils.EncryptFast(original)
		if err != nil {
			t.Fatalf("EncryptFast(%q): %v", original, err)
		}
		decrypted, err := utils.DecryptFast(encrypted)
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
		encrypted, err := utils.EncryptSecure(original)
		if err != nil {
			t.Fatalf("EncryptSecure(%q): %v", original, err)
		}
		decrypted, err := utils.DecryptSecure(encrypted)
		if err != nil {
			t.Fatalf("DecryptSecure: %v", err)
		}
		if decrypted != original {
			t.Errorf("secure roundtrip: esperaba %q, obtuvo %q", original, decrypted)
		}
	}
}
