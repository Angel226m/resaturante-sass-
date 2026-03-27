package utils

import (
	"encoding/base64"
	"fmt"

	qrcode "github.com/skip2/go-qrcode"
)

// ==========================================
// Generador de QR para mesas
// RestauFlow SaaS Multi-Tenant
// ==========================================

// GenerarQRMesa genera un código QR para una mesa.
// Retorna la URL del contenido y la imagen en base64.
func GenerarQRMesa(tenantSlug string, localID, mesaID int) (contenido string, imagenBase64 string, err error) {
	// URL que el cliente escaneará para acceder al menú desde la mesa
	contenido = fmt.Sprintf("https://%s.restauflow.com/mesa/%d/%d", tenantSlug, localID, mesaID)

	png, err := qrcode.Encode(contenido, qrcode.Medium, 256)
	if err != nil {
		return "", "", fmt.Errorf("error al generar QR: %w", err)
	}

	imagenBase64 = "data:image/png;base64," + base64.StdEncoding.EncodeToString(png)

	return contenido, imagenBase64, nil
}

// GenerarQRReserva genera un QR para confirmar una reserva
func GenerarQRReserva(tenantSlug string, codigo string) (string, string, error) {
	contenido := fmt.Sprintf("https://%s.restauflow.com/reserva/confirmar/%s", tenantSlug, codigo)

	png, err := qrcode.Encode(contenido, qrcode.Medium, 256)
	if err != nil {
		return "", "", fmt.Errorf("error al generar QR de reserva: %w", err)
	}

	imagenBase64 := "data:image/png;base64," + base64.StdEncoding.EncodeToString(png)

	return contenido, imagenBase64, nil
}
