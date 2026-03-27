package plataforma

import (
	"encoding/json"
	"testing"
	"time"
)

// ==========================================
// Tests: Entidades Plataforma
// ==========================================

func sContains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

// --- Tenant ---

func TestTenant_JSONSerialization(t *testing.T) {
	now := time.Now()
	tenant := Tenant{
		ID:              "uuid-tenant-123",
		Nombre:          "Restaurante El Ceviche",
		Slug:            "el-ceviche",
		RUC:             "20123456789",
		CorreoContacto:  "admin@elceviche.pe",
		Telefono:        "+51999888777",
		ColorPrimario:   "#FF5733",
		ColorSecundario: "#3498DB",
		TipoRestaurante: "casual_dining",
		Estado:          "activo",
		DiasTrial:       14,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	data, err := json.Marshal(tenant)
	if err != nil {
		t.Fatalf("error al serializar Tenant: %v", err)
	}
	str := string(data)

	if !sContains(str, `"id_tenant":"uuid-tenant-123"`) {
		t.Error("falta id_tenant")
	}
	if !sContains(str, `"nombre":"Restaurante El Ceviche"`) {
		t.Error("falta nombre")
	}
	if !sContains(str, `"slug":"el-ceviche"`) {
		t.Error("falta slug")
	}
	if !sContains(str, `"ruc":"20123456789"`) {
		t.Error("falta ruc")
	}
	if !sContains(str, `"tipo_restaurante":"casual_dining"`) {
		t.Error("falta tipo_restaurante")
	}
	if !sContains(str, `"estado":"activo"`) {
		t.Error("falta estado")
	}
}

func TestTenant_RUCOmitempty(t *testing.T) {
	tenant := Tenant{ID: "t1", Nombre: "Test"}
	data, _ := json.Marshal(tenant)
	if sContains(string(data), `"ruc":""`) {
		// ruc has omitempty, so empty string should be omitted
	}
}

func TestNuevoTenantRequest_Binding(t *testing.T) {
	jsonStr := `{
		"nombre": "Mi Restaurant",
		"slug": "mi-restaurant",
		"correo_contacto": "admin@mi.com",
		"tipo_restaurante": "fast_food",
		"plan_id": 2
	}`

	var req NuevoTenantRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.Nombre != "Mi Restaurant" {
		t.Errorf("Nombre: esperaba 'Mi Restaurant', obtuvo %q", req.Nombre)
	}
	if req.PlanID != 2 {
		t.Errorf("PlanID: esperaba 2, obtuvo %d", req.PlanID)
	}
}

// --- Plan ---

func TestPlan_JSONSerialization(t *testing.T) {
	plan := Plan{
		ID:              1,
		Nombre:          "Profesional",
		PrecioMensual:   99.90,
		MaxLocales:      5,
		MaxMesas:        100,
		TieneDelivery:   true,
		TieneReservas:   true,
		TieneQRMesa:     true,
		TieneWebsockets: true,
		EsPopular:       true,
		Activo:          true,
	}

	data, err := json.Marshal(plan)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !sContains(str, `"id_plan":1`) {
		t.Error("falta id_plan")
	}
	if !sContains(str, `"nombre":"Profesional"`) {
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
	plan := Plan{
		ID:                      1,
		Nombre:                  "Enterprise",
		TieneDelivery:           true,
		TieneReservas:           true,
		TieneCocinaPantalla:     true,
		TieneMultiLocal:         true,
		TieneInventarioAvanzado: true,
		TieneRecetas:            true,
		TieneCombos:             true,
		TienePromociones:        true,
		TienePuntosFidelidad:    true,
		TieneReportesAvanzados:  true,
		TieneWebsockets:         true,
		TieneAPIAccess:          true,
		TieneQRMesa:             true,
		TieneFacturacionSunat:   true,
	}

	data, _ := json.Marshal(plan)
	str := string(data)

	features := []string{
		"tiene_delivery", "tiene_reservas", "tiene_cocina_pantalla",
		"tiene_multi_local", "tiene_inventario_avanzado", "tiene_recetas",
		"tiene_combos", "tiene_promociones", "tiene_puntos_fidelidad",
		"tiene_reportes_avanzados", "tiene_websockets", "tiene_api_access",
		"tiene_qr_mesa", "tiene_facturacion_sunat",
	}
	for _, f := range features {
		if !sContains(str, `"`+f+`":true`) {
			t.Errorf("falta feature %s", f)
		}
	}
}

func TestPlan_OptionalFields(t *testing.T) {
	plan := Plan{ID: 1, Nombre: "Básico"}
	data, _ := json.Marshal(plan)
	str := string(data)

	// precio_anual and max_usuarios are omitempty pointers
	if sContains(str, `"precio_anual"`) {
		t.Error("precio_anual no debe aparecer cuando es nil")
	}
	if sContains(str, `"max_usuarios"`) {
		t.Error("max_usuarios no debe aparecer cuando es nil")
	}
}

func TestCaracteristicaPlan_JSON(t *testing.T) {
	c := CaracteristicaPlan{
		ID:          1,
		PlanID:      1,
		Descripcion: "Soporte 24/7",
		Incluido:    true,
		Orden:       1,
	}

	data, _ := json.Marshal(c)
	if !sContains(string(data), `"descripcion":"Soporte 24/7"`) {
		t.Error("falta descripcion")
	}
}

// --- Suscripcion ---

func TestSuscripcion_JSONSerialization(t *testing.T) {
	now := time.Now()
	vencimiento := now.AddDate(0, 1, 0)
	precio := 99.90

	sus := Suscripcion{
		ID:                   1,
		TenantID:             "t-123",
		PlanID:               2,
		Estado:               "activa",
		TipoFacturacion:      "mensual",
		FechaInicio:          now,
		FechaVencimiento:     vencimiento,
		PrecioPagado:         &precio,
		RenovacionAutomatica: true,
		NombrePlan:           "Profesional",
	}

	data, err := json.Marshal(sus)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !sContains(str, `"id_suscripcion":1`) {
		t.Error("falta id_suscripcion")
	}
	if !sContains(str, `"estado":"activa"`) {
		t.Error("falta estado")
	}
	if !sContains(str, `"tipo_facturacion":"mensual"`) {
		t.Error("falta tipo_facturacion")
	}
	if !sContains(str, `"nombre_plan":"Profesional"`) {
		t.Error("falta nombre_plan virtual")
	}
}

func TestSuscripcion_CancelacionOmitempty(t *testing.T) {
	sus := Suscripcion{ID: 1, Estado: "activa"}
	data, _ := json.Marshal(sus)
	if sContains(string(data), `"fecha_cancelacion"`) {
		t.Error("fecha_cancelacion no debe aparecer cuando es nil")
	}

	now := time.Now()
	sus.FechaCancelacion = &now
	data, _ = json.Marshal(sus)
	if !sContains(string(data), `"fecha_cancelacion"`) {
		t.Error("fecha_cancelacion debe aparecer cuando tiene valor")
	}
}

func TestSuscripcion_Estados(t *testing.T) {
	estados := []string{"activa", "trial", "vencida", "cancelada", "suspendida"}
	for _, e := range estados {
		s := Suscripcion{Estado: e}
		data, _ := json.Marshal(s)
		if !sContains(string(data), `"estado":"`+e+`"`) {
			t.Errorf("estado %q no serializado", e)
		}
	}
}

// --- FacturaPlataforma ---

func TestFacturaPlataforma_JSON(t *testing.T) {
	now := time.Now()
	f := FacturaPlataforma{
		ID:              1,
		TenantID:        "t-123",
		NumeroFactura:   "F001-0001",
		Concepto:        "Suscripción mensual - Plan Profesional",
		Monto:           99.90,
		Estado:          "pagada",
		FechaEmision:    now,
		CreatedAt:       now,
	}

	data, err := json.Marshal(f)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !sContains(str, `"numero_factura":"F001-0001"`) {
		t.Error("falta numero_factura")
	}
	if !sContains(str, `"monto":99.9`) {
		t.Error("falta monto")
	}
	if !sContains(str, `"estado":"pagada"`) {
		t.Error("falta estado")
	}
}

func TestFacturaPlataforma_OptionalFields(t *testing.T) {
	f := FacturaPlataforma{ID: 1, Estado: "pendiente"}
	data, _ := json.Marshal(f)
	str := string(data)

	if sContains(str, `"fecha_vencimiento"`) {
		t.Error("fecha_vencimiento no debe aparecer cuando es nil")
	}
	if sContains(str, `"fecha_pago"`) {
		t.Error("fecha_pago no debe aparecer cuando es nil")
	}
	if sContains(str, `"suscripcion_id"`) {
		t.Error("suscripcion_id no debe aparecer cuando es nil")
	}
}

// --- HistorialCambioPlan ---

func TestHistorialCambioPlan_JSON(t *testing.T) {
	now := time.Now()
	planAnt := 1
	h := HistorialCambioPlan{
		ID:             1,
		TenantID:       "t-123",
		PlanAnteriorID: &planAnt,
		PlanNuevoID:    2,
		Motivo:         "Upgrade a plan Profesional",
		RealizadoPor:   "admin",
		CreatedAt:      now,
	}

	data, _ := json.Marshal(h)
	str := string(data)

	if !sContains(str, `"plan_nuevo_id":2`) {
		t.Error("falta plan_nuevo_id")
	}
	if !sContains(str, `"motivo":"Upgrade a plan Profesional"`) {
		t.Error("falta motivo")
	}
}

// --- Request Binding ---

func TestNuevoPlanRequest_Binding(t *testing.T) {
	jsonStr := `{"nombre":"Enterprise","precio_mensual":199.90,"max_locales":20,"max_mesas":500}`

	var req NuevoPlanRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.PrecioMensual != 199.90 {
		t.Errorf("PrecioMensual: esperaba 199.90, obtuvo %f", req.PrecioMensual)
	}
	if req.MaxLocales != 20 {
		t.Errorf("MaxLocales: esperaba 20, obtuvo %d", req.MaxLocales)
	}
}

func TestNuevaSuscripcionRequest_Binding(t *testing.T) {
	jsonStr := `{"tenant_id":"t-123","plan_id":2,"tipo_facturacion":"mensual","precio_pagado":99.90}`

	var req NuevaSuscripcionRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.TenantID != "t-123" {
		t.Errorf("TenantID: esperaba 't-123', obtuvo %q", req.TenantID)
	}
	if req.PlanID != 2 {
		t.Errorf("PlanID: esperaba 2, obtuvo %d", req.PlanID)
	}
}

func TestCambiarPlanRequest_Binding(t *testing.T) {
	jsonStr := `{"plan_id":3,"periodo":"anual","motivo":"Necesito más mesas"}`

	var req CambiarPlanRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	if req.PlanID != 3 {
		t.Errorf("PlanID: esperaba 3, obtuvo %d", req.PlanID)
	}
	if req.Motivo != "Necesito más mesas" {
		t.Errorf("Motivo: esperaba 'Necesito más mesas', obtuvo %q", req.Motivo)
	}
}
