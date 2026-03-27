package utils

import (
	"database/sql"
	"fmt"
	"sync"
	"time"
)

// ==========================================
// Generador de números correlativos
// RestauFlow SaaS Multi-Tenant
// Formato: PREFIJO-YYYY-NNNNNN
// ==========================================

var (
	numMutex sync.Mutex
)

// GenerarNumeroOrden genera ORD-2025-000001
func GenerarNumeroOrden(db *sql.DB, tenantID string) (string, error) {
	return generarNumero(db, tenantID, "ordenes", "numero_orden", "ORD")
}

// GenerarNumeroOrdenCompra genera OC-2025-000001
func GenerarNumeroOrdenCompra(db *sql.DB, tenantID string) (string, error) {
	return generarNumero(db, tenantID, "ordenes_compra", "numero_orden", "OC")
}

// GenerarNumeroFactura genera FACT-2025-000001
func GenerarNumeroFactura(db *sql.DB, tenantID string) (string, error) {
	return generarNumero(db, tenantID, "facturas_plataforma", "numero_factura", "FACT")
}

// GenerarCodigoConfirmacion genera un código de confirmación aleatorio de 8 caracteres
func GenerarCodigoConfirmacion() string {
	return GenerarTokenAleatorio(8)
}

// GenerarCodigoDelivery genera un código de 6 dígitos para confirmar delivery
func GenerarCodigoDelivery() string {
	return GenerarPinAleatorio(6)
}

// generarNumero genera un número correlativo por tenant y tabla
func generarNumero(db *sql.DB, tenantID, tabla, columna, prefijo string) (string, error) {
	numMutex.Lock()
	defer numMutex.Unlock()

	anio := time.Now().Year()
	patron := fmt.Sprintf("%s-%d-%%", prefijo, anio)

	query := fmt.Sprintf(`
		SELECT COALESCE(MAX(%s), '')
		FROM %s
		WHERE tenant_id = $1
		AND %s LIKE $2
	`, columna, tabla, columna)

	var ultimo string
	err := db.QueryRow(query, tenantID, patron).Scan(&ultimo)
	if err != nil {
		return "", fmt.Errorf("error al obtener último número de %s: %w", tabla, err)
	}

	siguiente := 1
	if ultimo != "" {
		// Extraer número del formato: PREFIJO-YYYY-NNNNNN
		var n int
		fmt.Sscanf(ultimo, prefijo+"-%d-%06d", &anio, &n)
		siguiente = n + 1
	}

	return fmt.Sprintf("%s-%d-%06d", prefijo, time.Now().Year(), siguiente), nil
}

// GenerarTokenAleatorio genera un token alfanumérico aleatorio
func GenerarTokenAleatorio(longitud int) string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	b := make([]byte, longitud)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
		time.Sleep(time.Nanosecond)
	}
	return string(b)
}

// GenerarPinAleatorio genera un PIN numérico aleatorio
func GenerarPinAleatorio(longitud int) string {
	const charset = "0123456789"
	b := make([]byte, longitud)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
		time.Sleep(time.Nanosecond)
	}
	return string(b)
}
