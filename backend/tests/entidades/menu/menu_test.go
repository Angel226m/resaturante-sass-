package menu_test

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/restauflow/backend/internal/entidades/menu"
)

// ==========================================
// Tests: Entidades Menu
// ==========================================

func TestCategoriaMenu_JSON(t *testing.T) {
	c := menu.CategoriaMenu{
		ID:     1,
		Nombre: "Entradas",
		Icono:  "utensils",
		Color:  "#FF5733",
		Orden:  1,
		Activo: true,
	}

	data, err := json.Marshal(c)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !sContains(str, `"nombre":"Entradas"`) {
		t.Error("falta nombre")
	}
	if !sContains(str, `"icono":"utensils"`) {
		t.Error("falta icono")
	}
}

func TestProductoMenu_JSON(t *testing.T) {
	p := menu.ProductoMenu{
		ID:                1,
		Nombre:            "Ceviche Clásico",
		PrecioBase:        35.00,
		Disponible:        true,
		EsVegetariano:     false,
		EsVegano:          false,
		EsGlutenFree:      true,
		TiempoPreparacion: 15,
		Activo:            true,
	}

	data, err := json.Marshal(p)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	str := string(data)

	if !sContains(str, `"nombre":"Ceviche Cl`) {
		t.Error("falta nombre")
	}
	if !sContains(str, `"precio_base":35`) {
		t.Error("falta precio_base")
	}
	if !sContains(str, `"es_gluten_free":true`) {
		t.Error("falta es_gluten_free")
	}
}

func TestProductoMenu_DeletedAt_Omitempty(t *testing.T) {
	p := menu.ProductoMenu{ID: 1, DeletedAt: nil}
	data, _ := json.Marshal(p)
	if sContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at no debe aparecer cuando es nil")
	}

	now := time.Now()
	p.DeletedAt = &now
	data, _ = json.Marshal(p)
	if !sContains(string(data), `"deleted_at"`) {
		t.Error("deleted_at debe aparecer cuando tiene valor")
	}
}

func TestCombo_JSON(t *testing.T) {
	c := menu.Combo{
		ID:          1,
		Nombre:      "Combo Familiar",
		PrecioCombo: 89.90,
		Activo:      true,
	}

	data, _ := json.Marshal(c)
	if !sContains(string(data), `"nombre":"Combo Familiar"`) {
		t.Error("falta nombre combo")
	}
	if !sContains(string(data), `"precio_combo":89.9`) {
		t.Error("falta precio_combo")
	}
}

func TestPromocion_JSON(t *testing.T) {
	p := menu.Promocion{
		ID:            1,
		Nombre:        "2x1 Ceviche",
		TipoDescuento: "porcentaje",
		Activo:        true,
	}

	data, _ := json.Marshal(p)
	if !sContains(string(data), `"tipo_descuento":"porcentaje"`) {
		t.Error("falta tipo_descuento")
	}
}

func TestCupon_JSON(t *testing.T) {
	c := menu.Cupon{
		ID:             1,
		Codigo:         "DESCUENTO20",
		TipoDescuento:  "porcentaje",
		ValorDescuento: 20.0,
		Activo:         true,
	}

	data, _ := json.Marshal(c)
	str := string(data)

	if !sContains(str, `"codigo":"DESCUENTO20"`) {
		t.Error("falta codigo")
	}
	if !sContains(str, `"valor_descuento":20`) {
		t.Error("falta valor_descuento")
	}
}

func TestGrupoModificador_JSON(t *testing.T) {
	g := menu.GrupoModificador{
		ID:     1,
		Nombre: "Salsas Extra",
	}

	data, _ := json.Marshal(g)
	if !sContains(string(data), `"nombre":"Salsas Extra"`) {
		t.Error("falta nombre grupo modificador")
	}
}

// helpers
func intPtr(i int) *int { return &i }

func sContains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
