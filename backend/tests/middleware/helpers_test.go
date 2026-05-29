package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/middleware"
)

// ==========================================
// Tests: Middleware — Context Helpers, HTTPS, Role, AuthSuperAdmin
// ==========================================

// --- Context Helpers ---
func TestObtenerUsuarioID_Valid(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("usuario_id", int64(42))

	id := middleware.ObtenerUsuarioID(c)
	if id != 42 {
		t.Errorf("esperaba 42, obtuvo %d", id)
	}
}

func TestObtenerUsuarioID_NotSet(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	id := middleware.ObtenerUsuarioID(c)
	if id != 0 {
		t.Errorf("esperaba 0 cuando no está seteado, obtuvo %d", id)
	}
}

func TestObtenerUsuarioID_WrongType(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("usuario_id", "not-int64")

	id := middleware.ObtenerUsuarioID(c)
	if id != 0 {
		t.Errorf("esperaba 0 para tipo incorrecto, obtuvo %d", id)
	}
}

func TestObtenerTenantID_Valid(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("tenant_id", "tenant-uuid-123")

	tid := middleware.ObtenerTenantID(c)
	if tid != "tenant-uuid-123" {
		t.Errorf("esperaba 'tenant-uuid-123', obtuvo %q", tid)
	}
}

func TestObtenerTenantID_NotSet(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	tid := middleware.ObtenerTenantID(c)
	if tid != "" {
		t.Errorf("esperaba vacío, obtuvo %q", tid)
	}
}

func TestObtenerRol_Valid(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("rol", "ADMIN")

	rol := middleware.ObtenerRol(c)
	if rol != "ADMIN" {
		t.Errorf("esperaba 'ADMIN', obtuvo %q", rol)
	}
}

func TestObtenerRol_NotSet(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	rol := middleware.ObtenerRol(c)
	if rol != "" {
		t.Errorf("esperaba vacío, obtuvo %q", rol)
	}
}

func TestObtenerLocalID_Valid(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("local_id", 5)

	lid := middleware.ObtenerLocalID(c)
	if lid != 5 {
		t.Errorf("esperaba 5, obtuvo %d", lid)
	}
}

func TestObtenerSuperAdminID_Valid(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("superadmin_id", 1)

	said := middleware.ObtenerSuperAdminID(c)
	if said != 1 {
		t.Errorf("esperaba 1, obtuvo %d", said)
	}
}

func TestObtenerNivelSuperAdmin_Valid(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set("nivel", "superadmin")

	nivel := middleware.ObtenerNivelSuperAdmin(c)
	if nivel != "superadmin" {
		t.Errorf("esperaba 'superadmin', obtuvo %q", nivel)
	}
}

// --- RequireHTTPS ---
func TestRequireHTTPS_HttpForwarded(t *testing.T) {
	w := httptest.NewRecorder()
	c, r := gin.CreateTestContext(w)

	r.Use(middleware.RequireHTTPS())
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Forwarded-Proto", "http")
	req.Host = "example.com"
	c.Request = req

	r.ServeHTTP(w, req)

	if w.Code != http.StatusMovedPermanently {
		t.Errorf("esperaba 301, obtuvo %d", w.Code)
	}
}

func TestRequireHTTPS_HttpsForwarded(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(middleware.RequireHTTPS())
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("X-Forwarded-Proto", "https")

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperaba 200, obtuvo %d", w.Code)
	}
}

func TestRequireHTTPS_NoHeader(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(middleware.RequireHTTPS())
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperaba 200 sin header, obtuvo %d", w.Code)
	}
}

// --- Role middleware ---
func TestRole_AllowedRole(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(func(c *gin.Context) {
		c.Set("rol", "ADMIN")
		c.Next()
	})
	r.Use(middleware.RequiereRol("ADMIN", "OWNER"))
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("esperaba 200 para rol permitido, obtuvo %d", w.Code)
	}
}

func TestRole_DeniedRole(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(func(c *gin.Context) {
		c.Set("rol", "MESERO")
		c.Next()
	})
	r.Use(middleware.RequiereRol("ADMIN", "OWNER"))
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("esperaba 403 para rol no permitido, obtuvo %d", w.Code)
	}
}

func TestRole_NoRolSet(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(middleware.RequiereRol("ADMIN"))
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized && w.Code != http.StatusForbidden {
		t.Errorf("esperaba 401 o 403 sin rol, obtuvo %d", w.Code)
	}
}

// --- AuthSuperAdmin ---
func TestAuthSuperAdmin_NoToken(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(middleware.AuthSuperAdmin(nil))
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401 sin token SA, obtuvo %d", w.Code)
	}
}

// --- AuthRefresh (no cookie) ---
func TestAuthRefresh_NoToken(t *testing.T) {
	w := httptest.NewRecorder()
	_, r := gin.CreateTestContext(w)

	r.Use(middleware.AuthRefresh(nil))
	r.GET("/test", func(c *gin.Context) {
		c.String(200, "OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("esperaba 401 sin refresh, obtuvo %d", w.Code)
	}
}
