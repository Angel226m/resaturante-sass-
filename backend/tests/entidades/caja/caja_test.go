package caja_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/caja"
)

// ==========================================
// Tests: Entidades Caja
// ==========================================

func TestTurnoCaja_JSON(t *testing.T) {
	now := time.Now()
	tc := caja.TurnoCaja{
		ID:            1,
		LocalID:       1,
		UsuarioID:     42,
		FechaApertura: now,
		MontoApertura: 100.00,
		Estado:        "abierto",
	}

	data, err := json.Marshal(tc)
	if err != nil {
		t.Fatalf("error al serializar TurnoCaja: %v", err)
	}
	str := string(data)

	if !contains(str, `"estado":"abierto"`) {
		t.Error("falta campo 'estado'")
	}
	if !contains(str, `"monto_apertura":100`) {
		t.Error("falta monto_apertura")
	}
}

func TestTurnoCaja_VirtualNombreUsuario(t *testing.T) {
	tc := caja.TurnoCaja{
		ID:            1,
		NombreUsuario: "Ana García",
	}

	data, _ := json.Marshal(tc)
	if !contains(string(data), `"nombre_usuario":"Ana G`) {
		t.Error("falta campo virtual nombre_usuario")
	}
}

func TestPago_JSON(t *testing.T) {
	p := caja.Pago{
		ID:          1,
		OrdenID:     10,
		MontoTotal:  89.50,
		MontoPagado: 89.50,
		Estado:      "completado",
	}

	data, err := json.Marshal(p)
	if err != nil {
		t.Fatalf("error al serializar Pago: %v", err)
	}
	str := string(data)

	if !contains(str, `"monto_total":89.5`) {
		t.Error("falta monto_total")
	}
	if !contains(str, `"estado":"completado"`) {
		t.Error("falta estado")
	}
}

func TestPago_DeletedAt_Omitempty(t *testing.T) {
	p := caja.Pago{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(p)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}

	now := time.Now()
	p.DeletedAt = &now
	data, _ = json.Marshal(p)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer cuando tiene valor")
	}
}

func TestPago_VirtualFields(t *testing.T) {
	p := caja.Pago{
		ID:            1,
		NombreUsuario: "Luis Torres",
		NumeroOrden:   "ORD-001",
	}

	data, _ := json.Marshal(p)
	str := string(data)

	if !contains(str, `"nombre_usuario":"Luis Torres"`) {
		t.Error("falta nombre_usuario virtual")
	}
	if !contains(str, `"numero_orden":"ORD-001"`) {
		t.Error("falta numero_orden virtual")
	}
}

func TestMetodoPago_JSON(t *testing.T) {
	mp := caja.MetodoPago{
		ID:     1,
		Nombre: "Tarjeta Crédito",
		Tipo:   "tarjeta",
		Activo: true,
	}

	data, _ := json.Marshal(mp)
	str := string(data)

	if !contains(str, `"nombre":"Tarjeta Cr`) {
		t.Error("falta nombre")
	}
	if !contains(str, `"tipo":"tarjeta"`) {
		t.Error("falta tipo")
	}
}

func TestMetodoPago_DeletedAt_Omitempty(t *testing.T) {
	mp := caja.MetodoPago{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(mp)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}
}

func TestComprobante_JSON(t *testing.T) {
	c := caja.Comprobante{
		ID:              1,
		OrdenID:         5,
		TipoComprobante: "boleta",
		Serie:           "B001",
		Numero:          "B001-001",
		Total:           89.50,
		Estado:          "emitido",
	}

	data, err := json.Marshal(c)
	if err != nil {
		t.Fatalf("error al serializar: %v", err)
	}
	str := string(data)

	if !contains(str, `"tipo_comprobante":"boleta"`) {
		t.Error("falta tipo_comprobante")
	}
	if !contains(str, `"serie":"B001"`) {
		t.Error("falta serie")
	}
}

func TestComprobante_DeletedAt_Omitempty(t *testing.T) {
	c := caja.Comprobante{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(c)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}
}

func TestResumenTurnoCaja_JSON(t *testing.T) {
	r := caja.ResumenTurnoCaja{
		TotalVentas:     500.00,
		TotalEfectivo:   200.00,
		TotalTarjeta:    300.00,
		CantidadOrdenes: 15,
	}

	data, _ := json.Marshal(r)
	str := string(data)

	if !contains(str, `"total_ventas":500`) {
		t.Error("falta total_ventas")
	}
	if !contains(str, `"cantidad_ordenes":15`) {
		t.Error("falta cantidad_ordenes")
	}
}

func TestNuevoPagoRequest_Binding(t *testing.T) {
	jsonStr := `{
		"orden_id": 5,
		"propina": 5.00,
		"detalle": [{"metodo_pago_id": 1, "monto": 100.00}]
	}`

	var req caja.NuevoPagoRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.OrdenID != 5 {
		t.Errorf("OrdenID: esperaba 5, obtuvo %d", req.OrdenID)
	}
	if req.Propina != 5.00 {
		t.Errorf("Propina: esperaba 5.00, obtuvo %f", req.Propina)
	}
}

func TestAbrirTurnoCajaRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id": 1, "monto_apertura": 200.00}`

	var req caja.AbrirTurnoCajaRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.LocalID != 1 {
		t.Errorf("LocalID: esperaba 1, obtuvo %d", req.LocalID)
	}
	if req.MontoApertura != 200.00 {
		t.Errorf("MontoApertura: esperaba 200.00, obtuvo %f", req.MontoApertura)
	}
}

func TestNuevoComprobanteRequest_Binding(t *testing.T) {
	jsonStr := `{
		"orden_id": 5,
		"tipo_comprobante": "boleta",
		"serie": "B001"
	}`

	var req caja.NuevoComprobanteRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.OrdenID != 5 {
		t.Errorf("OrdenID: esperaba 5, obtuvo %d", req.OrdenID)
	}
	if req.TipoComprobante != "boleta" {
		t.Errorf("TipoComprobante: esperaba 'boleta', obtuvo %q", req.TipoComprobante)
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
