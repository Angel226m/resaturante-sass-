package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/local"
	"github.com/restauflow/backend/internal/repositorios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Servicio: Local (Locales, Zonas, Mesas, Configuración)
// ==========================================

type LocalService struct {
	Repo *repositorios.LocalRepo
}

func NuevoLocalService(repo *repositorios.LocalRepo) *LocalService {
	return &LocalService{Repo: repo}
}

// ============ LOCALES ============

func (s *LocalService) ListarLocales(tenantID string) ([]local.Local, error) {
	return s.Repo.ListarLocales(tenantID)
}

func (s *LocalService) ObtenerLocal(tenantID string, id int) (*local.Local, error) {
	return s.Repo.ObtenerLocal(tenantID, id)
}

func (s *LocalService) CrearLocal(tenantID string, req local.NuevoLocalRequest) (*local.Local, error) {
	if req.Nombre == "" {
		return nil, fmt.Errorf("nombre es obligatorio")
	}
	l, err := s.Repo.CrearLocal(tenantID, req)
	if err != nil {
		return nil, err
	}
	// Crear configuración por defecto
	s.Repo.CrearConfiguracionDefault(tenantID, l.ID)
	return l, nil
}

func (s *LocalService) ContarLocales(tenantID string) (int, error) {
	return s.Repo.ContarLocales(tenantID)
}

func (s *LocalService) EliminarLocal(tenantID string, id int) error {
	return s.Repo.EliminarLocal(tenantID, id)
}

func (s *LocalService) ActualizarLocal(tenantID string, id int, req local.ActualizarLocalRequest) error {
	return s.Repo.ActualizarLocal(tenantID, id, req)
}

// ============ ZONAS ============

func (s *LocalService) ListarZonas(tenantID string, localID int) ([]local.Zona, error) {
	return s.Repo.ListarZonas(tenantID, localID)
}

func (s *LocalService) CrearZona(tenantID string, req local.NuevaZonaRequest) (*local.Zona, error) {
	return s.Repo.CrearZona(tenantID, req)
}

func (s *LocalService) ActualizarZona(tenantID string, id int, req local.ActualizarZonaRequest) error {
	return s.Repo.ActualizarZona(tenantID, id, req)
}

func (s *LocalService) EliminarZona(tenantID string, id int) error {
	return s.Repo.EliminarZona(tenantID, id)
}

// ============ MESAS ============

func (s *LocalService) ListarMesas(tenantID string, localID int) ([]local.Mesa, error) {
	return s.Repo.ListarMesas(tenantID, localID)
}

func (s *LocalService) ObtenerMesa(tenantID string, id int) (*local.Mesa, error) {
	return s.Repo.ObtenerMesa(tenantID, id)
}

func (s *LocalService) CrearMesa(tenantID string, req local.NuevaMesaRequest) (*local.Mesa, error) {
	mesa, err := s.Repo.CrearMesa(tenantID, req)
	if err != nil {
		return nil, err
	}
	// Generar QR para la mesa
	contenido, _, _ := utils.GenerarQRMesa(tenantID, mesa.LocalID, mesa.ID)
	if contenido != "" {
		mesa.QRCodigo = contenido
	}
	return mesa, nil
}

func (s *LocalService) CambiarEstadoMesa(tenantID string, id int, req local.CambiarEstadoMesaRequest) error {
	return s.Repo.CambiarEstadoMesa(tenantID, id, req.Estado)
}

func (s *LocalService) ActualizarMesa(tenantID string, id int, req local.ActualizarMesaRequest) error {
	return s.Repo.ActualizarMesa(tenantID, id, req)
}

func (s *LocalService) EliminarMesa(tenantID string, id int) error {
	return s.Repo.EliminarMesa(tenantID, id)
}

// ============ CONFIGURACIÓN ============

func (s *LocalService) ObtenerConfiguracion(tenantID string, localID int) (*local.ConfiguracionRestaurante, error) {
	return s.Repo.ObtenerConfiguracion(tenantID, localID)
}

func (s *LocalService) ActualizarConfiguracion(tenantID string, localID int, req local.ActualizarConfiguracionRequest) error {
	return s.Repo.ActualizarConfiguracion(tenantID, localID, req)
}
