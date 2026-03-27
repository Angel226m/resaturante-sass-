package caja

import (
	"encoding/json"
	"testing"
	"time"
)

// ==========================================
// Tests: Entidades Caja
// ==========================================

func TestTurnoCaja_JSON(t *testing.T) {
	tc := TurnoCaja{
		ID:              1,
		TenantID:        "tenant-abc",
		LocalID:         1,
		UsuarioID:       10,
		MontoApertura:   500.00,
		TotalVentas:     3500.00,
		TotalEfectivo:   2000.00,
		TotalTarjeta:    1200.00,
		TotalOtros:      300.00,
		CantidadOrdenes: 25,
		Estado:          "abierto",
	}

	data, err := json.Marshal(tc)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"monto_apertura":500`) {
		t.Error("falta monto_apertura")
	}
	if !contains(str, `"total_ventas":3500`) {
		t.Error("falta total_ventas")
	}
	if !contains(str, `"estado":"abierto"`) {
		t.Error("falta estado")
	}
}

func TestTurnoCaja_VirtualNombreUsuario(t *testing.T) {
	tc := TurnoCaja{
		ID:            1,
		NombreUsuario: "Carlos Cajero",
	}

	data, _ := json.Marshal(tc)
	if !contains(string(data), `"nombre_usuario":"Carlos Cajero"`) {
		t.Error("falta nombre_usuario virtual")
	}
}

func TestPago_JSON(t *testing.T) {
	p := Pago{
		ID:          1,
		TenantID:    "tenant-abc",
		OrdenID:     100,
		TurnoCajaID: 5,
		MontoTotal:  150.00,
		MontoPagado: 200.00,
		Vuelto:      50.00,
		Propina:     10.00,
		Estado:      "completado",
		UsuarioID:   10,
	}

	data, err := json.Marshal(p)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"monto_total":150`) {
		t.Error("falta monto_total")
	}
	if !contains(str, `"vuelto":50`) {
		t.Error("falta vuelto")
	}
	if !contains(str, `"propina":10`) {
		t.Error("falta propina")
	}
}

func TestPago_DeletedAt_Omitempty(t *testing.T) {
	p := Pago{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(p)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando nil")
	}

	now := time.Now()
	p.DeletedAt = &now
	data, _ = json.Marshal(p)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer con valor")
	}
}

func TestPago_VirtualFields(t *testing.T) {
	p := Pago{
		ID:            1,
		NumeroOrden:   "ORD-001",
		NombreUsuario: "Juan Cajero",
		Detalle: []DetallePago{
			{ID: 1, MetodoPagoID: 1, Monto: 100.00, NombreMetodo: "Efectivo"},
			{ID: 2, MetodoPagoID: 2, Monto: 50.00, NombreMetodo: "Tarjeta"},
		},
	}

	data, _ := json.Marshal(p)
	str := string(data)

	if !contains(str, `"numero_orden":"ORD-001"`) {
		t.Error("falta numero_orden virtual")
	}
	if !contains(str, `"Efectivo"`) {
		t.Error("falta detalle Efectivo")
	}
	if !contains(str, `"Tarjeta"`) {
		t.Error("falta detalle Tarjeta")
	}
}

func TestMetodoPago_JSON(t *testing.T) {
	mp := MetodoPago{
		ID:           1,
		TenantID:     "tenant-abc",
		LocalID:      1,
		Nombre:       "Efectivo",
		Tipo:         "efectivo",
		ComisionPorc: 0,
		RequiereRef:  false,
		Activo:       true,
	}

	data, _ := json.Marshal(mp)
	str := string(data)

	if !contains(str, `"nombre":"Efectivo"`) {
		t.Error("falta nombre")
	}
	if !contains(str, `"tipo":"efectivo"`) {
		t.Error("falta tipo")
	}
}

func TestMetodoPago_DeletedAt_Omitempty(t *testing.T) {
	mp := MetodoPago{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(mp)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando nil")
	}

	now := time.Now()
	mp.DeletedAt = &now
	data, _ = json.Marshal(mp)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer con valor")
	}
}

func TestComprobante_JSON(t *testing.T) {
	c := Comprobante{
		ID:              1,
		TenantID:        "tenant-abc",
		OrdenID:         100,
		PagoID:          50,
		TipoComprobante: "boleta",
		Serie:           "B001",
		Numero:          "00000001",
		Subtotal:        127.12,
		IGV:             22.88,
		Total:           150.00,
		Estado:          "emitido",
	}

	data, _ := json.Marshal(c)
	str := string(data)

	if !contains(str, `"tipo_comprobante":"boleta"`) {
		t.Error("falta tipo_comprobante")
	}
	if !contains(str, `"serie":"B001"`) {
		t.Error("falta serie")
	}
	if !contains(str, `"igv":22.88`) {
		t.Error("falta igv")
	}
}

func TestComprobante_DeletedAt_Omitempty(t *testing.T) {
	c := Comprobante{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(c)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando nil")
	}

	now := time.Now()
	c.DeletedAt = &now
	data, _ = json.Marshal(c)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer con valor")
	}
}

func TestResumenTurnoCaja_JSON(t *testing.T) {
	r := ResumenTurnoCaja{
		TurnoCajaID:     1,
		TotalVentas:     5000.00,
		TotalEfectivo:   3000.00,
		TotalTarjeta:    1500.00,
		TotalOtros:      500.00,
		CantidadOrdenes: 40,
		MontoEsperado:   5500.00,
		Diferencia:      -500.00,
	}

	data, _ := json.Marshal(r)
	str := string(data)

	if !contains(str, `"total_ventas":5000`) {
		t.Error("falta total_ventas")
	}
	if !contains(str, `"diferencia":-500`) {
		t.Error("falta diferencia negativa")
	}
}

func TestNuevoPagoRequest_Binding(t *testing.T) {
	jsonStr := `{"orden_id":100,"propina":5.00,"detalle":[{"metodo_pago_id":1,"monto":100.00}]}`

	var req NuevoPagoRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.OrdenID != 100 {
		t.Errorf("esperado orden_id=100, got %d", req.OrdenID)
	}
	if len(req.Detalle) != 1 {
		t.Fatalf("esperado 1 detalle, got %d", len(req.Detalle))
	}
	if req.Detalle[0].Monto != 100.00 {
		t.Errorf("esperado monto=100, got %f", req.Detalle[0].Monto)
	}
}

func TestAbrirTurnoCajaRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id":1,"monto_apertura":500.00}`

	var req AbrirTurnoCajaRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.LocalID != 1 {
		t.Errorf("esperado local_id=1, got %d", req.LocalID)
	}
	if req.MontoApertura != 500.00 {
		t.Errorf("esperado monto=500, got %f", req.MontoApertura)
	}
}

func TestNuevoComprobanteRequest_Binding(t *testing.T) {
	jsonStr := `{"orden_id":100,"pago_id":50,"tipo_comprobante":"factura","ruc_cliente":"20123456789","razon_social":"Mi Empresa SAC","direccion_fiscal":"Lima"}`

	var req NuevoComprobanteRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.TipoComprobante != "factura" {
		t.Errorf("esperado factura, got %s", req.TipoComprobante)
	}
	if req.RUCCliente != "20123456789" {
		t.Errorf("ruc incorrecto: %s", req.RUCCliente)
	}
}

// helper
func contains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
