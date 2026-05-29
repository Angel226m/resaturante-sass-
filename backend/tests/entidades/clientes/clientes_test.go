package clientes_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/clientes"
)

// ==========================================
// Tests: Entidades Clientes
// ==========================================

func TestCliente_JSON(t *testing.T) {
	c := clientes.Cliente{
		ID:        1,
		TenantID:  "tenant-uuid",
		Nombres:   "María",
		Apellidos: "García",
		Activo:    true,
	}

	data, err := json.Marshal(c)
	if err != nil {
		t.Fatalf("error al serializar cliente: %v", err)
	}
	str := string(data)

	if !contains(str, `"nombres":"Mar`) {
		t.Error("falta nombre")
	}
	if !contains(str, `"activo":true`) {
		t.Error("falta activo")
	}
}

func TestCliente_DeletedAt_Omitempty(t *testing.T) {
	c := clientes.Cliente{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(c)
	if contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}

	now := time.Now()
	c.DeletedAt = &now
	data, _ = json.Marshal(c)
	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer cuando tiene valor")
	}
}

func TestCliente_NombreCompleto_Virtual(t *testing.T) {
	c := clientes.Cliente{
		ID:             1,
		NombreCompleto: "María García",
	}

	data, _ := json.Marshal(c)
	if !contains(string(data), `"nombre_completo":"Mar`) {
		t.Error("falta campo virtual nombre_completo")
	}
}

func TestCliente_CamposCifrados_NoJSON(t *testing.T) {
	// Los campos cifrados no deben aparecer en el JSON
	c := clientes.Cliente{
		ID:             1,
		CorreoCifrado:  "xxx-cifrado-xxx",
		CelularCifrado: "yyy-cifrado-yyy",
	}

	data, _ := json.Marshal(c)
	str := string(data)

	if contains(str, "correo_cifrado") {
		t.Error("correo_cifrado NO debe aparecer en JSON (campo interno)")
	}
	if contains(str, "celular_cifrado") {
		t.Error("celular_cifrado NO debe aparecer en JSON (campo interno)")
	}
}

func TestCliente_Correo_Omitempty(t *testing.T) {
	c := clientes.Cliente{ID: 1}
	data, _ := json.Marshal(c)

	// Si correo es vacío/nil → debe omitirse
	if contains(string(data), `"correo":""`) {
		t.Error("correo vacío no debería aparecer (omitempty)")
	}
}

func TestBuscarClienteRequest_Binding(t *testing.T) {
	jsonStr := `{"termino":"María"}`

	var req clientes.BuscarClienteRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Termino != "María" {
		t.Errorf("Termino: esperaba 'María', obtuvo %q", req.Termino)
	}
}

func TestCliente_Direcciones_Virtual(t *testing.T) {
	c := clientes.Cliente{
		ID: 1,
		Direcciones: []clientes.DireccionCliente{
			{Etiqueta: "Casa", Direccion: "Av. Lima 123"},
			{Etiqueta: "Trabajo", Direccion: "Jr. Miraflores 456"},
		},
	}

	data, _ := json.Marshal(c)
	if !contains(string(data), "Av. Lima") {
		t.Error("falta direcciones en serialización")
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
