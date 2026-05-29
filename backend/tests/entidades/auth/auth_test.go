package auth_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/auth"
)

// ==========================================
// Tests: Entidades Auth
// ==========================================

func TestUsuario_JSONSerialization(t *testing.T) {
	now := time.Now()
	u := auth.Usuario{
		ID:        1,
		TenantID:  "tenant-uuid-123",
		Nombre:    "Juan",
		Apellidos: "Pérez",
		Correo:    "juan@test.com",
		Rol:       "ADMIN",
		Activo:    true,
		DeletedAt: nil,
		CreatedAt: now,
		UpdatedAt: now,
	}

	data, err := json.Marshal(u)
	if err != nil {
		t.Fatalf("error al serializar usuario: %v", err)
	}

	str := string(data)

	if !contains(str, `"id_usuario":1`) {
		t.Error("falta campo 'id_usuario'")
	}
	if !contains(str, `"nombre":"Juan"`) {
		t.Error("falta campo 'nombre'")
	}
	if !contains(str, `"rol":"ADMIN"`) {
		t.Error("falta campo 'rol'")
	}
	if contains(str, `"deleted_at"`) {
		t.Error("deleted_at no debería aparecer cuando es nil")
	}
}

func TestUsuario_DeletedAt_Serialization(t *testing.T) {
	now := time.Now()
	u := auth.Usuario{
		ID:        2,
		TenantID:  "t",
		DeletedAt: &now,
	}

	data, err := json.Marshal(u)
	if err != nil {
		t.Fatalf("error al serializar: %v", err)
	}

	if !contains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debería aparecer cuando tiene valor")
	}
}

func TestNuevoUsuarioRequest_Binding(t *testing.T) {
	jsonStr := `{
		"nombre": "Ana",
		"apellidos": "López",
		"correo": "ana@test.com",
		"contrasena": "12345678",
		"rol": "MESERO",
		"local_id": 1
	}`

	var req auth.NuevoUsuarioRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Nombre != "Ana" {
		t.Errorf("Nombre: esperaba 'Ana', obtuvo %q", req.Nombre)
	}
	if req.Correo != "ana@test.com" {
		t.Errorf("Correo: esperaba 'ana@test.com', obtuvo %q", req.Correo)
	}
	if req.Rol != "MESERO" {
		t.Errorf("Rol: esperaba 'MESERO', obtuvo %q", req.Rol)
	}
}

func TestLoginRequest_Binding(t *testing.T) {
	jsonStr := `{"correo":"admin@test.com","contrasena":"password123"}`

	var req auth.LoginRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Correo != "admin@test.com" {
		t.Errorf("Correo: esperaba 'admin@test.com', obtuvo %q", req.Correo)
	}
	if req.Contrasena != "password123" {
		t.Errorf("Contrasena: esperaba 'password123', obtuvo %q", req.Contrasena)
	}
}

func TestLoginResponse_JSON(t *testing.T) {
	u := &auth.Usuario{
		ID:     1,
		Nombre: "Test",
		Rol:    "ADMIN",
	}
	resp := auth.LoginResponse{
		Usuario:     u,
		AccessToken: "abc.def.ghi",
	}

	data, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("error al serializar: %v", err)
	}

	if !contains(string(data), `"access_token":"abc.def.ghi"`) {
		t.Error("falta access_token en LoginResponse")
	}
	if !contains(string(data), `"nombre":"Test"`) {
		t.Error("falta usuario.nombre en LoginResponse")
	}
}

func TestSuperAdmin_JSONSerialization(t *testing.T) {
	sa := auth.SuperAdmin{
		ID:     1,
		Nombre: "Super Admin",
		Correo: "sa@restauflow.com",
		Nivel:  "superadmin",
		Activo: true,
	}

	data, err := json.Marshal(sa)
	if err != nil {
		t.Fatalf("error al serializar: %v", err)
	}

	if !contains(string(data), `"nivel":"superadmin"`) {
		t.Error("falta campo 'nivel'")
	}
}

// helper
func contains(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
