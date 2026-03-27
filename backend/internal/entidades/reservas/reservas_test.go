package reservas

import (
	"encoding/json"
	"testing"
	"time"
)

// ==========================================
// Tests: Entidades Reservas
// ==========================================

func TestReserva_JSON(t *testing.T) {
	r := Reserva{
		ID:                 1,
		TenantID:           "tenant-abc",
		LocalID:            1,
		CodigoConfirmacion: "RES-001",
		NombreContacto:     "Carlos García",
		TelefonoContacto:   "999888777",
		FechaReserva:       time.Date(2025, 6, 15, 0, 0, 0, 0, time.UTC),
		HoraInicio:         "19:00",
		HoraFin:            "21:00",
		NumeroPersonas:     4,
		Estado:             "confirmada",
	}

	data, err := json.Marshal(r)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"nombre_contacto":"Carlos García"`) {
		t.Error("falta nombre_contacto")
	}
	if !contains(str, `"hora_inicio":"19:00"`) {
		t.Error("falta hora_inicio")
	}
	if !contains(str, `"estado":"confirmada"`) {
		t.Error("falta estado")
	}
}

func TestReserva_DeletedAt_Omitempty(t *testing.T) {
	r := Reserva{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(r)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando nil")
	}

	now := time.Now()
	r.DeletedAt = &now
	data, _ = json.Marshal(r)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer con valor")
	}
}

func TestReserva_VirtualFields(t *testing.T) {
	r := Reserva{
		ID:            1,
		NombreCliente: "Juan Pérez",
		NumeroMesa:    "Mesa 5",
		NombreZona:    "Terraza",
	}

	data, _ := json.Marshal(r)
	str := string(data)

	if !contains(str, `"nombre_cliente":"Juan Pérez"`) {
		t.Error("falta nombre_cliente virtual")
	}
	if !contains(str, `"numero_mesa":"Mesa 5"`) {
		t.Error("falta numero_mesa virtual")
	}
	if !contains(str, `"nombre_zona":"Terraza"`) {
		t.Error("falta nombre_zona virtual")
	}
}

func TestReserva_Historial(t *testing.T) {
	r := Reserva{
		ID: 1,
		Historial: []HistorialEstadoReserva{
			{ID: 1, EstadoAnterior: "pendiente", EstadoNuevo: "confirmada"},
			{ID: 2, EstadoAnterior: "confirmada", EstadoNuevo: "en_curso"},
		},
	}

	data, _ := json.Marshal(r)
	str := string(data)

	if !contains(str, `"pendiente"`) {
		t.Error("falta estado pendiente en historial")
	}
	if !contains(str, `"en_curso"`) {
		t.Error("falta estado en_curso en historial")
	}
}

func TestNuevaReservaRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id":1,"nombre_contacto":"Ana","telefono_contacto":"999111222","fecha_reserva":"2025-06-15T00:00:00Z","hora_inicio":"20:00","hora_fin":"22:00","numero_personas":6}`

	var req NuevaReservaRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.NombreContacto != "Ana" {
		t.Errorf("esperado Ana, got %s", req.NombreContacto)
	}
	if req.NumeroPersonas != 6 {
		t.Errorf("esperado 6 personas, got %d", req.NumeroPersonas)
	}
}

func TestCambiarEstadoReservaRequest_Binding(t *testing.T) {
	jsonStr := `{"estado":"cancelada","motivo":"Cliente no llegó"}`

	var req CambiarEstadoReservaRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.Estado != "cancelada" {
		t.Errorf("esperado cancelada, got %s", req.Estado)
	}
	if req.Motivo != "Cliente no llegó" {
		t.Errorf("motivo incorrecto: %s", req.Motivo)
	}
}

func TestFiltrosReserva_Defaults(t *testing.T) {
	var f FiltrosReserva
	if f.Pagina != 0 {
		t.Error("pagina default debe ser 0")
	}
	if f.PorPagina != 0 {
		t.Error("por_pagina default debe ser 0")
	}
}

func TestDisponibilidadMesaRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id":1,"fecha_reserva":"2025-06-15T00:00:00Z","hora_inicio":"19:00","hora_fin":"21:00","numero_personas":4}`

	var req DisponibilidadMesaRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.LocalID != 1 {
		t.Errorf("esperado local_id=1, got %d", req.LocalID)
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
