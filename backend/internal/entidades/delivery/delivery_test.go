package delivery

import (
	"encoding/json"
	"testing"
)

// ==========================================
// Tests: Entidades Delivery
// ==========================================

func TestZonaDelivery_JSON(t *testing.T) {
	z := ZonaDelivery{
		ID:                1,
		TenantID:          "tenant-abc",
		LocalID:           1,
		Nombre:            "Centro de Lima",
		RadioKM:           5.0,
		CostoEnvio:        8.00,
		TiempoEstimadoMin: 30,
		Activo:            true,
	}

	data, err := json.Marshal(z)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"nombre":"Centro de Lima"`) {
		t.Error("falta nombre")
	}
	if !contains(str, `"radio_km":5`) {
		t.Error("falta radio_km")
	}
	if !contains(str, `"costo_envio":8`) {
		t.Error("falta costo_envio")
	}
	if !contains(str, `"tiempo_estimado_min":30`) {
		t.Error("falta tiempo_estimado_min")
	}
}

func TestDeliveryOrden_JSON(t *testing.T) {
	do := DeliveryOrden{
		ID:                   1,
		TenantID:             "tenant-abc",
		OrdenID:              100,
		EstadoDelivery:       "en_camino",
		CostoEnvio:           10.00,
		InstruccionesEntrega: "Tocar timbre 2 veces",
		CodigoConfirmacion:   "DEL-001",
	}

	data, err := json.Marshal(do)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"estado_delivery":"en_camino"`) {
		t.Error("falta estado_delivery")
	}
	if !contains(str, `"costo_envio":10`) {
		t.Error("falta costo_envio")
	}
	if !contains(str, `"instrucciones_entrega":"Tocar timbre 2 veces"`) {
		t.Error("falta instrucciones_entrega")
	}
}

func TestDeliveryOrden_VirtualFields(t *testing.T) {
	do := DeliveryOrden{
		ID:               1,
		NumeroOrden:      "ORD-050",
		NombreRepartidor: "Pedro Repartidor",
		NombreZona:       "Miraflores",
	}

	data, _ := json.Marshal(do)
	str := string(data)

	if !contains(str, `"numero_orden":"ORD-050"`) {
		t.Error("falta numero_orden virtual")
	}
	if !contains(str, `"nombre_repartidor":"Pedro Repartidor"`) {
		t.Error("falta nombre_repartidor virtual")
	}
	if !contains(str, `"nombre_zona":"Miraflores"`) {
		t.Error("falta nombre_zona virtual")
	}
}

func TestDeliveryOrden_Seguimiento(t *testing.T) {
	do := DeliveryOrden{
		ID: 1,
		Seguimiento: []SeguimientoDelivery{
			{ID: 1, Latitud: -12.04, Longitud: -77.03, EstadoDelivery: "en_camino"},
			{ID: 2, Latitud: -12.05, Longitud: -77.04, EstadoDelivery: "entregado"},
		},
	}

	data, _ := json.Marshal(do)
	str := string(data)

	if !contains(str, `"en_camino"`) {
		t.Error("falta estado en_camino en seguimiento")
	}
	if !contains(str, `"entregado"`) {
		t.Error("falta estado entregado en seguimiento")
	}
}

func TestNuevoDeliveryOrdenRequest_Binding(t *testing.T) {
	jsonStr := `{"orden_id":100,"instrucciones_entrega":"Dejar en portería","latitud_entrega":-12.04,"longitud_entrega":-77.03}`

	var req NuevoDeliveryOrdenRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.OrdenID != 100 {
		t.Errorf("esperado 100, got %d", req.OrdenID)
	}
	if req.InstruccionesEntrega != "Dejar en portería" {
		t.Errorf("instrucciones incorrectas: %s", req.InstruccionesEntrega)
	}
}

func TestAsignarRepartidorRequest_Binding(t *testing.T) {
	jsonStr := `{"repartidor_id":5}`

	var req AsignarRepartidorRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.RepartidorID != 5 {
		t.Errorf("esperado 5, got %d", req.RepartidorID)
	}
}

func TestActualizarEstadoDeliveryRequest_Binding(t *testing.T) {
	lat := -12.05
	lng := -77.04
	jsonStr := `{"estado_delivery":"entregado","latitud":-12.05,"longitud":-77.04}`

	var req ActualizarEstadoDeliveryRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.EstadoDelivery != "entregado" {
		t.Errorf("esperado entregado, got %s", req.EstadoDelivery)
	}
	if req.Latitud == nil || *req.Latitud != lat {
		t.Error("latitud incorrecta")
	}
	if req.Longitud == nil || *req.Longitud != lng {
		t.Error("longitud incorrecta")
	}
}

func TestFiltrosDelivery_Binding(t *testing.T) {
	jsonStr := `{"local_id":1,"estado":"en_camino","pagina":2,"por_pagina":15}`

	var f FiltrosDelivery
	if err := json.Unmarshal([]byte(jsonStr), &f); err != nil {
		t.Fatalf("error: %v", err)
	}

	if f.Estado != "en_camino" {
		t.Errorf("esperado en_camino, got %s", f.Estado)
	}
	if f.Pagina != 2 {
		t.Errorf("esperado pagina=2, got %d", f.Pagina)
	}
}

func TestNuevaZonaDeliveryRequest_Binding(t *testing.T) {
	jsonStr := `{"local_id":1,"nombre":"San Isidro","radio_km":3.5,"costo_envio":6.00,"tiempo_estimado_min":25}`

	var req NuevaZonaDeliveryRequest
	if err := json.Unmarshal([]byte(jsonStr), &req); err != nil {
		t.Fatalf("error: %v", err)
	}

	if req.Nombre != "San Isidro" {
		t.Errorf("esperado San Isidro, got %s", req.Nombre)
	}
	if req.RadioKM != 3.5 {
		t.Errorf("esperado 3.5, got %f", req.RadioKM)
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
