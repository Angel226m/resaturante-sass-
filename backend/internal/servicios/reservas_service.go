package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/reservas"
	"github.com/restauflow/backend/internal/repositorios"
)

// ==========================================
// Servicio: Reservas
// ==========================================

type ReservasService struct {
	Repo *repositorios.ReservasRepo
}

func NuevoReservasService(repo *repositorios.ReservasRepo) *ReservasService {
	return &ReservasService{Repo: repo}
}

func (s *ReservasService) ListarReservas(tenantID string, filtros reservas.FiltrosReserva) ([]reservas.Reserva, int, error) {
	return s.Repo.ListarReservas(tenantID, filtros)
}

func (s *ReservasService) ObtenerReserva(tenantID string, id int64) (*reservas.Reserva, error) {
	return s.Repo.ObtenerReserva(tenantID, id)
}

func (s *ReservasService) CrearReserva(tenantID string, req reservas.NuevaReservaRequest) (*reservas.Reserva, error) {
	if req.NumeroPersonas <= 0 {
		return nil, fmt.Errorf("número de personas debe ser mayor a 0")
	}
	// Verificar disponibilidad si se asigna mesa
	if req.MesaID != nil {
		disponibles, err := s.Repo.ConsultarDisponibilidad(tenantID, reservas.DisponibilidadMesaRequest{
			LocalID:        req.LocalID,
			FechaReserva:   req.FechaReserva,
			HoraInicio:     req.HoraInicio,
			HoraFin:        req.HoraFin,
			NumeroPersonas: req.NumeroPersonas,
		})
		if err != nil {
			return nil, err
		}
		mesaEncontrada := false
		for _, mid := range disponibles {
			if mid == *req.MesaID {
				mesaEncontrada = true
				break
			}
		}
		if !mesaEncontrada {
			return nil, fmt.Errorf("la mesa no está disponible para el horario solicitado")
		}
	}
	return s.Repo.CrearReserva(tenantID, req)
}

func (s *ReservasService) CambiarEstadoReserva(tenantID string, id int64, req reservas.CambiarEstadoReservaRequest, usuarioID *int64) error {
	return s.Repo.CambiarEstadoReserva(tenantID, id, req, usuarioID)
}

func (s *ReservasService) ConsultarDisponibilidad(tenantID string, req reservas.DisponibilidadMesaRequest) ([]int, error) {
	return s.Repo.ConsultarDisponibilidad(tenantID, req)
}

func (s *ReservasService) ContarReservasHoy(tenantID string, localID int) (int, error) {
	return s.Repo.ContarReservasHoy(tenantID, localID)
}
