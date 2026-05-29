package delivery_test

import (
	"encoding/json"
	"testing"

	"github.com/restauflow/backend/internal/entidades/delivery"
)

// ==========================================
// Tests: Entidades Delivery
// ==========================================

func TestZonaDelivery_JSON(t *testing.T) {
	z := delivery.ZonaDelivery{
		ID:                1,
		TenantID:          "tenant-uuid",
		Nombre:            "Zona Norte",
		CostoEnvio:        5.00,
		TiempoEstimadoMin: 15,
		Activo:            true,
	}

	data, err := json.Marshal(z)
	if err != nil {
		t.Fatalf("error al serializar ZonaDelivery: %v", err)
	}
	str := string(data)

	if !contains(str, `"nombre":"Zona Norte"`) {
		t.Error("falta nombre")
	}
	if !contains(str, `"costo_envio":5`) {
		t.Error("falta costo_envio")
	}
	if !contains(str, `"activo":true`) {
		t.Error("falta activo")
	}
}

func TestDeliveryOrden_JSON(t *testing.T) {
	d := delivery.DeliveryOrden{
		ID:                   1,
		OrdenID:              10,
		InstruccionesEntrega: "Av. Lima 456",
		EstadoDelivery:       "pendiente",
		CostoEnvio:           5.00,
	}

	data, err := json.Marshal(d)
	if err != nil {
		t.Fatalf("error al serializar DeliveryOrden: %v", err)
	}
	str := string(data)

	if !contains(str, `"instrucciones_entrega":"Av. Lima`) {
		t.Error("falta instrucciones_entrega")
	}
	if !contains(str, `"estado_delivery":"pendiente"`) {
		t.Error("falta estado_delivery")
	}
}

func TestDeliveryOrden_VirtualFields(t *testing.T) {
	d := delivery.DeliveryOrden{
		ID:               1,
		NumeroOrden:      "ORD-001",
		NombreRepartidor: "Pedro Ramos",
		NombreZona:       "Zona Norte",
	}

	data, _ := json.Marshal(d)
	str := string(data)

	if !contains(str, `"numero_orden":"ORD-001"`) {
		t.Error("falta campo virtual numero_orden")
	}
	if !contains(str, `"nombre_repartidor":"Pedro Ramos"`) {
		t.Error("falta campo virtual nombre_repartidor")
	}
	if !contains(str, `"nombre_zona":"Zona Norte"`) {
		t.Error("falta campo virtual nombre_zona")
	}
}

func TestDeliveryOrden_Seguimiento(t *testing.T) {
	lat := 12.3456
	lon := -77.0311
	d := delivery.DeliveryOrden{
		ID:              1,
		LatitudEntrega:  &lat,
		LongitudEntrega: &lon,
		Seguimiento: []delivery.SeguimientoDelivery{
			{ID: 1, Latitud: lat, Longitud: lon, EstadoDelivery: "en_camino"},
		},
	}

	data, _ := json.Marshal(d)
	str := string(data)

	if !contains(str, `"latitud_entrega":12.3456`) {
		t.Error("falta latitud_entrega")
	}
	if !contains(str, `"en_camino"`) {
		t.Error("falta estado en seguimiento")
	}
}

func TestNuevoDeliveryOrdenRequest_Binding(t *testing.T) {
	jsonStr := `{
		"orden_id": 5,
		"instrucciones_entrega": "Jr. Miraflores 123",
		"zona_delivery_id": 1
	}`

	var req delivery.NuevoDeliveryOrdenRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.OrdenID != 5 {
		t.Errorf("OrdenID: esperaba 5, obtuvo %d", req.OrdenID)
	}
	if req.InstruccionesEntrega != "Jr. Miraflores 123" {
		t.Errorf("InstruccionesEntrega: esperaba 'Jr. Miraflores 123', obtuvo %q", req.InstruccionesEntrega)
	}
}

func TestAsignarRepartidorRequest_Binding(t *testing.T) {
	jsonStr := `{"repartidor_id": 7}`

	var req delivery.AsignarRepartidorRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.RepartidorID != 7 {
		t.Errorf("RepartidorID: esperaba 7, obtuvo %d", req.RepartidorID)
	}
}

func TestActualizarEstadoDeliveryRequest_Binding(t *testing.T) {
	lat := -12.0464
	lon := -77.0428
	jsonStr, _ := json.Marshal(map[string]interface{}{
		"estado_delivery": "en_camino",
		"latitud":         lat,
		"longitud":        lon,
	})

	var req delivery.ActualizarEstadoDeliveryRequest
	err := json.Unmarshal(jsonStr, &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.EstadoDelivery != "en_camino" {
		t.Errorf("EstadoDelivery: esperaba 'en_camino', obtuvo %q", req.EstadoDelivery)
	}
	if req.Latitud == nil || *req.Latitud != lat {
		t.Errorf("Latitud: esperaba %f", lat)
	}
}

func TestFiltrosDelivery_Binding(t *testing.T) {
	jsonStr := `{"estado":"pendiente","repartidor_id":3}`

	var req delivery.FiltrosDelivery
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Estado != "pendiente" {
		t.Errorf("Estado: esperaba 'pendiente', obtuvo %q", req.Estado)
	}
}

func TestNuevaZonaDeliveryRequest_Binding(t *testing.T) {
	jsonStr := `{
		"nombre": "Zona Sur",
		"costo_envio": 8.00,
		"tiempo_estimado_min": 20
	}`

	var req delivery.NuevaZonaDeliveryRequest
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Nombre != "Zona Sur" {
		t.Errorf("Nombre: esperaba 'Zona Sur', obtuvo %q", req.Nombre)
	}
	if req.CostoEnvio != 8.00 {
		t.Errorf("CostoEnvio: esperaba 8.00, obtuvo %f", req.CostoEnvio)
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
