package utils

import (
	"errors"
	"regexp"
	"strings"
)

// ==========================================
// Validador de datos
// RestauFlow SaaS Multi-Tenant
// ==========================================

var (
	regexCorreo   = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	regexCelular  = regexp.MustCompile(`^9\d{8}$`)
	regexRUC      = regexp.MustCompile(`^(10|20)\d{9}$`)
	regexDNI      = regexp.MustCompile(`^\d{8}$`)
	regexSlug     = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	regexColor    = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)
	regexPin      = regexp.MustCompile(`^\d{4,6}$`)
)

// ValidarCorreo valida formato de correo electrónico
func ValidarCorreo(correo string) error {
	correo = strings.TrimSpace(correo)
	if correo == "" {
		return errors.New("el correo es obligatorio")
	}
	if !regexCorreo.MatchString(correo) {
		return errors.New("formato de correo electrónico inválido")
	}
	return nil
}

// ValidarCelular valida formato de celular peruano (9XXXXXXXX)
func ValidarCelular(celular string) error {
	celular = strings.TrimSpace(celular)
	if celular == "" {
		return errors.New("el número de celular es obligatorio")
	}
	if !regexCelular.MatchString(celular) {
		return errors.New("formato de celular inválido, debe ser 9XXXXXXXX")
	}
	return nil
}

// ValidarRUC valida formato de RUC peruano
func ValidarRUC(ruc string) error {
	ruc = strings.TrimSpace(ruc)
	if ruc == "" {
		return errors.New("el RUC es obligatorio")
	}
	if !regexRUC.MatchString(ruc) {
		return errors.New("formato de RUC inválido, debe iniciar con 10 o 20 y tener 11 dígitos")
	}
	return nil
}

// ValidarDNI valida formato de DNI peruano (8 dígitos)
func ValidarDNI(dni string) error {
	dni = strings.TrimSpace(dni)
	if dni == "" {
		return errors.New("el DNI es obligatorio")
	}
	if !regexDNI.MatchString(dni) {
		return errors.New("formato de DNI inválido, debe tener 8 dígitos")
	}
	return nil
}

// ValidarSlug valida formato de slug
func ValidarSlug(slug string) error {
	if slug == "" {
		return errors.New("el slug es obligatorio")
	}
	if !regexSlug.MatchString(slug) {
		return errors.New("formato de slug inválido, solo letras minúsculas, números y guiones")
	}
	return nil
}

// ValidarColor valida formato de color hexadecimal (#RRGGBB)
func ValidarColor(color string) error {
	if color == "" {
		return nil // color es opcional
	}
	if !regexColor.MatchString(color) {
		return errors.New("formato de color inválido, debe ser #RRGGBB")
	}
	return nil
}

// ValidarContrasena valida requisitos mínimos de contraseña
func ValidarContrasena(contrasena string) error {
	if len(contrasena) < 8 {
		return errors.New("la contraseña debe tener al menos 8 caracteres")
	}
	if len(contrasena) > 72 {
		return errors.New("la contraseña no puede exceder 72 caracteres")
	}
	return nil
}

// ValidarPin valida formato de PIN de acceso rápido
func ValidarPin(pin string) error {
	if pin == "" {
		return nil // pin es opcional
	}
	if !regexPin.MatchString(pin) {
		return errors.New("el PIN debe tener entre 4 y 6 dígitos")
	}
	return nil
}

// ValidarRol valida que el rol sea válido para usuario de tenant
func ValidarRol(rol string) error {
	rolesValidos := map[string]bool{
		"OWNER": true, "ADMIN": true, "GERENTE": true, "CAJERO": true,
		"MESERO": true, "COCINERO": true, "ALMACENERO": true, "REPARTIDOR": true,
	}
	if !rolesValidos[rol] {
		return errors.New("rol inválido, debe ser: OWNER, ADMIN, GERENTE, CAJERO, MESERO, COCINERO, ALMACENERO o REPARTIDOR")
	}
	return nil
}

// ValidarNivelSuperAdmin valida nivel de superadmin
func ValidarNivelSuperAdmin(nivel string) error {
	niveles := map[string]bool{
		"superadmin": true, "admin": true, "soporte": true,
	}
	if !niveles[nivel] {
		return errors.New("nivel inválido, debe ser: superadmin, admin o soporte")
	}
	return nil
}

// ValidarTextoRequerido valida que un campo de texto no esté vacío
func ValidarTextoRequerido(campo, nombre string, min, max int) error {
	campo = strings.TrimSpace(campo)
	if campo == "" {
		return errors.New(nombre + " es obligatorio")
	}
	if len(campo) < min {
		return errors.New(nombre + " debe tener al menos " + strings.TrimSpace(string(rune(min+'0'))) + " caracteres")
	}
	if max > 0 && len(campo) > max {
		return errors.New(nombre + " no puede exceder " + strings.TrimSpace(string(rune(max+'0'))) + " caracteres")
	}
	return nil
}

// ValidarPaginacion valida y normaliza parámetros de paginación
func ValidarPaginacion(pagina, limite int) (int, int) {
	if pagina < 1 {
		pagina = 1
	}
	if limite < 1 {
		limite = 20
	}
	if limite > 100 {
		limite = 100
	}
	return pagina, limite
}
