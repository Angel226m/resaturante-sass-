package plataforma_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/plataforma"
)

func sContains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

// ==========================================
// Tests: Entidades Plataforma
// ==========================================

func TestTenant_JSONSerialization(t *testing.T) {
	ten := plataforma.Tenant{
		ID:              "tenant-uuid",
		Nombre:          "Restaurante El Buen Sabor",
		Slug:            "el-buen-sabor",
		RUC:             "20123456789",
		TipoRestaurante: "casual",
		Estado:          "activo",
	}

	data, err := json.Marshal(ten)
	if err != nil {
		t.Fatalf("error al serializar tenant: %v", err)
	}
	str := string(data)

	if !sContains(str, `"id_tenant":"tenant-uuid"`) {
		t.Error("falta id_tenant")
	}
	if !sContains(str, `"nombre":"Restaurante El Buen Sabor"`) {
		t.Error("falta nombre")
	}
	if !sContains(str, `"slug":"el-buen-sabor"`) {
		t.Error("falta slug")
	}
	if !sContains(str, `"tipo_restaurante":"casual"`) {
		t.Error("falta tipo_restaurante")
	}
	if !sContains(str, `"estado":"activo"`) {
		t.Error("falta estado")
	}
}

func TestTenant_RUCOmitempty(t *testing.T) {
	ten := plataforma.Tenant{ID: "t1", Nombre: "Test", RUC: ""}
	data, _ := json.Marshal(ten)
	if sContains(string(data), `"ruc":""`) {
		t.Error("ruc vacío no debería aparecer (omitempty)")
	}
}

func TestNuevoTenantRequest_Binding(t *testing.T) {
	jsonStr := `{
		"nombre": "Mi Restaurante",
		"slug": "mi-restaurante",
		"tipo_restaurante": "fast_food",
		"correo_contacto": "admin@test.com",
		"plan_id": 1
	}`

	var req plataforma.NuevoTenantRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Nombre != "Mi Restaurante" {
		t.Errorf("Nombre: esperaba 'Mi Restaurante', obtuvo %q", req.Nombre)
	}
	if req.Slug != "mi-restaurante" {
		t.Errorf("Slug: esperaba 'mi-restaurante', obtuvo %q", req.Slug)
	}
}

func TestPlan_JSONSerialization(t *testing.T) {
	p := plataforma.Plan{
		ID:            1,
		Nombre:        "Pro",
		PrecioMensual: 99.90,
		TieneDelivery: true,
		EsPopular:     true,
	}

	data, err := json.Marshal(p)
	if err != nil {
		t.Fatalf("error al serializar plan: %v", err)
	}
	str := string(data)

	if !sContains(str, `"id_plan":1`) {
		t.Error("falta id_plan")
	}
	if !sContains(str, `"nombre":"Pro"`) {
		t.Error("falta nombre")
	}
	if !sContains(str, `"precio_mensual":99.9`) {
		t.Error("falta precio_mensual")
	}
	if !sContains(str, `"tiene_delivery":true`) {
		t.Error("falta tiene_delivery")
	}
	if !sContains(str, `"es_popular":true`) {
		t.Error("falta es_popular")
	}
}

func TestPlan_BooleanFeatures(t *testing.T) {
	p := plataforma.Plan{
		ID:                      1,
		TieneDelivery:           true,
		TieneReservas:           true,
		TieneInventarioAvanzado: false,
		TieneReportesAvanzados:  true,
		TieneAPIAccess:          false,
		TieneMultiLocal:         true,
		TienePuntosFidelidad:    false,
		TieneCocinaPantalla:     true,
		TieneRecetas:            true,
		TieneCombos:             true,
		TieneWebsockets:         false,
		TienePromociones:        true,
		TieneQRMesa:             false,
		TieneFacturacionSunat:   true,
	}

	data, _ := json.Marshal(p)
	str := string(data)

	boolFields := []string{
		"tiene_delivery", "tiene_reservas", "tiene_inventario_avanzado", "tiene_reportes_avanzados",
		"tiene_api_access", "tiene_multi_local", "tiene_puntos_fidelidad", "tiene_cocina_pantalla",
		"tiene_recetas", "tiene_combos", "tiene_websockets",
		"tiene_promociones", "tiene_qr_mesa", "tiene_facturacion_sunat",
	}
	for _, field := range boolFields {
		if !sContains(str, `"`+field+`"`) {
			t.Errorf("falta campo boolean %q", field)
		}
	}
}

func TestPlan_OptionalFields(t *testing.T) {
	p := plataforma.Plan{ID: 1, PrecioAnual: nil, MaxUsuarios: nil}
	data, _ := json.Marshal(p)
	str := string(data)

	if sContains(str, `"precio_anual":null`) {
		t.Error("precio_anual:null no debe aparecer (omitempty)")
	}
	if sContains(str, `"max_usuarios":null`) {
		t.Error("max_usuarios:null no debe aparecer (omitempty)")
	}
}

func TestCaracteristicaPlan_JSON(t *testing.T) {
	c := plataforma.CaracteristicaPlan{
		ID:          1,
		PlanID:      2,
		Descripcion: "Hasta 3 locales simultáneos",
		Incluido:    true,
		Orden:       1,
	}

	data, _ := json.Marshal(c)
	if !sContains(string(data), `"descripcion":"Hasta 3`) {
		t.Error("falta descripcion")
	}
	if !sContains(string(data), `"incluido":true`) {
		t.Error("falta incluido")
	}
}

func TestSuscripcion_JSONSerialization(t *testing.T) {
	now := time.Now()
	fin := now.AddDate(0, 1, 0)
	s := plataforma.Suscripcion{
		ID:               1,
		TenantID:         "tenant-uuid",
		PlanID:           2,
		Estado:           "activa",
		FechaInicio:      now,
		FechaVencimiento: fin,
	}

	data, err := json.Marshal(s)
	if err != nil {
		t.Fatalf("error al serializar: %v", err)
	}
	str := string(data)

	if !sContains(str, `"estado":"activa"`) {
		t.Error("falta estado")
	}
}

func TestSuscripcion_CancelacionOmitempty(t *testing.T) {
	s := plataforma.Suscripcion{ID: 1, FechaCancelacion: nil}
	data, _ := json.Marshal(s)
	if sContains(string(data), `"fecha_cancelacion"`) {
		t.Error("fecha_cancelacion no debe aparecer cuando es nil (omitempty)")
	}
}

func TestSuscripcion_Estados(t *testing.T) {
	estados := []string{"activa", "vencida", "cancelada", "trial"}
	for _, estado := range estados {
		s := plataforma.Suscripcion{Estado: estado}
		data, _ := json.Marshal(s)
		if !sContains(string(data), estado) {
			t.Errorf("estado %q no serializado correctamente", estado)
		}
	}
}

func TestFacturaPlataforma_JSON(t *testing.T) {
	f := plataforma.FacturaPlataforma{
		ID:       1,
		TenantID: "tenant-uuid",
		Monto:    99.90,
		Estado:   "pagada",
	}

	data, err := json.Marshal(f)
	if err != nil {
		t.Fatalf("error al serializar factura: %v", err)
	}
	str := string(data)

	if !sContains(str, `"monto":99.9`) {
		t.Error("falta monto")
	}
	if !sContains(str, `"estado":"pagada"`) {
		t.Error("falta estado")
	}
}
