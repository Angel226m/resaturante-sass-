package reportes_test

import (
	"encoding/json"
	"testing"

	"github.com/restauflow/backend/internal/entidades/reportes"
)

// ==========================================
// Tests: Entidades Reportes
// ==========================================

func TestDashboardResumen_JSON(t *testing.T) {
	d := reportes.DashboardResumen{
		VentasHoy:         1250.00,
		CrecimientoPorc:   12.5,
		OrdenesMesa:       25,
		OrdenesDelivery:   8,
		OrdenesParaLlevar: 5,
	}

	data, err := json.Marshal(d)
	if err != nil {
		t.Fatalf("error al serializar DashboardResumen: %v", err)
	}
	str := string(data)

	if !contains(str, `"ventas_hoy":1250`) {
		t.Error("falta ventas_hoy")
	}
	if !contains(str, `"crecimiento_porc":12.5`) {
		t.Error("falta crecimiento_porc")
	}
	if !contains(str, `"ordenes_mesa":25`) {
		t.Error("falta ordenes_mesa")
	}
}

func TestDashboardResumen_VentasPorCategoria(t *testing.T) {
	vc := reportes.VentaPorCategoria{
		Nombre:   "Bebidas",
		Total:    350.00,
		Cantidad: 45,
	}

	d := reportes.DashboardResumen{
		VentasPorCategoria: []reportes.VentaPorCategoria{vc},
	}

	data, _ := json.Marshal(d)
	if !contains(string(data), `"Bebidas"`) {
		t.Error("falta categoría en ventas_por_categoria")
	}
}

func TestDashboardResumen_ProductosMasVendidos(t *testing.T) {
	p := reportes.ProductoVendido{
		Nombre:   "Ceviche Clásico",
		Cantidad: 120,
		Total:    4200.00,
	}

	d := reportes.DashboardResumen{
		ProductosMasVendidos: []reportes.ProductoVendido{p},
	}

	data, _ := json.Marshal(d)
	if !contains(string(data), `"Ceviche Cl`) {
		t.Error("falta producto en productos_mas_vendidos")
	}
}

func TestDashboardResumen_VentasPorHora(t *testing.T) {
	vh := reportes.VentaPorHora{
		Hora:  12,
		Total: 450.00,
		Count: 15,
	}

	d := reportes.DashboardResumen{
		VentasPorHora: []reportes.VentaPorHora{vh},
	}

	data, _ := json.Marshal(d)
	if !contains(string(data), `"hora":12`) {
		t.Error("falta hora en ventas_por_hora")
	}
}

func TestResumenDiario_JSON(t *testing.T) {
	localID := 1
	r := reportes.ResumenDiario{
		LocalID:        &localID,
		TotalVentas:    2500.00,
		NumeroOrdenes:  85,
		TicketPromedio: 29.41,
	}

	data, err := json.Marshal(r)
	if err != nil {
		t.Fatalf("error al serializar ResumenDiario: %v", err)
	}
	str := string(data)

	if !contains(str, `"total_ventas":2500`) {
		t.Error("falta total_ventas")
	}
	if !contains(str, `"numero_ordenes":85`) {
		t.Error("falta numero_ordenes")
	}
	if !contains(str, `"ticket_promedio":29.41`) {
		t.Error("falta ticket_promedio")
	}
}

func TestAuditLog_JSON(t *testing.T) {
	tenantID := "tenant-uuid"
	usuarioID := 42
	tabla := "ordenes"
	registroID := "100"
	a := reportes.AuditLog{
		ID:            1,
		TenantID:      &tenantID,
		UsuarioID:     &usuarioID,
		Accion:        "CREATE",
		TablaAfectada: &tabla,
		RegistroID:    &registroID,
	}

	data, err := json.Marshal(a)
	if err != nil {
		t.Fatalf("error al serializar AuditLog: %v", err)
	}
	str := string(data)

	if !contains(str, `"accion":"CREATE"`) {
		t.Error("falta accion")
	}
	if !contains(str, `"tabla_afectada":"ordenes"`) {
		t.Error("falta tabla_afectada")
	}
	if !contains(str, `"registro_id":"100"`) {
		t.Error("falta registro_id")
	}
}

func TestAuditLog_OptionalFields_Omitempty(t *testing.T) {
	a := reportes.AuditLog{
		ID:              1,
		DatosNuevos:     nil,
		DatosAnteriores: nil,
	}
	data, _ := json.Marshal(a)
	str := string(data)

	if contains(str, `"datos_nuevos":null`) {
		t.Error("datos_nuevos:null no debe aparecer (omitempty)")
	}
	if contains(str, `"datos_anteriores":null`) {
		t.Error("datos_anteriores:null no debe aparecer (omitempty)")
	}
}

func TestFiltrosAuditLog_Binding(t *testing.T) {
	jsonStr := `{
		"tabla": "ordenes",
		"accion": "DELETE",
		"usuario_id": 5,
		"pagina": 1,
		"limite": 20
	}`

	var req reportes.FiltrosAuditLog
	err := json.Unmarshal([]byte(jsonStr), &req)
	if err != nil {
		t.Fatalf("error al deserializar: %v", err)
	}

	if req.Tabla != "ordenes" {
		t.Errorf("Tabla: esperaba 'ordenes', obtuvo %q", req.Tabla)
	}
	if req.Accion != "DELETE" {
		t.Errorf("Accion: esperaba 'DELETE', obtuvo %q", req.Accion)
	}
}

func TestVentaPorCategoria_JSON(t *testing.T) {
	vc := reportes.VentaPorCategoria{
		Nombre:   "Platos Principales",
		Total:    1200.00,
		Cantidad: 80,
	}

	data, _ := json.Marshal(vc)
	if !contains(string(data), `"Platos Principales"`) {
		t.Error("falta categoria")
	}
	if !contains(string(data), `"total":1200`) {
		t.Error("falta total")
	}
}

func TestProductoVendido_JSON(t *testing.T) {
	p := reportes.ProductoVendido{
		Nombre:   "Lomo Saltado",
		Cantidad: 95,
		Total:    3325.00,
	}

	data, _ := json.Marshal(p)
	if !contains(string(data), `"Lomo Saltado"`) {
		t.Error("falta nombre")
	}
	if !contains(string(data), `"cantidad":95`) {
		t.Error("falta cantidad")
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
