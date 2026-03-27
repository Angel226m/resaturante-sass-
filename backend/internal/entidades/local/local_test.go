package local

import (
	"encoding/json"
	"testing"
	"time"
)

// ==========================================
// Tests: Entidades Local/Zona/Mesa
// ==========================================

func TestLocal_JSONSerialization(t *testing.T) {
	l := Local{
		ID:          1,
		TenantID:    "t-123",
		Nombre:      "Restaurante Test",
		NumeroPisos: 2,
		Activo:      true,
	}

	data, err := json.Marshal(l)
	if err != nil {
		t.Fatalf("error al serializar: %v", err)
	}
	str := string(data)

	if !jsonContains(str, `"nombre":"Restaurante Test"`) {
		t.Error("falta campo 'nombre'")
	}
	if !jsonContains(str, `"numero_pisos":2`) {
		t.Error("falta campo 'numero_pisos'")
	}
}

func TestLocal_DeletedAt_Omitempty(t *testing.T) {
	l := Local{ID: 1, DeletedAt: nil}
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
	z := Zona{
		ID:         1,
		Nombre:     "Terraza",
		Piso:       2,
		Color:      "#FF5733",
		TotalMesas: 10,
	}

	data, err := json.Marshal(z)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !jsonContains(str, `"piso":2`) {
		t.Error("falta campo 'piso'")
	}
	if !jsonContains(str, `"total_mesas":10`) {
		t.Error("falta campo virtual 'total_mesas'")
	}
}

func TestMesa_VirtualFields(t *testing.T) {
	m := Mesa{
		ID:          1,
		Numero:      "M-01",
		Estado:      "disponible",
		Capacidad:   4,
		NombreZona:  "Salón Principal",
		Piso:        1,
		NombreLocal: "Mi Restaurante",
	}

	data, err := json.Marshal(m)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !jsonContains(str, `"nombre_zona":"Salón Principal"`) {
		t.Error("falta campo virtual 'nombre_zona'")
	}
	if !jsonContains(str, `"piso":1`) {
		t.Error("falta campo virtual 'piso'")
	}
	if !jsonContains(str, `"nombre_local":"Mi Restaurante"`) {
		t.Error("falta campo virtual 'nombre_local'")
	}
}

func TestMesa_Estados(t *testing.T) {
	estados := []string{"disponible", "ocupada", "reservada", "no_disponible"}
	for _, e := range estados {
		m := Mesa{Estado: e}
		data, _ := json.Marshal(m)
		if !jsonContains(string(data), `"estado":"`+e+`"`) {
			t.Errorf("estado %q no serializado correctamente", e)
		}
	}
}

func TestNuevaMesaRequest_Binding(t *testing.T) {
	jsonStr := `{
		"local_id": 1,
		"zona_id": 2,
		"numero": "M-05",
		"capacidad": 6,
		"forma": "cuadrada"
	}`

	var req NuevaMesaRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.Numero != "M-05" {
		t.Errorf("Numero: esperaba 'M-05', obtuvo %q", req.Numero)
	}
	if req.Capacidad != 6 {
		t.Errorf("Capacidad: esperaba 6, obtuvo %d", req.Capacidad)
	}
}

func TestNuevaZonaRequest_Binding(t *testing.T) {
	jsonStr := `{
		"local_id": 1,
		"nombre": "Terraza",
		"piso": 2,
		"color": "#00FF00"
	}`

	var req NuevaZonaRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.Nombre != "Terraza" {
		t.Errorf("Nombre: esperaba 'Terraza', obtuvo %q", req.Nombre)
	}
	if req.Piso != 2 {
		t.Errorf("Piso: esperaba 2, obtuvo %d", req.Piso)
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
