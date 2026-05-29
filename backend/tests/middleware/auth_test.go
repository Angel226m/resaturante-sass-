package middleware_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/utils"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// setupEnv configura las variables de entorno JWT para la duración del test.
func setupEnv(t *testing.T) {
	t.Helper()
	os.Setenv("JWT_SECRET", "test-access-secret-for-tests!!!")
	os.Setenv("JWT_REFRESH_SECRET", "test-refresh-secret-for-tests!!")
	t.Cleanup(func() {
		os.Unsetenv("JWT_SECRET")
		os.Unsetenv("JWT_REFRESH_SECRET")
	})
}

// newRefreshRouter crea un router de prueba con AuthRefresh y un handler
// que expone los valores del contexto como JSON.
func newRefreshRouter() *gin.Engine {
	r := gin.New()
	r.POST("/refresh", middleware.AuthRefresh(nil), func(c *gin.Context) {
		uid, _ := c.Get("usuario_id")
		tid, _ := c.Get("tenant_id")
		rem, _ := c.Get("remember_me")
		c.JSON(http.StatusOK, gin.H{
			"usuario_id":  uid,
			"tenant_id":   tid,
			"remember_me": rem,
		})
	})
	return r
}

// newAuthRouter crea un router de prueba con Auth(nil).
// Solo sirve para probar paths que abortan antes de consultar DB
// (token ausente, token inválido).
func newAuthRouter() *gin.Engine {
	r := gin.New()
	r.GET("/protegido", middleware.Auth(nil), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})
	return r
}

// ─── AuthRefresh ─────────────────────────────────────────────────────────────

func TestAuthRefresh_NoCookie(t *testing.T) {
	setupEnv(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/refresh", nil)
	newRefreshRouter().ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}

func TestAuthRefresh_InvalidToken(t *testing.T) {
	setupEnv(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh_token", Value: "token.invalido.test"})
	newRefreshRouter().ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}

func TestAuthRefresh_ValidToken_NoRememberMe(t *testing.T) {
	setupEnv(t)
	token, err := utils.GenerarRefreshToken(42, "tenant-test", false)
	if err != nil {
		t.Fatalf("error generando token: %v", err)
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh_token", Value: token})
	newRefreshRouter().ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperaba 200, obtuvo %d — body: %s", w.Code, w.Body.String())
	}

	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("error decodificando respuesta: %v", err)
	}
	if body["usuario_id"] == nil {
		t.Error("usuario_id debe estar seteado en contexto")
	}
	if got := body["tenant_id"]; got != "tenant-test" {
		t.Errorf("tenant_id: esperaba 'tenant-test', obtuvo %v", got)
	}
	if got := body["remember_me"]; got != false {
		t.Errorf("remember_me: esperaba false, obtuvo %v", got)
	}
}

func TestAuthRefresh_ValidToken_RememberMe(t *testing.T) {
	setupEnv(t)
	token, err := utils.GenerarRefreshToken(7, "tenant-rem", true)
	if err != nil {
		t.Fatalf("error generando token: %v", err)
	}

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh_token", Value: token})
	newRefreshRouter().ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperaba 200, obtuvo %d — body: %s", w.Code, w.Body.String())
	}

	var body map[string]interface{}
	json.NewDecoder(w.Body).Decode(&body)
	if got := body["remember_me"]; got != true {
		t.Errorf("remember_me: esperaba true, obtuvo %v", got)
	}
}

// Usar un access token como refresh debe rechazarse (secretos distintos).
func TestAuthRefresh_AccessTokenAsRefresh_Fails(t *testing.T) {
	setupEnv(t)
	accessToken, _ := utils.GenerarAccessToken(1, "tenant-t", "admin", 1)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh_token", Value: accessToken})
	newRefreshRouter().ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}

// ─── Auth (paths sin DB: token ausente o inválido) ───────────────────────────

func TestAuth_NoToken(t *testing.T) {
	setupEnv(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protegido", nil)
	newAuthRouter().ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}

func TestAuth_InvalidCookieToken(t *testing.T) {
	setupEnv(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protegido", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: "token.invalido.aqui"})
	newAuthRouter().ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}

func TestAuth_InvalidBearerToken(t *testing.T) {
	setupEnv(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protegido", nil)
	req.Header.Set("Authorization", "Bearer token.invalido.aqui")
	newAuthRouter().ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}

// Usar un refresh token como access token debe rechazarse (secretos distintos).
func TestAuth_RefreshTokenAsAccess_Fails(t *testing.T) {
	setupEnv(t)
	refreshToken, _ := utils.GenerarRefreshToken(1, "tenant-t", false)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/protegido", nil)
	req.AddCookie(&http.Cookie{Name: "access_token", Value: refreshToken})
	newAuthRouter().ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401, obtuvo %d", w.Code)
	}
}
