package controllers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/controladores"
	"github.com/restauflow/backend/internal/utils"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// newCtrl crea un AuthController con Service=nil.
// Es seguro usarlo para handlers que no acceden a Service
// (Logout, y el path de ShouldBindJSON fallido en Login).
func newCtrl() *controladores.AuthController {
	return controladores.NuevoAuthController(nil)
}

// ─── Logout ──────────────────────────────────────────────────────────────────

func TestLogout_Status200(t *testing.T) {
	r := gin.New()
	r.POST("/logout", newCtrl().Logout)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/logout", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperaba 200, obtuvo %d", w.Code)
	}
}

func TestLogout_ClearsCookies(t *testing.T) {
	r := gin.New()
	r.POST("/logout", newCtrl().Logout)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/logout", nil)
	r.ServeHTTP(w, req)

	var accessCleared, refreshCleared bool
	for _, c := range w.Result().Cookies() {
		if c.Name == "access_token" && c.MaxAge < 0 {
			accessCleared = true
		}
		if c.Name == "refresh_token" && c.MaxAge < 0 {
			refreshCleared = true
		}
	}
	if !accessCleared {
		t.Error("access_token no fue limpiado (MaxAge debe ser < 0)")
	}
	if !refreshCleared {
		t.Error("refresh_token no fue limpiado (MaxAge debe ser < 0)")
	}
}

func TestLogout_ResponseBody(t *testing.T) {
	r := gin.New()
	r.POST("/logout", newCtrl().Logout)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/logout", nil)
	r.ServeHTTP(w, req)

	var body utils.APIResponse
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("error decodificando respuesta: %v", err)
	}
	if !body.Exito {
		t.Errorf("esperaba exito=true, obtuvo false")
	}
	if body.Mensaje != "sesión cerrada" {
		t.Errorf("mensaje: esperaba 'sesión cerrada', obtuvo %q", body.Mensaje)
	}
}

// ─── Login — validación de binding ───────────────────────────────────────────

// Login con body vacío debe retornar 400 (ShouldBindJSON falla antes de llamar a Service).
func TestLogin_EmptyBody_BadRequest(t *testing.T) {
	r := gin.New()
	r.POST("/login", func(c *gin.Context) {
		c.Set("tenant_id", "tenant-test")
		newCtrl().Login(c)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/login", nil)
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("esperaba 400 por body vacío, obtuvo %d", w.Code)
	}
}

// TestLogin_MissingFields_BadRequest omitido:
// LoginRequest usa validate:"required" (go-playground) en lugar de binding:"required" (gin),
// por lo que ShouldBindJSON acepta JSON parcial y pasaría a llamar Service (nil → panic).
// La validación de campos requeridos se cubre en los tests de integración con Service real.
