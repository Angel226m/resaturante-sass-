package ordenes

import (
	"encoding/json"
	"testing"
	"time"
)

// ==========================================
// Tests: Entidades Ordenes
// ==========================================

func TestOrden_JSONSerialization(t *testing.T) {
	now := time.Now()
	o := Orden{
		ID:             1,
		TenantID:       "t-123",
		LocalID:        1,
		MesaID:         intPtr(5),
		TipoOrden:      "mesa",
		Estado:         "nueva",
		Subtotal:       100.50,
		IGV:            18.09,
		Total:          118.59,
		NumeroPersonas: 4,
		CreatedAt:      now,
	}

	data, err := json.Marshal(o)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !strContains(str, `"tipo_orden":"mesa"`) {
		t.Error("falta tipo_orden")
	}
	if !strContains(str, `"estado":"nueva"`) {
		t.Error("falta estado")
	}
	if !strContains(str, `"total":118.59`) {
		t.Error("falta total")
	}
}

func TestOrden_DeletedAt_Omitempty(t *testing.T) {
	o := Orden{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(o)
	if strContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}
}

func TestOrden_VirtualFields(t *testing.T) {
	o := Orden{
		ID:            1,
		NumeroMesa:    "M-01",
		NombreCliente: "Juan Pérez",
		NombreMesero:  "Carlos",
		Items:         []ItemOrden{{ID: 1, Cantidad: 2}},
	}

	data, err := json.Marshal(o)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !strContains(str, `"numero_mesa":"M-01"`) {
		t.Error("falta numero_mesa virtual")
	}
	if !strContains(str, `"nombre_cliente":"Juan Pérez"`) {
		t.Error("falta nombre_cliente virtual")
	}
}

func TestOrden_Estados(t *testing.T) {
	estados := []string{"nueva", "en_cocina", "listo", "entregada", "cancelada", "pagada"}
	for _, e := range estados {
		o := Orden{Estado: e}
		data, _ := json.Marshal(o)
		if !strContains(string(data), `"estado":"`+e+`"`) {
			t.Errorf("estado %q no serializado correctamente", e)
		}
	}
}

func TestOrden_TiposOrden(t *testing.T) {
	tipos := []string{"mesa", "delivery", "para_llevar"}
	for _, tp := range tipos {
		o := Orden{TipoOrden: tp}
		data, _ := json.Marshal(o)
		if !strContains(string(data), `"tipo_orden":"`+tp+`"`) {
			t.Errorf("tipo_orden %q no serializado", tp)
		}
	}
}

func TestNuevaOrdenRequest_Binding(t *testing.T) {
	jsonStr := `{
		"local_id": 1,
		"tipo_orden": "mesa",
		"mesa_id": 5,
		"comensales": 4,
		"items": [
			{"producto_id": 1, "cantidad": 2, "precio_unitario": 25.00}
		]
	}`

	var req NuevaOrdenRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.TipoOrden != "mesa" {
		t.Errorf("TipoOrden: esperaba 'mesa', obtuvo %q", req.TipoOrden)
	}
	if len(req.Items) != 1 {
		t.Errorf("Items: esperaba 1, obtuvo %d", len(req.Items))
	}
}

// helpers
func intPtr(i int) *int { return &i }

func strContains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
