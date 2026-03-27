package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/ordenes"
	"github.com/restauflow/backend/internal/repositorios"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Servicio: Órdenes (Órdenes, Items, Tickets Cocina)
// ==========================================

type OrdenesService struct {
	Repo *repositorios.OrdenesRepo
}

func NuevoOrdenesService(repo *repositorios.OrdenesRepo) *OrdenesService {
	return &OrdenesService{Repo: repo}
}

// ============ ÓRDENES ============

func (s *OrdenesService) ListarOrdenes(tenantID string, filtros ordenes.FiltrosOrden) ([]ordenes.Orden, int, error) {
	return s.Repo.ListarOrdenes(tenantID, filtros)
}

func (s *OrdenesService) ObtenerOrden(tenantID string, id int64) (*ordenes.Orden, error) {
	return s.Repo.ObtenerOrden(tenantID, id)
}

func (s *OrdenesService) CrearOrden(tenantID string, meseroID int64, req ordenes.NuevaOrdenRequest) (*ordenes.Orden, error) {
	if len(req.Items) == 0 {
		return nil, fmt.Errorf("la orden debe tener al menos un item")
	}
	orden, err := s.Repo.CrearOrden(tenantID, meseroID, req)
	if err != nil {
		return nil, err
	}

	// Publicar a cocina vía WebSocket
	hub := utils.GetWSHub()
	hub.PublicarOrdenCocina(tenantID, req.LocalID, map[string]interface{}{
		"tipo":         "nueva_orden",
		"numero_orden": orden.NumeroOrden,
		"orden_id":     orden.ID,
	})

	// Si es orden de salón, actualizar estado de la mesa
	if req.TipoOrden == "mesa" && req.MesaID != nil {
		hub.PublicarEstadoMesa(tenantID, req.LocalID, map[string]interface{}{
			"mesa_id": *req.MesaID,
			"estado":  "ocupada",
		})
	}

	return orden, nil
}

func (s *OrdenesService) CambiarEstadoOrden(tenantID string, id int64, req ordenes.CambiarEstadoOrdenRequest, usuarioID int64) error {
	err := s.Repo.CambiarEstadoOrden(tenantID, id, req, usuarioID)
	if err != nil {
		return err
	}

	// Notificar vía WebSocket
	orden, _ := s.Repo.ObtenerOrden(tenantID, id)
	if orden != nil {
		utils.GetWSHub().PublicarOrdenCocina(tenantID, orden.LocalID, map[string]interface{}{
			"tipo":         "estado_" + req.Estado,
			"numero_orden": orden.NumeroOrden,
			"orden_id":     orden.ID,
		})
	}
	return nil
}

func (s *OrdenesService) AgregarItemOrden(tenantID string, ordenID int64, req ordenes.NuevoItemOrdenReq) error {
	return s.Repo.AgregarItemOrden(tenantID, ordenID, req)
}

func (s *OrdenesService) ContarOrdenesActivas(tenantID string, localID int) (int, error) {
	return s.Repo.ContarOrdenesActivas(tenantID, localID)
}

// ============ TICKETS COCINA ============

func (s *OrdenesService) ListarTicketsCocina(tenantID string, filtros ordenes.FiltrosTicketCocina) ([]ordenes.TicketCocina, error) {
	return s.Repo.ListarTicketsCocina(tenantID, filtros)
}

func (s *OrdenesService) CrearTicketCocina(tenantID string, ordenID int64, estacion string, prioridad int) (*ordenes.TicketCocina, error) {
	return s.Repo.CrearTicketCocina(tenantID, ordenID, estacion, prioridad)
}

func (s *OrdenesService) CambiarEstadoTicket(tenantID string, id int64, req ordenes.CambiarEstadoTicketRequest) error {
	err := s.Repo.CambiarEstadoTicket(tenantID, id, req)
	if err != nil {
		return err
	}
	// Notificar pantalla de cocina
	utils.GetWSHub().Publicar(
		fmt.Sprintf("cocina:%s", tenantID),
		"ticket_estado",
		map[string]interface{}{
			"ticket_id": id,
			"estado":    req.Estado,
		},
	)
	return nil
}
