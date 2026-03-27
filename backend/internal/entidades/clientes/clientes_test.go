package clientes

import (
	"encoding/json"
	"testing"
	"time"
)

// ==========================================
// Tests: Entidades Clientes
// ==========================================

func TestCliente_JSON(t *testing.T) {
	c := Cliente{
		ID:              1,
		TenantID:        "tenant-abc",
		LocalID:         1,
		Nombres:         "Juan",
		Apellidos:       "Pérez",
		TipoDocumento:   "DNI",
		NumeroDocumento: "12345678",
		TotalCompras:    500.50,
		CantidadVisitas: 10,
		Activo:          true,
	}

	data, err := json.Marshal(c)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"nombres":"Juan"`) {
		t.Error("falta nombres")
	}
	if !contains(str, `"total_compras":500.5`) {
		t.Error("falta total_compras")
	}
	if !contains(str, `"cantidad_visitas":10`) {
		t.Error("falta cantidad_visitas")
	}
}

func TestCliente_DeletedAt_Omitempty(t *testing.T) {
	c := Cliente{ID: 1, DeletedAt: nil}
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

func TestCliente_NombreCompleto_Virtual(t *testing.T) {
	c := Cliente{
		ID:             1,
		NombreCompleto: "Juan Pérez",
	}

	data, _ := json.Marshal(c)
	if !contains(string(data), `"nombre_completo":"Juan Pérez"`) {
		t.Error("falta nombre_completo virtual")
	}
}

func TestCliente_CamposCifrados_NoJSON(t *testing.T) {
	c := Cliente{
		ID:               1,
		CorreoCifrado:    "encrypted-email",
		CelularCifrado:   "encrypted-phone",
		DocumentoCifrado: "encrypted-doc",
	}

	data, _ := json.Marshal(c)
	str := string(data)

	if contains(str, "encrypted-email") {
		t.Error("correo_cifrado no debe aparecer en JSON")
	}
	if contains(str, "encrypted-phone") {
		t.Error("celular_cifrado no debe aparecer en JSON")
	}
	if contains(str, "encrypted-doc") {
		t.Error("documento_cifrado no debe aparecer en JSON")
	}
}

func TestCliente_Correo_Omitempty(t *testing.T) {
	c := Cliente{ID: 1, Correo: ""}
	data, _ := json.Marshal(c)
	if contains(string(data), `"correo"`) {
		t.Error("correo vacío no debe estar en JSON")
	}

	c.Correo = "test@test.com"
	data, _ = json.Marshal(c)
	if !contains(string(data), `"correo":"test@test.com"`) {
		t.Error("correo con valor debe aparecer")
	}
}

func TestDireccionCliente_JSON(t *testing.T) {
	d := DireccionCliente{
		ID:          1,
		TenantID:    "tenant-abc",
		ClienteID:   10,
		Etiqueta:    "Casa",
		Direccion:   "Av. Siempre Viva 742",
		Distrito:    "Lima",
		EsPrincipal: true,
		Activo:      true,
	}

	data, err := json.Marshal(d)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"etiqueta":"Casa"`) {
		t.Error("falta etiqueta")
	}
	if !contains(str, `"distrito":"Lima"`) {
		t.Error("falta distrito")
	}
	if !contains(str, `"es_principal":true`) {
		t.Error("falta es_principal")
	}
}

func TestNuevoClienteRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id":1,"nombres":"Ana","apellidos":"López","tipo_documento":"DNI","numero_documento":"87654321"}`

	var req NuevoClienteRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.Nombres != "Ana" {
		t.Errorf("esperado Ana, got %s", req.Nombres)
	}
	if req.LocalID != 1 {
		t.Errorf("esperado local_id=1, got %d", req.LocalID)
	}
}

func TestBuscarClienteRequest_Binding(t *testing.T) {
	jsonStr := `{"termino":"Juan","local_id":1,"pagina":1,"por_pagina":10}`

	var req BuscarClienteRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.Termino != "Juan" {
		t.Errorf("esperado Juan, got %s", req.Termino)
	}
	if req.PorPagina != 10 {
		t.Errorf("esperado por_pagina=10, got %d", req.PorPagina)
	}
}

func TestCliente_Direcciones_Virtual(t *testing.T) {
	c := Cliente{
		ID:       1,
		Nombres:  "Test",
		Apellidos: "User",
		Direcciones: []DireccionCliente{
			{ID: 1, Etiqueta: "Casa"},
			{ID: 2, Etiqueta: "Oficina"},
		},
	}

	data, _ := json.Marshal(c)
	str := string(data)

	if !contains(str, `"Casa"`) {
		t.Error("falta dirección Casa")
	}
	if !contains(str, `"Oficina"`) {
		t.Error("falta dirección Oficina")
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
