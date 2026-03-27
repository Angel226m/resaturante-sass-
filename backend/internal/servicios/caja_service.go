package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/caja"
	"github.com/restauflow/backend/internal/repositorios"
)

// ==========================================
// Servicio: Caja (Turnos, Métodos Pago, Pagos, Comprobantes)
// ==========================================

type CajaService struct {
	Repo *repositorios.CajaRepo
}

func NuevoCajaService(repo *repositorios.CajaRepo) *CajaService {
	return &CajaService{Repo: repo}
}

// ============ TURNOS CAJA ============

func (s *CajaService) ObtenerTurnoActivo(tenantID string, localID int, usuarioID int64) (*caja.TurnoCaja, error) {
	return s.Repo.ObtenerTurnoActivo(tenantID, localID, usuarioID)
}

func (s *CajaService) AbrirTurno(tenantID string, usuarioID int64, req caja.AbrirTurnoCajaRequest) (*caja.TurnoCaja, error) {
	if req.MontoApertura < 0 {
		return nil, fmt.Errorf("monto de apertura no puede ser negativo")
	}
	return s.Repo.AbrirTurno(tenantID, usuarioID, req)
}

func (s *CajaService) CerrarTurno(tenantID string, turnoID int64, req caja.CerrarTurnoCajaRequest) (*caja.TurnoCaja, error) {
	if req.MontoCierre < 0 {
		return nil, fmt.Errorf("monto de cierre no puede ser negativo")
	}
	return s.Repo.CerrarTurno(tenantID, turnoID, req)
}

func (s *CajaService) ObtenerResumenTurno(tenantID string, turnoID int64) (*caja.ResumenTurnoCaja, error) {
	return s.Repo.ObtenerResumenTurno(tenantID, turnoID)
}

// ============ MÉTODOS DE PAGO ============

func (s *CajaService) ListarMetodosPago(tenantID string, localID int) ([]caja.MetodoPago, error) {
	return s.Repo.ListarMetodosPago(tenantID, localID)
}

func (s *CajaService) CrearMetodoPago(tenantID string, req caja.NuevoMetodoPagoRequest) (*caja.MetodoPago, error) {
	if req.Nombre == "" {
		return nil, fmt.Errorf("nombre es obligatorio")
	}
	return s.Repo.CrearMetodoPago(tenantID, req)
}

// ============ PAGOS ============

func (s *CajaService) CrearPago(tenantID string, turnoID int64, usuarioID int64, req caja.NuevoPagoRequest) (*caja.Pago, error) {
	if len(req.Detalle) == 0 {
		return nil, fmt.Errorf("debe incluir al menos un método de pago")
	}
	return s.Repo.CrearPago(tenantID, turnoID, usuarioID, req)
}

func (s *CajaService) AnularPago(tenantID string, pagoID int64, req caja.AnularPagoRequest) error {
	if req.Motivo == "" {
		return fmt.Errorf("motivo de anulación es obligatorio")
	}
	return s.Repo.AnularPago(tenantID, pagoID, req.Motivo)
}

func (s *CajaService) ListarPagosPorTurno(tenantID string, turnoID int64) ([]caja.Pago, error) {
	return s.Repo.ListarPagosPorTurno(tenantID, turnoID)
}

// ============ COMPROBANTES ============

func (s *CajaService) CrearComprobante(tenantID string, req caja.NuevoComprobanteRequest) (*caja.Comprobante, error) {
	return s.Repo.CrearComprobante(tenantID, req)
}

func (s *CajaService) AnularComprobante(tenantID string, id int64) error {
	return s.Repo.AnularComprobante(tenantID, id)
}
