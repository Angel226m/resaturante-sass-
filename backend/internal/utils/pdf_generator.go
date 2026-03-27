package utils

// ==========================================
// Generador de PDF (stub para comprobantes)
// RestauFlow SaaS Multi-Tenant
// ==========================================

// PDFTicketData contiene los datos para generar un ticket
type PDFTicketData struct {
	NombreRestaurante string
	Direccion         string
	RUC               string
	NumeroOrden       string
	Fecha             string
	Mesero            string
	Mesa              string
	Items             []PDFItemData
	Subtotal          string
	IGV               string
	Total             string
	MetodoPago        string
	MensajeTicket     string
	MensajeWifi       string
}

// PDFItemData es un item del ticket
type PDFItemData struct {
	Cantidad   int
	Nombre     string
	PrecioUnit string
	Subtotal   string
	Notas      string
}

// GenerarTicketPDF genera un PDF de ticket de venta
// TODO: implementar con librería PDF cuando se necesite
func GenerarTicketPDF(data PDFTicketData) ([]byte, error) {
	// Placeholder — se implementará con una librería de PDF
	return []byte("PDF_PLACEHOLDER"), nil
}
