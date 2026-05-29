package controladores

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restauflow/backend/internal/entidades/auth"
	"github.com/restauflow/backend/internal/middleware"
	"github.com/restauflow/backend/internal/servicios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Controlador: Auth (Login, Registro, Tokens, SuperAdmin)
// ==========================================

type AuthController struct {
	Service *servicios.AuthService
}

func NuevoAuthController(svc *servicios.AuthService) *AuthController {
	return &AuthController{Service: svc}
}

// ---- LOGIN ----

func (c *AuthController) Login(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req auth.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	resp, err := c.Service.Login(tenantID, req)
	if err != nil {
		utils.Unauthorized(ctx, err.Error())
		return
	}
	refreshMaxAge := 3600 // 1 hora
	if req.RememberMe {
		refreshMaxAge = 7 * 24 * 3600 // 7 días
	}
	// Cookies HttpOnly (access: 10 min, refresh: 1h o 7d)
	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie("access_token", resp.AccessToken, 600, "/", "", true, true)
	ctx.SetCookie("refresh_token", resp.RefreshToken, refreshMaxAge, "/api/v1/auth/refresh", "", true, true)

	utils.SuccessResponse(ctx, "login exitoso", resp)
}

func (c *AuthController) LoginPIN(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	var body struct {
		PIN string `json:"pin"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(ctx, "PIN requerido")
		return
	}
	resp, err := c.Service.LoginPIN(tenantID, localID, body.PIN)
	if err != nil {
		utils.Unauthorized(ctx, err.Error())
		return
	}
	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie("access_token", resp.AccessToken, 600, "/", "", true, true)
	ctx.SetCookie("refresh_token", resp.RefreshToken, 3600, "/api/v1/auth/refresh", "", true, true)
	utils.SuccessResponse(ctx, "login PIN exitoso", resp)
}

func (c *AuthController) RefrescarToken(ctx *gin.Context) {
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	tenantID := middleware.ObtenerTenantID(ctx)
	rememberMe, _ := ctx.Get("remember_me")
	remember, _ := rememberMe.(bool)
	resp, err := c.Service.RefrescarToken(usuarioID, tenantID, remember)
	if err != nil {
		utils.Unauthorized(ctx, err.Error())
		return
	}
	refreshMaxAge := 3600
	if remember {
		refreshMaxAge = 7 * 24 * 3600
	}
	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie("access_token", resp.AccessToken, 600, "/", "", true, true)
	ctx.SetCookie("refresh_token", resp.RefreshToken, refreshMaxAge, "/api/v1/auth/refresh", "", true, true)
	utils.SuccessResponse(ctx, "token refrescado", resp)
}

func (c *AuthController) Logout(ctx *gin.Context) {
	ctx.SetCookie("access_token", "", -1, "/", "", true, true)
	ctx.SetCookie("refresh_token", "", -1, "/api/v1/auth/refresh", "", true, true)
	utils.SuccessResponse(ctx, "sesión cerrada", nil)
}

func (c *AuthController) MiPerfil(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	usuarioID := middleware.ObtenerUsuarioID(ctx)
	usuario, err := c.Service.ObtenerUsuario(tenantID, usuarioID)
	if err != nil {
		utils.NotFound(ctx, "usuario no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "perfil obtenido", usuario)
}

// ---- USUARIOS (ADMIN) ----

func (c *AuthController) ListarUsuarios(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	localID := middleware.ObtenerLocalID(ctx)
	pagina, porPagina := obtenerPaginacion(ctx)
	usuarios, total, err := c.Service.ListarUsuarios(tenantID, localID, pagina, porPagina)
	if err != nil {
		utils.InternalError(ctx, "error listando usuarios", err)
		return
	}
	utils.PaginatedResponse(ctx, "usuarios obtenidos", usuarios, total, pagina, porPagina)
}

func (c *AuthController) ObtenerUsuario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	usuario, err := c.Service.ObtenerUsuario(tenantID, id)
	if err != nil {
		utils.NotFound(ctx, "usuario no encontrado")
		return
	}
	utils.SuccessResponse(ctx, "usuario obtenido", usuario)
}

func (c *AuthController) CrearUsuario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var req auth.NuevoUsuarioRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	usuario, err := c.Service.CrearUsuario(tenantID, req)
	if err != nil {
		utils.Conflict(ctx, err.Error())
		return
	}
	utils.CreatedResponse(ctx, "usuario creado", usuario)
}

func (c *AuthController) ActualizarUsuario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	var req auth.ActualizarUsuarioRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	usuario, err := c.Service.ActualizarUsuario(tenantID, id, req)
	if err != nil {
		utils.InternalError(ctx, "error actualizando usuario", err)
		return
	}
	utils.SuccessResponse(ctx, "usuario actualizado", usuario)
}

func (c *AuthController) EliminarUsuario(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	id, err := parseID64(ctx.Param("id"))
	if err != nil {
		utils.BadRequest(ctx, "id inválido")
		return
	}
	if err := c.Service.EliminarUsuario(tenantID, id); err != nil {
		utils.InternalError(ctx, "error eliminando usuario", err)
		return
	}
	utils.NoContent(ctx)
}

// ---- SUPERADMIN ----

func (c *AuthController) LoginSuperAdmin(ctx *gin.Context) {
	var req auth.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	resp, err := c.Service.LoginSuperAdmin(req.Correo, req.Contrasena)
	if err != nil {
		utils.Unauthorized(ctx, err.Error())
		return
	}
	ctx.SetSameSite(http.SameSiteStrictMode)
	ctx.SetCookie("access_token", resp.AccessToken, 600, "/", "", true, true)
	ctx.SetCookie("refresh_token", resp.RefreshToken, 3600, "/api/v1/auth/refresh", "", true, true)
	utils.SuccessResponse(ctx, "login superadmin exitoso", resp)
}

// ---- RECUPERACIÓN ----

func (c *AuthController) SolicitarRecuperacion(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var body struct {
		Correo string `json:"correo"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(ctx, "correo requerido")
		return
	}
	_, err := c.Service.SolicitarRecuperacion(tenantID, body.Correo)
	if err != nil {
		// No revelar si el correo existe
		utils.SuccessResponse(ctx, "si el correo existe, se enviará un enlace de recuperación", nil)
		return
	}
	utils.SuccessResponse(ctx, "si el correo existe, se enviará un enlace de recuperación", nil)
}

func (c *AuthController) RecuperarContrasena(ctx *gin.Context) {
	tenantID := middleware.ObtenerTenantID(ctx)
	var body struct {
		Token           string `json:"token"`
		NuevaContrasena string `json:"nueva_contrasena"`
	}
	if err := ctx.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(ctx, "datos inválidos")
		return
	}
	if err := c.Service.RecuperarContrasena(tenantID, body.Token, body.NuevaContrasena); err != nil {
		utils.BadRequest(ctx, err.Error())
		return
	}
	utils.SuccessResponse(ctx, "contraseña actualizada exitosamente", nil)
}
