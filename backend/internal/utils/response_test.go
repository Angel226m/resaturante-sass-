package utils

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// ==========================================
// Tests: Response helpers
// ==========================================

func init() {
	gin.SetMode(gin.TestMode)
}

func TestSuccessResponse(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	SuccessResponse(c, "todo bien", map[string]string{"key": "value"})

	if w.Code != 200 {
		t.Errorf("código: esperaba 200, obtuvo %d", w.Code)
	}

	var resp APIResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if !resp.Exito {
		t.Error("exito debe ser true")
	}
	if resp.Mensaje != "todo bien" {
		t.Errorf("mensaje: esperaba 'todo bien', obtuvo %q", resp.Mensaje)
	}
}

func TestCreatedResponse(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	CreatedResponse(c, "recurso creado", nil)

	if w.Code != 201 {
		t.Errorf("código: esperaba 201, obtuvo %d", w.Code)
	}
}

func TestBadRequest(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	BadRequest(c, "datos inválidos")

	if w.Code != 400 {
		t.Errorf("código: esperaba 400, obtuvo %d", w.Code)
	}

	var resp APIResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.Exito {
		t.Error("exito debe ser false")
	}
}

func TestUnauthorized(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	Unauthorized(c, "no autorizado")

	if w.Code != 401 {
		t.Errorf("código: esperaba 401, obtuvo %d", w.Code)
	}
}

func TestForbidden(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	Forbidden(c, "acceso denegado")

	if w.Code != 403 {
		t.Errorf("código: esperaba 403, obtuvo %d", w.Code)
	}
}

func TestNotFound(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	NotFound(c, "recurso no encontrado")

	if w.Code != 404 {
		t.Errorf("código: esperaba 404, obtuvo %d", w.Code)
	}
}

func TestConflict(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	Conflict(c, "ya existe")

	if w.Code != 409 {
		t.Errorf("código: esperaba 409, obtuvo %d", w.Code)
	}
}

func TestPaginadoResponse(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	items := []string{"a", "b", "c"}
	PaginatedResponse(c, "ok", items, 30, 1, 10)

	if w.Code != 200 {
		t.Errorf("código: esperaba 200, obtuvo %d", w.Code)
	}

	var resp PaginacionResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.Total != 30 {
		t.Errorf("total: esperaba 30, obtuvo %d", resp.Total)
	}
	if resp.Pagina != 1 {
		t.Errorf("pagina: esperaba 1, obtuvo %d", resp.Pagina)
	}
	if resp.Limite != 10 {
		t.Errorf("limite: esperaba 10, obtuvo %d", resp.Limite)
	}
	if resp.TotalPages != 3 {
		t.Errorf("total_paginas: esperaba 3, obtuvo %d", resp.TotalPages)
	}
}

func TestPaginadoResponse_PartialPage(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	PaginatedResponse(c, "ok", []string{}, 25, 1, 10)

	var resp PaginacionResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.TotalPages != 3 {
		t.Errorf("total_paginas: esperaba 3 para 25 items / 10 por página, obtuvo %d", resp.TotalPages)
	}
}
