package servicios

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/restauflow/backend/internal/entidades/auth"
	"github.com/restauflow/backend/internal/repositorios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Servicio: Auth (Login, Registro, Tokens, SuperAdmin)
// ==========================================

type AuthService struct {
	Repo *repositorios.AuthRepo
}

func NuevoAuthService(repo *repositorios.AuthRepo) *AuthService {
	return &AuthService{Repo: repo}
}

// ============ LOGIN ============

func (s *AuthService) Login(tenantID string, req auth.LoginRequest) (*auth.LoginResponse, error) {
	usuario, hash, err := s.Repo.ObtenerUsuarioPorCorreo(tenantID, req.Correo)
	if err != nil {
		return nil, fmt.Errorf("credenciales inválidas")
	}
	if !usuario.Activo {
		return nil, fmt.Errorf("usuario inactivo")
	}

	if !utils.CheckPasswordHash(req.Contrasena, hash) {
		return nil, fmt.Errorf("credenciales inválidas")
	}

	localID := 0
	if usuario.LocalID != nil {
		localID = *usuario.LocalID
	}

	accessToken, err := utils.GenerarAccessToken(usuario.ID, tenantID, usuario.Rol, localID)
	if err != nil {
		return nil, fmt.Errorf("error generando token de acceso")
	}
	refreshToken, err := utils.GenerarRefreshToken(usuario.ID, tenantID, req.RememberMe)
	if err != nil {
		return nil, fmt.Errorf("error generando token de refresco")
	}

	s.Repo.ActualizarUltimoLogin(tenantID, int64(usuario.ID))

	return &auth.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Usuario:      usuario,
	}, nil
}

func (s *AuthService) LoginPIN(tenantID string, localID int, pin string) (*auth.LoginResponse, error) {
	usuario, err := s.Repo.ObtenerUsuarioPorPin(tenantID, localID, pin)
	if err != nil {
		return nil, fmt.Errorf("PIN inválido")
	}
	if !usuario.Activo {
		return nil, fmt.Errorf("usuario inactivo")
	}

	lid := 0
	if usuario.LocalID != nil {
		lid = *usuario.LocalID
	}

	accessToken, _ := utils.GenerarAccessToken(usuario.ID, tenantID, usuario.Rol, lid)
	refreshToken, _ := utils.GenerarRefreshToken(usuario.ID, tenantID, false)

	s.Repo.ActualizarUltimoLogin(tenantID, int64(usuario.ID))

	return &auth.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Usuario:      usuario,
	}, nil
}

func (s *AuthService) RefrescarToken(usuarioID int64, tenantID string) (*auth.LoginResponse, error) {
	usuario, err := s.Repo.ObtenerUsuarioPorID(tenantID, usuarioID)
	if err != nil {
		return nil, fmt.Errorf("usuario no encontrado")
	}

	localID := 0
	if usuario.LocalID != nil {
		localID = *usuario.LocalID
	}

	accessToken, _ := utils.GenerarAccessToken(usuario.ID, tenantID, usuario.Rol, localID)
	refreshToken, _ := utils.GenerarRefreshToken(usuario.ID, tenantID, false)

	return &auth.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Usuario:      usuario,
	}, nil
}

// ============ USUARIOS ============

func (s *AuthService) ListarUsuarios(tenantID string, localID int, pagina, porPagina int) ([]auth.Usuario, int, error) {
	return s.Repo.ListarUsuarios(tenantID, localID, pagina, porPagina)
}

func (s *AuthService) ObtenerUsuario(tenantID string, id int64) (*auth.Usuario, error) {
	return s.Repo.ObtenerUsuarioPorID(tenantID, id)
}

func (s *AuthService) CrearUsuario(tenantID string, req auth.NuevoUsuarioRequest) (*auth.Usuario, error) {
	if err := utils.ValidarCorreo(req.Correo); err != nil {
		return nil, err
	}
	if err := utils.ValidarContrasena(req.Contrasena); err != nil {
		return nil, err
	}
	if err := utils.ValidarRol(req.Rol); err != nil {
		return nil, err
	}

	// Verificar unicidad por correo
	_, _, err := s.Repo.ObtenerUsuarioPorCorreo(tenantID, req.Correo)
	if err == nil {
		return nil, fmt.Errorf("ya existe un usuario con ese correo")
	}
	if err != sql.ErrNoRows {
		// Otro error inesperado — ignoramos ya que ErrNoRows = correo libre
	}

	return s.Repo.CrearUsuario(tenantID, req)
}

func (s *AuthService) ActualizarUsuario(tenantID string, id int64, req auth.ActualizarUsuarioRequest) (*auth.Usuario, error) {
	return s.Repo.ActualizarUsuario(tenantID, id, req)
}

func (s *AuthService) EliminarUsuario(tenantID string, id int64) error {
	return s.Repo.EliminarUsuario(tenantID, id)
}

func (s *AuthService) ContarUsuarios(tenantID string) (int, error) {
	return s.Repo.ContarUsuariosPorTenant(tenantID)
}

// ============ SUPERADMIN ============

func (s *AuthService) LoginSuperAdmin(correo, contrasena string) (*auth.LoginResponse, error) {
	sa, hash, err := s.Repo.ObtenerSuperAdminPorCorreo(correo)
	if err != nil {
		return nil, fmt.Errorf("credenciales inválidas")
	}
	if !sa.Activo {
		return nil, fmt.Errorf("superadmin inactivo")
	}

	if !utils.CheckPasswordHash(contrasena, hash) {
		return nil, fmt.Errorf("credenciales inválidas")
	}

	accessToken, _ := utils.GenerarAccessTokenSuperAdmin(sa.ID, sa.Nivel)
	refreshToken, _ := utils.GenerarRefreshTokenSuperAdmin(sa.ID)

	// Construir usuario virtual para la respuesta
	saUsuario := &auth.Usuario{
		ID:     sa.ID,
		Nombre: sa.Nombre,
		Correo: sa.Correo,
		Rol:    "superadmin",
	}

	return &auth.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Usuario:      saUsuario,
	}, nil
}

// ============ RECUPERACIÓN ============

func (s *AuthService) SolicitarRecuperacion(tenantID string, correo string) (string, error) {
	usuario, _, err := s.Repo.ObtenerUsuarioPorCorreo(tenantID, correo)
	if err != nil {
		return "", fmt.Errorf("correo no registrado")
	}

	// Generar token aleatorio
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", fmt.Errorf("error generando token")
	}
	token := hex.EncodeToString(tokenBytes)
	expira := time.Now().Add(1 * time.Hour)

	if err := s.Repo.CrearTokenRecuperacion(tenantID, int64(usuario.ID), token, expira); err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) RecuperarContrasena(tenantID string, token string, nuevaContrasena string) error {
	if err := utils.ValidarContrasena(nuevaContrasena); err != nil {
		return err
	}

	tokenRec, err := s.Repo.ValidarTokenRecuperacion(tenantID, token)
	if err != nil {
		return fmt.Errorf("token inválido o expirado")
	}

	if tokenRec.UsuarioID == nil {
		return fmt.Errorf("token sin usuario asociado")
	}

	hash, err := utils.HashPassword(nuevaContrasena)
	if err != nil {
		return err
	}

	return s.Repo.CambiarContrasena(tenantID, int64(*tokenRec.UsuarioID), hash)
}
