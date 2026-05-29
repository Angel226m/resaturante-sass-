package reservas_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/reservas"
)

// ==========================================
// Tests: Entidades Reservas
// ==========================================

func TestReserva_JSON(t *testing.T) {
	ahora := time.Now()
	r := reservas.Reserva{
		ID:             1,
		TenantID:       "tenant-uuid",
		LocalID:        1,
		NombreContacto: "Carlos Mendoza",
		FechaReserva:   ahora,
		HoraInicio:     "12:00",
		HoraFin:        "14:00",
		NumeroPersonas: 4,
		Estado:         "confirmada",
	}

	data, err := json.Marshal(r)
	if err != nil {
		t.Fatalf("error al serializar reserva: %v", err)
	}
	str := string(data)

	if !contains(str, `"nombre_contacto":"Carlos`) {
		t.Error("falta nombre_contacto")
	}
	if !contains(str, `"estado":"confirmada"`) {
		t.Error("falta estado")
	}
}

func TestReserva_DeletedAt_Omitempty(t *testing.T) {
	r := reservas.Reserva{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(r)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}

	now := time.Now()
	r.DeletedAt = &now
	data, _ = json.Marshal(r)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer cuando tiene valor")
	}
}

func TestReserva_VirtualFields(t *testing.T) {
	r := reservas.Reserva{
		ID:            1,
		NombreCliente: "Juan Pérez",
		NumeroMesa:    "Mesa 3",
		NombreZona:    "Terraza",
	}

	data, _ := json.Marshal(r)
	str := string(data)

	if !contains(str, `"nombre_cliente":"Juan P`) {
		t.Error("falta campo virtual nombre_cliente")
	}
	if !contains(str, `"numero_mesa":"Mesa 3"`) {
		t.Error("falta campo virtual numero_mesa")
	}
	if !contains(str, `"nombre_zona":"Terraza"`) {
		t.Error("falta campo virtual nombre_zona")
	}
}

func TestReserva_Historial(t *testing.T) {
	h := reservas.HistorialEstadoReserva{
		ID:             1,
		ReservaID:      5,
		EstadoAnterior: "pendiente",
		EstadoNuevo:    "confirmada",
		Motivo:         "Confirmado por cliente",
	}

	data, err := json.Marshal(h)
	if err != nil {
		t.Fatalf("error al serializar historial: %v", err)
	}
	str := string(data)

	if !contains(str, `"estado_anterior":"pendiente"`) {
		t.Error("falta estado_anterior")
	}
	if !contains(str, `"estado_nuevo":"confirmada"`) {
		t.Error("falta estado_nuevo")
	}
}

func TestNuevaReservaRequest_Binding(t *testing.T) {
	jsonStr, _ := json.Marshal(map[string]interface{}{
		"local_id":          1,
		"nombre_contacto":   "Ana López",
		"hora_inicio":       "12:00",
		"hora_fin":          "14:00",
		"telefono_contacto": "999888777",
		"fecha_reserva":     time.Now().Format(time.RFC3339),
		"numero_personas":   2,
	})

	var req reservas.NuevaReservaRequest
	err := json.Unmarshal(jsonStr, &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.LocalID != 1 {
		t.Errorf("LocalID: esperaba 1, obtuvo %d", req.LocalID)
	}
	if req.NombreContacto != "Ana López" {
		t.Errorf("NombreContacto: esperaba 'Ana López', obtuvo %q", req.NombreContacto)
	}
}

func TestCambiarEstadoReservaRequest_Binding(t *testing.T) {
	jsonStr := `{"estado":"cancelada","motivo":"Cancelada por el cliente"}`

	var req reservas.CambiarEstadoReservaRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Estado != "cancelada" {
		t.Errorf("Estado: esperaba 'cancelada', obtuvo %q", req.Estado)
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
