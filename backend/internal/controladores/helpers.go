package controladores

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// ==========================================
// Helpers compartidos para controladores
// ==========================================

// parseID64 convierte string a int64 (para IDs BIGSERIAL)
func parseID64(s string) (int64, error) {
	return strconv.ParseInt(s, 10, 64)
}

// obtenerPaginacion extrae pagina y por_pagina de query params con defaults
func obtenerPaginacion(ctx *gin.Context) (int, int) {
	pagina, _ := strconv.Atoi(ctx.DefaultQuery("pagina", "1"))
	porPagina, _ := strconv.Atoi(ctx.DefaultQuery("por_pagina", "20"))
	if pagina < 1 {
		pagina = 1
	}
	if porPagina < 1 || porPagina > 100 {
		porPagina = 20
	}
	return pagina, porPagina
}

// parseOptionalInt convierte string a *int (nil si vacío)
func parseOptionalInt(s string) *int {
	if s == "" {
		return nil
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return nil
	}
	return &v
}

// parseOptionalInt64 convierte string a *int64 (nil si vacío)
func parseOptionalInt64(s string) *int64 {
	if s == "" {
		return nil
	}
	v, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return nil
	}
	return &v
}
