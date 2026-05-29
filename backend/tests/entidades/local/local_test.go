package local_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/local"
)

// ==========================================
// Tests: Entidades Local
// ==========================================

func TestLocal_JSONSerialization(t *testing.T) {
	l := local.Local{
		ID:       1,
		TenantID: "tenant-uuid",
		Nombre:   "Sucursal Centro",
		Activo:   true,
	}

	data, err := json.Marshal(l)
	if err != nil {
		t.Fatalf("error al serializar local: %v", err)
	}
	str := string(data)

	if !jsonContains(str, `"nombre":"Sucursal Centro"`) {
		t.Error("falta nombre")
	}
	if !jsonContains(str, `"activo":true`) {
		t.Error("falta activo")
	}
}

func TestLocal_DeletedAt_Omitempty(t *testing.T) {
	l := local.Local{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(l)
	if jsonContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}

	now := time.Now()
	l.DeletedAt = &now
	data, _ = json.Marshal(l)
	if !jsonContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer cuando tiene valor")
	}
}

func TestZona_WithVirtualFields(t *testing.T) {
	z := local.Zona{
		ID:         1,
		LocalID:    1,
		Nombre:     "Terraza",
		TotalMesas: 8,
	}

	data, err := json.Marshal(z)
	if err != nil {
		t.Fatalf("error al serializar zona: %v", err)
	}
	str := string(data)

	if !jsonContains(str, `"nombre":"Terraza"`) {
		t.Error("falta nombre zona")
	}
	if !jsonContains(str, `"total_mesas":8`) {
		t.Error("falta total_mesas (campo virtual)")
	}
}

func TestMesa_VirtualFields(t *testing.T) {
	m := local.Mesa{
		ID:          1,
		NombreZona:  "Terraza",
		Piso:        2,
		NombreLocal: "Sucursal Centro",
	}

	data, _ := json.Marshal(m)
	str := string(data)

	if !jsonContains(str, `"nombre_zona":"Terraza"`) {
		t.Error("falta nombre_zona virtual")
	}
	if !jsonContains(str, `"nombre_local":"Sucursal Centro"`) {
		t.Error("falta nombre_local virtual")
	}
}

func TestMesa_Estados(t *testing.T) {
	estados := []string{"disponible", "ocupada", "reservada", "bloqueada"}
	for _, estado := range estados {
		m := local.Mesa{Estado: estado}
		data, _ := json.Marshal(m)
		if !jsonContains(string(data), estado) {
			t.Errorf("estado %q no serializado correctamente", estado)
		}
	}
}

func TestNuevaMesaRequest_Binding(t *testing.T) {
	jsonStr := `{
		"zona_id": 2,
		"numero": "Mesa 5",
		"capacidad": 4
	}`

	var req local.NuevaMesaRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.ZonaID == nil || *req.ZonaID != 2 {
		t.Errorf("ZonaID: esperaba 2, obtuvo %d", req.ZonaID)
	}
	if req.Capacidad != 4 {
		t.Errorf("Capacidad: esperaba 4, obtuvo %d", req.Capacidad)
	}
}

func TestNuevaZonaRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id": 1, "nombre": "VIP", "descripcion": "Zona VIP"}`

	var req local.NuevaZonaRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.LocalID != 1 {
		t.Errorf("LocalID: esperaba 1, obtuvo %d", req.LocalID)
	}
	if req.Nombre != "VIP" {
		t.Errorf("Nombre: esperaba 'VIP', obtuvo %q", req.Nombre)
	}
}

// helper
func jsonContains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
