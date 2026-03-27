package reportes

import (
	"encoding/json"
	"testing"
)

// ==========================================
// Tests: Entidades Reportes / Dashboard
// ==========================================

func TestDashboardResumen_JSON(t *testing.T) {
	d := DashboardResumen{
		VentasHoy:       5000.00,
		VentasAyer:      4500.00,
		CrecimientoPorc: 11.11,
		OrdenesHoy:      50,
		TicketPromedio:   100.00,
		OrdenesActivas:  5,
		MesasOcupadas:   10,
		TotalMesas:      20,
		OcupacionPorc:   50.0,
		ReservasHoy:     3,
		ClientesHoy:     30,
		VentasSemana:    30000.00,
		VentasMes:       120000.00,
		OrdenesMesa:     30,
		OrdenesDelivery: 15,
		OrdenesParaLlevar: 5,
	}

	data, err := json.Marshal(d)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !contains(str, `"ventas_hoy":5000`) {
		t.Error("falta ventas_hoy")
	}
	if !contains(str, `"crecimiento_porc":11.11`) {
		t.Error("falta crecimiento_porc")
	}
	if !contains(str, `"ocupacion_porc":50`) {
		t.Error("falta ocupacion_porc")
	}
	if !contains(str, `"ventas_semana":30000`) {
		t.Error("falta ventas_semana")
	}
	if !contains(str, `"ventas_mes":120000`) {
		t.Error("falta ventas_mes")
	}
	if !contains(str, `"ordenes_mesa":30`) {
		t.Error("falta ordenes_mesa")
	}
	if !contains(str, `"ordenes_delivery":15`) {
		t.Error("falta ordenes_delivery")
	}
	if !contains(str, `"ordenes_para_llevar":5`) {
		t.Error("falta ordenes_para_llevar")
	}
}

func TestDashboardResumen_VentasPorCategoria(t *testing.T) {
	d := DashboardResumen{
		VentasPorCategoria: []VentaPorCategoria{
			{CategoriaID: 1, Nombre: "Entradas", Total: 2500.00, Cantidad: 50},
			{CategoriaID: 2, Nombre: "Platos Fuertes", Total: 8000.00, Cantidad: 80},
		},
	}

	data, _ := json.Marshal(d)
	str := string(data)

	if !contains(str, `"Entradas"`) {
		t.Error("falta categoría Entradas")
	}
	if !contains(str, `"Platos Fuertes"`) {
		t.Error("falta categoría Platos Fuertes")
	}
}

func TestDashboardResumen_ProductosMasVendidos(t *testing.T) {
	d := DashboardResumen{
		ProductosMasVendidos: []ProductoVendido{
			{ProductoID: 1, Nombre: "Ceviche", Cantidad: 30, Total: 1050.00},
			{ProductoID: 2, Nombre: "Lomo Saltado", Cantidad: 25, Total: 875.00},
		},
	}

	data, _ := json.Marshal(d)
	str := string(data)

	if !contains(str, `"Ceviche"`) {
		t.Error("falta producto Ceviche")
	}
	if !contains(str, `"Lomo Saltado"`) {
		t.Error("falta producto Lomo Saltado")
	}
}

func TestDashboardResumen_VentasPorHora(t *testing.T) {
	d := DashboardResumen{
		VentasPorHora: []VentaPorHora{
			{Hora: 12, Total: 800.00, Count: 10},
			{Hora: 13, Total: 1200.00, Count: 15},
			{Hora: 20, Total: 2000.00, Count: 20},
		},
	}

	data, _ := json.Marshal(d)
	str := string(data)

	if !contains(str, `"hora":12`) {
		t.Error("falta hora 12")
	}
	if !contains(str, `"hora":20`) {
		t.Error("falta hora 20")
	}
}

func TestResumenDiario_JSON(t *testing.T) {
	r := ResumenDiario{
		ID:                    1,
		TenantID:              "tenant-abc",
		TotalVentas:           15000.00,
		NumeroOrdenes:         100,
		NumeroOrdenesMesa:     60,
		NumeroOrdenesDelivery: 30,
		NumeroOrdenesLlevar:   10,
		TicketPromedio:        150.00,
		TotalPropinas:         500.00,
		TotalDescuentos:       200.00,
		ClientesNuevos:        5,
	}

	data, _ := json.Marshal(r)
	str := string(data)

	if !contains(str, `"total_ventas":15000`) {
		t.Error("falta total_ventas")
	}
	if !contains(str, `"numero_ordenes_mesa":60`) {
		t.Error("falta numero_ordenes_mesa")
	}
	if !contains(str, `"ticket_promedio":150`) {
		t.Error("falta ticket_promedio")
	}
}

func TestAuditLog_JSON(t *testing.T) {
	a := AuditLog{
		ID:     1,
		Accion: "login",
	}

	data, _ := json.Marshal(a)
	str := string(data)

	if !contains(str, `"accion":"login"`) {
		t.Error("falta accion")
	}
}

func TestAuditLog_OptionalFields_Omitempty(t *testing.T) {
	a := AuditLog{
		ID:     1,
		Accion: "test",
	}

	data, _ := json.Marshal(a)
	str := string(data)

	// All optional pointer fields should be omitted
	if contains(str, `"tenant_id"`) {
		t.Error("tenant_id no debe aparecer cuando nil")
	}
	if contains(str, `"tabla_afectada"`) {
		t.Error("tabla_afectada no debe aparecer cuando nil")
	}
	if contains(str, `"ip_origen"`) {
		t.Error("ip_origen no debe aparecer cuando nil")
	}
}

func TestFiltrosAuditLog_Binding(t *testing.T) {
	jsonStr := `{"accion":"login","tabla":"usuarios","fecha_desde":"2025-01-01","fecha_hasta":"2025-12-31","pagina":1,"por_pagina":20}`

	var f FiltrosAuditLog
	if err := json.Unmarshal([]byte(jsonStr), &f); err != nil {
		t.Fatalf("error: %v", err)
	}

	if f.Accion != "login" {
		t.Errorf("esperado login, got %s", f.Accion)
	}
	if f.PorPagina != 20 {
		t.Errorf("esperado 20, got %d", f.PorPagina)
	}
}

func TestVentaPorCategoria_JSON(t *testing.T) {
	v := VentaPorCategoria{
		CategoriaID: 1,
		Nombre:      "Bebidas",
		Total:       5000.00,
		Cantidad:    200,
	}

	data, _ := json.Marshal(v)
	str := string(data)

	if !contains(str, `"nombre":"Bebidas"`) {
		t.Error("falta nombre")
	}
	if !contains(str, `"cantidad":200`) {
		t.Error("falta cantidad")
	}
}

func TestProductoVendido_JSON(t *testing.T) {
	p := ProductoVendido{
		ProductoID: 5,
		Nombre:     "Arroz Chaufa",
		Cantidad:   45,
		Total:      1125.00,
	}

	data, _ := json.Marshal(p)
	if !contains(string(data), `"nombre":"Arroz Chaufa"`) {
		t.Error("falta nombre producto")
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
