package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/delivery"
	"github.com/restauflow/backend/internal/repositorios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Servicio: Delivery (Zonas, Órdenes Delivery, Seguimiento)
// ==========================================

type DeliveryService struct {
	Repo *repositorios.DeliveryRepo
}

func NuevoDeliveryService(repo *repositorios.DeliveryRepo) *DeliveryService {
	return &DeliveryService{Repo: repo}
}

// ============ ZONAS ============

func (s *DeliveryService) ListarZonas(tenantID string, localID int) ([]delivery.ZonaDelivery, error) {
	return s.Repo.ListarZonasDelivery(tenantID, localID)
}

func (s *DeliveryService) CrearZona(tenantID string, req delivery.NuevaZonaDeliveryRequest) (*delivery.ZonaDelivery, error) {
	if req.Nombre == "" {
		return nil, fmt.Errorf("nombre es obligatorio")
	}
	return s.Repo.CrearZonaDelivery(tenantID, req)
}

func (s *DeliveryService) ActualizarZona(tenantID string, id int, req delivery.ActualizarZonaDeliveryRequest) (*delivery.ZonaDelivery, error) {
	return s.Repo.ActualizarZonaDelivery(tenantID, id, req)
}

func (s *DeliveryService) EliminarZona(tenantID string, id int) error {
	return s.Repo.EliminarZonaDelivery(tenantID, id)
}

// ============ DELIVERY ÓRDENES ============

func (s *DeliveryService) ListarDeliveryOrdenes(tenantID string, filtros delivery.FiltrosDelivery, pagina, porPagina int) ([]delivery.DeliveryOrden, int, error) {
	return s.Repo.ListarDeliveryOrdenes(tenantID, filtros, pagina, porPagina)
}

func (s *DeliveryService) ObtenerDeliveryOrden(tenantID string, id int64) (*delivery.DeliveryOrden, error) {
	return s.Repo.ObtenerDeliveryOrden(tenantID, id)
}

func (s *DeliveryService) CrearDeliveryOrden(tenantID string, req delivery.NuevoDeliveryOrdenRequest) (*delivery.DeliveryOrden, error) {
	d, err := s.Repo.CrearDeliveryOrden(tenantID, req)
	if err != nil {
		return nil, err
	}
	// Notificar vía WebSocket
	if hub := utils.GetWSHub(); hub != nil {
		hub.PublicarDelivery(tenantID, map[string]interface{}{
			"tipo":        "nuevo_delivery",
			"delivery_id": d.ID,
		})
	}
	return d, nil
}

func (s *DeliveryService) AsignarRepartidor(tenantID string, deliveryID int64, req delivery.AsignarRepartidorRequest) error {
	if err := s.Repo.AsignarRepartidor(tenantID, deliveryID, req); err != nil {
		return err
	}
	if hub := utils.GetWSHub(); hub != nil {
		hub.PublicarDelivery(tenantID, map[string]interface{}{
			"tipo":        "repartidor_asignado",
			"delivery_id": deliveryID,
		})
	}
	return nil
}

func (s *DeliveryService) ActualizarEstado(tenantID string, deliveryID int64, repartidorID int, req delivery.ActualizarEstadoDeliveryRequest) error {
	if err := s.Repo.ActualizarEstadoDelivery(tenantID, deliveryID, repartidorID, req); err != nil {
		return err
	}
	if hub := utils.GetWSHub(); hub != nil {
		hub.PublicarDelivery(tenantID, map[string]interface{}{
			"tipo":        "estado_" + req.EstadoDelivery,
			"delivery_id": deliveryID,
		})
	}
	return nil
}

func (s *DeliveryService) ObtenerSeguimiento(tenantID string, deliveryID int64) ([]delivery.SeguimientoDelivery, error) {
	return s.Repo.ObtenerSeguimiento(tenantID, deliveryID)
}
