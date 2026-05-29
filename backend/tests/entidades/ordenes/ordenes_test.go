package ordenes_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/ordenes"
)

// ==========================================
// Tests: Entidades Ordenes
// ==========================================

func TestOrden_JSONSerialization(t *testing.T) {
	o := ordenes.Orden{
		ID:        1,
		TenantID:  "tenant-uuid",
		LocalID:   1,
		TipoOrden: "mesa",
		Estado:    "abierta",
		Total:     89.50,
		Subtotal:  76.27,
		IGV:       13.23,
		MesaID:    intPtr(5),
	}

	data, err := json.Marshal(o)
	if err != nil {
		t.Fatalf("error al serializar orden: %v", err)
	}
	str := string(data)

	if !strContains(str, `"tipo_orden":"mesa"`) {
		t.Error("falta tipo_orden")
	}
	if !strContains(str, `"estado":"abierta"`) {
		t.Error("falta estado")
	}
	if !strContains(str, `"total":89.5`) {
		t.Error("falta total")
	}
}

func TestOrden_DeletedAt_Omitempty(t *testing.T) {
	o := ordenes.Orden{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(o)
	if strContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}

	now := time.Now()
	o.DeletedAt = &now
	data, _ = json.Marshal(o)
	if !strContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer cuando tiene valor")
	}
}

func TestOrden_VirtualFields(t *testing.T) {
	o := ordenes.Orden{
		ID:            1,
		NombreCliente: "Juan Pérez",
		NombreMesero:  "Ana García",
		NumeroMesa:    "Mesa 5",
	}

	data, _ := json.Marshal(o)
	str := string(data)

	if !strContains(str, `"nombre_cliente":"Juan P`) {
		t.Error("falta nombre_cliente virtual")
	}
	if !strContains(str, `"nombre_mesero":"Ana G`) {
		t.Error("falta nombre_mesero virtual")
	}
	if !strContains(str, `"numero_mesa":"Mesa 5"`) {
		t.Error("falta numero_mesa virtual")
	}
}

func TestOrden_Estados(t *testing.T) {
	estados := []string{"abierta", "en_preparacion", "lista", "entregada", "pagada", "cancelada"}
	for _, estado := range estados {
		o := ordenes.Orden{Estado: estado}
		data, _ := json.Marshal(o)
		if !strContains(string(data), estado) {
			t.Errorf("estado %q no serializado correctamente", estado)
		}
	}
}

func TestOrden_TiposOrden(t *testing.T) {
	tipos := []string{"mesa", "para_llevar", "delivery"}
	for _, tipo := range tipos {
		o := ordenes.Orden{TipoOrden: tipo}
		data, _ := json.Marshal(o)
		if !strContains(string(data), tipo) {
			t.Errorf("tipo_orden %q no serializado correctamente", tipo)
		}
	}
}

func TestNuevaOrdenRequest_Binding(t *testing.T) {
	jsonStr := `{
		"local_id": 1,
		"tipo_orden": "mesa",
		"mesa_id": 5,
		"items": []
	}`

	var req ordenes.NuevaOrdenRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.LocalID != 1 {
		t.Errorf("LocalID: esperaba 1, obtuvo %d", req.LocalID)
	}
	if req.TipoOrden != "mesa" {
		t.Errorf("TipoOrden: esperaba 'mesa', obtuvo %q", req.TipoOrden)
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
