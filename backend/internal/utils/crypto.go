package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"strings"
	"sync"
)

// ==========================================
// AES-256-GCM — Dos modos de cifrado
// RestauFlow SaaS Multi-Tenant
// ==========================================

var (
	gcmCipher  cipher.AEAD
	cryptoOnce sync.Once
	cryptoKey  []byte
)

// InitCrypto inicializa el cifrado con la clave maestra.
// La clave DEBE tener exactamente 32 caracteres.
// Falla hard si la clave no es válida.
func InitCrypto(masterKey string) {
	cryptoOnce.Do(func() {
		if len(masterKey) != 32 {
			panic("ENCRYPTION_KEY debe tener exactamente 32 caracteres")
		}
		cryptoKey = []byte(masterKey)
		block, err := aes.NewCipher(cryptoKey)
		if err != nil {
			panic("Error al crear cifrador AES: " + err.Error())
		}
		gcm, err := cipher.NewGCM(block)
		if err != nil {
			panic("Error al crear GCM: " + err.Error())
		}
		gcmCipher = gcm
	})
}

// EncryptFast — cifrado DETERMINÍSTICO
// Mismo input = mismo ciphertext → permite WHERE campo = $1
// Usar en: correos, documentos, RUC
func EncryptFast(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}
	if gcmCipher == nil {
		return "", errors.New("crypto no inicializado, llamar InitCrypto primero")
	}

	// Normalizar: minúsculas + trim
	normalized := strings.ToLower(strings.TrimSpace(plaintext))

	// Nonce determinístico: primeros NonceSize bytes del texto normalizado (padding con zeros)
	nonceSize := gcmCipher.NonceSize()
	nonce := make([]byte, nonceSize)
	copy(nonce, []byte(normalized))

	ciphertext := gcmCipher.Seal(nonce, nonce, []byte(normalized), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptFast descifra texto cifrado con EncryptFast
func DecryptFast(ciphertext string) (string, error) {
	if ciphertext == "" {
		return "", nil
	}
	if gcmCipher == nil {
		return "", errors.New("crypto no inicializado, llamar InitCrypto primero")
	}

	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", errors.New("error al decodificar base64")
	}

	nonceSize := gcmCipher.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext muy corto")
	}

	nonce, encrypted := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcmCipher.Open(nil, nonce, encrypted, nil)
	if err != nil {
		return "", errors.New("error al descifrar datos")
	}

	return string(plaintext), nil
}

// EncryptSecure — cifrado ALEATORIO
// Diferente ciphertext cada vez → sin búsqueda directa
// Usar en: celulares, teléfonos
func EncryptSecure(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}
	if gcmCipher == nil {
		return "", errors.New("crypto no inicializado, llamar InitCrypto primero")
	}

	nonce := make([]byte, gcmCipher.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", errors.New("error al generar nonce aleatorio")
	}

	ciphertext := gcmCipher.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptSecure descifra texto cifrado con EncryptSecure
func DecryptSecure(ciphertext string) (string, error) {
	if ciphertext == "" {
		return "", nil
	}
	if gcmCipher == nil {
		return "", errors.New("crypto no inicializado, llamar InitCrypto primero")
	}

	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", errors.New("error al decodificar base64")
	}

	nonceSize := gcmCipher.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext muy corto")
	}

	nonce, encrypted := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcmCipher.Open(nil, nonce, encrypted, nil)
	if err != nil {
		return "", errors.New("error al descifrar datos")
	}

	return string(plaintext), nil
}

// ==========================================
// Helpers por tipo de dato
// ==========================================

// EncryptCorreo cifra un correo electrónico (determinístico)
func EncryptCorreo(correo string) (string, error) { return EncryptFast(correo) }

// DecryptCorreo descifra un correo electrónico
func DecryptCorreo(correo string) (string, error) { return DecryptFast(correo) }

// EncryptNumeroDocumento cifra un número de documento (determinístico)
func EncryptNumeroDocumento(doc string) (string, error) { return EncryptFast(doc) }

// DecryptNumeroDocumento descifra un número de documento
func DecryptNumeroDocumento(doc string) (string, error) { return DecryptFast(doc) }

// ==========================================
// Helpers exclusivos para tests
// ==========================================

// ResetCryptoForTesting reinicializa el singleton con una clave nueva.
// Solo para uso en tests; no llamar desde código de producción.
func ResetCryptoForTesting(key string) {
	gcmCipher = nil
	cryptoOnce = sync.Once{}
	InitCrypto(key)
}

// ClearCryptoForTesting limpia el cipher activo y devuelve el anterior.
// Solo para uso en tests.
func ClearCryptoForTesting() cipher.AEAD {
	prev := gcmCipher
	gcmCipher = nil
	return prev
}

// RestoreCryptoForTesting restaura un cipher previamente guardado.
// Solo para uso en tests.
func RestoreCryptoForTesting(c cipher.AEAD) {
	gcmCipher = c
}

// ResetCryptoOnceForTesting resetea el singleton sin inicializar.
// Permite llamar a InitCrypto de nuevo desde los tests.
// Solo para uso en tests.
func ResetCryptoOnceForTesting() {
	gcmCipher = nil
	cryptoOnce = sync.Once{}
}

// EncryptRUC cifra un RUC (determinístico)
func EncryptRUC(ruc string) (string, error) { return EncryptFast(ruc) }

// DecryptRUC descifra un RUC
func DecryptRUC(ruc string) (string, error) { return DecryptFast(ruc) }

// EncryptNumeroCelular cifra un número de celular (aleatorio)
func EncryptNumeroCelular(cel string) (string, error) { return EncryptSecure(cel) }

// DecryptNumeroCelular descifra un número de celular
func DecryptNumeroCelular(cel string) (string, error) { return DecryptSecure(cel) }

// EncryptTelefono cifra un teléfono (aleatorio)
func EncryptTelefono(tel string) (string, error) { return EncryptSecure(tel) }

// DecryptTelefono descifra un teléfono
func DecryptTelefono(tel string) (string, error) { return DecryptSecure(tel) }

// EncryptCuentaBancaria cifra una cuenta bancaria (determinístico)
func EncryptCuentaBancaria(cuenta string) (string, error) { return EncryptFast(cuenta) }

// DecryptCuentaBancaria descifra una cuenta bancaria
func DecryptCuentaBancaria(cuenta string) (string, error) { return DecryptFast(cuenta) }

// DatosPersonaCifrados contiene los datos personales cifrados
type DatosPersonaCifrados struct {
	Correo          string
	NumeroDocumento string
	NumeroCelular   string
}

// CifrarDatosPersona cifra correo (Fast), documento (Fast) y celular (Secure)
func CifrarDatosPersona(correo, doc, cel string) (DatosPersonaCifrados, error) {
	var resultado DatosPersonaCifrados
	var err error

	if resultado.Correo, err = EncryptCorreo(correo); err != nil {
		return resultado, err
	}
	if resultado.NumeroDocumento, err = EncryptNumeroDocumento(doc); err != nil {
		return resultado, err
	}
	if resultado.NumeroCelular, err = EncryptNumeroCelular(cel); err != nil {
		return resultado, err
	}

	return resultado, nil
}

// DescifrarDatosPersona descifra correo, documento y celular
func DescifrarDatosPersona(correo, doc, cel string) (DatosPersonaCifrados, error) {
	var resultado DatosPersonaCifrados
	var err error

	if resultado.Correo, err = DecryptCorreo(correo); err != nil {
		return resultado, err
	}
	if resultado.NumeroDocumento, err = DecryptNumeroDocumento(doc); err != nil {
		return resultado, err
	}
	if resultado.NumeroCelular, err = DecryptNumeroCelular(cel); err != nil {
		return resultado, err
	}

	return resultado, nil
}
