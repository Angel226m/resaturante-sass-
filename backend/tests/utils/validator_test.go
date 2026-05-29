package utils_test

import (
	"testing"

	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Tests: Validator
// ==========================================

// --- Correo ---
func TestValidarCorreo_Valid(t *testing.T) {
	correos := []string{
		"usuario@dominio.com",
		"test.name@empresa.co",
		"user+tag@gmail.com",
		"a@b.pe",
	}
	for _, c := range correos {
		if err := utils.ValidarCorreo(c); err != nil {
			t.Errorf("ValidarCorreo(%q) esperaba nil, obtuvo: %v", c, err)
		}
	}
}

func TestValidarCorreo_Invalid(t *testing.T) {
	correos := []string{
		"",
		"sin-arroba.com",
		"@dominio.com",
		"usuario@",
		"usuario@.com",
		"usuario@dominio",
		"user name@domain.com",
	}
	for _, c := range correos {
		if err := utils.ValidarCorreo(c); err == nil {
			t.Errorf("ValidarCorreo(%q) esperaba error, obtuvo nil", c)
		}
	}
}

// --- Celular ---
func TestValidarCelular_Valid(t *testing.T) {
	celulares := []string{"912345678", "987654321", "900000000"}
	for _, c := range celulares {
		if err := utils.ValidarCelular(c); err != nil {
			t.Errorf("ValidarCelular(%q) esperaba nil, obtuvo: %v", c, err)
		}
	}
}

func TestValidarCelular_Invalid(t *testing.T) {
	celulares := []string{"", "12345678", "9123456789", "91234567", "abcdefghi", "812345678"}
	for _, c := range celulares {
		if err := utils.ValidarCelular(c); err == nil {
			t.Errorf("ValidarCelular(%q) esperaba error, obtuvo nil", c)
		}
	}
}

// --- RUC ---
func TestValidarRUC_Valid(t *testing.T) {
	rucs := []string{"10123456789", "20123456789"}
	for _, r := range rucs {
		if err := utils.ValidarRUC(r); err != nil {
			t.Errorf("ValidarRUC(%q) esperaba nil, obtuvo: %v", r, err)
		}
	}
}

func TestValidarRUC_Invalid(t *testing.T) {
	rucs := []string{"", "30123456789", "1012345678", "101234567890", "abcdefghijk"}
	for _, r := range rucs {
		if err := utils.ValidarRUC(r); err == nil {
			t.Errorf("ValidarRUC(%q) esperaba error, obtuvo nil", r)
		}
	}
}

// --- DNI ---
func TestValidarDNI_Valid(t *testing.T) {
	if err := utils.ValidarDNI("12345678"); err != nil {
		t.Errorf("ValidarDNI('12345678') esperaba nil, obtuvo: %v", err)
	}
}

func TestValidarDNI_Invalid(t *testing.T) {
	dnis := []string{"", "1234567", "123456789", "abcdefgh"}
	for _, d := range dnis {
		if err := utils.ValidarDNI(d); err == nil {
			t.Errorf("ValidarDNI(%q) esperaba error, obtuvo nil", d)
		}
	}
}

// --- Slug ---
func TestValidarSlug_Valid(t *testing.T) {
	slugs := []string{"mi-slug", "test", "slug-123", "a-b-c"}
	for _, s := range slugs {
		if err := utils.ValidarSlug(s); err != nil {
			t.Errorf("ValidarSlug(%q) esperaba nil, obtuvo: %v", s, err)
		}
	}
}

func TestValidarSlug_Invalid(t *testing.T) {
	slugs := []string{"", "MI-SLUG", "slug con espacio", "slug--doble", "-inicio", "final-"}
	for _, s := range slugs {
		if err := utils.ValidarSlug(s); err == nil {
			t.Errorf("ValidarSlug(%q) esperaba error, obtuvo nil", s)
		}
	}
}

// --- Color ---
func TestValidarColor_Valid(t *testing.T) {
	colores := []string{"#FF0000", "#00ff00", "#123ABC", ""}
	for _, c := range colores {
		if err := utils.ValidarColor(c); err != nil {
			t.Errorf("ValidarColor(%q) esperaba nil, obtuvo: %v", c, err)
		}
	}
}

func TestValidarColor_Invalid(t *testing.T) {
	colores := []string{"FF0000", "#FFF", "#GGGGGG", "#12345", "red"}
	for _, c := range colores {
		if err := utils.ValidarColor(c); err == nil {
			t.Errorf("ValidarColor(%q) esperaba error, obtuvo nil", c)
		}
	}
}

// --- Pin ---
func TestValidarPin_Valid(t *testing.T) {
	pins := []string{"", "1234", "12345", "123456"}
	for _, p := range pins {
		if err := utils.ValidarPin(p); err != nil {
			t.Errorf("ValidarPin(%q) esperaba nil, obtuvo: %v", p, err)
		}
	}
}

func TestValidarPin_Invalid(t *testing.T) {
	pins := []string{"123", "1234567", "abcd", "12ab"}
	for _, p := range pins {
		if err := utils.ValidarPin(p); err == nil {
			t.Errorf("ValidarPin(%q) esperaba error, obtuvo nil", p)
		}
	}
}
