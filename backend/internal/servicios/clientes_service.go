package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/clientes"
	"github.com/restauflow/backend/internal/repositorios"
)

// ==========================================
// Servicio: Clientes (Clientes, Direcciones)
// ==========================================

type ClientesService struct {
	Repo *repositorios.ClientesRepo
}

func NuevoClientesService(repo *repositorios.ClientesRepo) *ClientesService {
	return &ClientesService{Repo: repo}
}

// ============ CLIENTES ============

func (s *ClientesService) ListarClientes(tenantID string, localID int, pagina, porPagina int) ([]clientes.Cliente, int, error) {
	return s.Repo.ListarClientes(tenantID, localID, pagina, porPagina)
}

func (s *ClientesService) ObtenerCliente(tenantID string, id int64) (*clientes.Cliente, error) {
	return s.Repo.ObtenerCliente(tenantID, id)
}

func (s *ClientesService) CrearCliente(tenantID string, req clientes.NuevoClienteRequest) (*clientes.Cliente, error) {
	if req.Nombres == "" {
		return nil, fmt.Errorf("nombres es obligatorio")
	}
	return s.Repo.CrearCliente(tenantID, req)
}

func (s *ClientesService) ActualizarCliente(tenantID string, id int64, req clientes.ActualizarClienteRequest) error {
	return s.Repo.ActualizarCliente(tenantID, id, req)
}

func (s *ClientesService) EliminarCliente(tenantID string, id int64) error {
	return s.Repo.EliminarCliente(tenantID, id)
}

func (s *ClientesService) BuscarClientes(tenantID string, req clientes.BuscarClienteRequest) ([]clientes.Cliente, int, error) {
	if len(req.Termino) < 2 {
		return nil, 0, fmt.Errorf("búsqueda debe tener al menos 2 caracteres")
	}
	return s.Repo.BuscarClientes(tenantID, req)
}

func (s *ClientesService) RegistrarVisita(tenantID string, clienteID int64) error {
	return s.Repo.RegistrarVisita(tenantID, clienteID)
}

func (s *ClientesService) ActualizarTotalCompras(tenantID string, clienteID int64, monto float64) error {
	return s.Repo.ActualizarTotalCompras(tenantID, clienteID, monto)
}

// ============ DIRECCIONES ============

func (s *ClientesService) CrearDireccion(tenantID string, req clientes.NuevaDireccionClienteRequest) (*clientes.DireccionCliente, error) {
	return s.Repo.CrearDireccion(tenantID, req)
}

func (s *ClientesService) EliminarDireccion(tenantID string, id int64) error {
	return s.Repo.EliminarDireccion(tenantID, id)
}
