package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/plataforma"
	"github.com/restauflow/backend/internal/repositorios"
)

// ==========================================
// Servicio: Plataforma (Planes, Tenants, Suscripciones, Facturas)
// ==========================================

type PlataformaService struct {
	Repo *repositorios.PlataformaRepo
}

func NuevoPlataformaService(repo *repositorios.PlataformaRepo) *PlataformaService {
	return &PlataformaService{Repo: repo}
}

// ============ PLANES ============

func (s *PlataformaService) ListarPlanes() ([]plataforma.Plan, error) {
	return s.Repo.ListarPlanes()
}

func (s *PlataformaService) ObtenerPlan(id int) (*plataforma.Plan, error) {
	return s.Repo.ObtenerPlan(id)
}

func (s *PlataformaService) CrearPlan(req plataforma.NuevoPlanRequest) (*plataforma.Plan, error) {
	return s.Repo.CrearPlan(req)
}

func (s *PlataformaService) ActualizarPlan(id int, req plataforma.ActualizarPlanRequest) (*plataforma.Plan, error) {
	return s.Repo.ActualizarPlan(id, req)
}

func (s *PlataformaService) EliminarPlan(id int) error {
	return s.Repo.EliminarPlan(id)
}

// ============ TENANTS ============

func (s *PlataformaService) ListarTenants(pagina, porPagina int) ([]plataforma.Tenant, int, error) {
	return s.Repo.ListarTenants(pagina, porPagina)
}

func (s *PlataformaService) ObtenerTenant(id string) (*plataforma.Tenant, error) {
	return s.Repo.ObtenerTenant(id)
}

func (s *PlataformaService) CrearTenantConSuscripcion(req plataforma.NuevoTenantRequest) (*plataforma.Tenant, error) {
	if req.Nombre == "" || req.Slug == "" {
		return nil, fmt.Errorf("nombre y slug son obligatorios")
	}
	return s.Repo.CrearTenantConSuscripcion(req, req.PlanID)
}

func (s *PlataformaService) ActualizarTenant(id string, req plataforma.ActualizarTenantRequest) (*plataforma.Tenant, error) {
	return s.Repo.ActualizarTenant(id, req)
}

func (s *PlataformaService) EliminarTenant(id string) error {
	return s.Repo.EliminarTenant(id)
}

// ============ SUSCRIPCIONES ============

func (s *PlataformaService) ObtenerSuscripcionActiva(tenantID string) (*plataforma.Suscripcion, error) {
	return s.Repo.ObtenerSuscripcionActiva(tenantID)
}

func (s *PlataformaService) CambiarPlan(tenantID string, req plataforma.CambiarPlanRequest) error {
	return s.Repo.CambiarPlan(tenantID, req)
}

// ============ FACTURAS ============

func (s *PlataformaService) ListarFacturas(tenantID string, pagina, porPagina int) ([]plataforma.FacturaPlataforma, int, error) {
	return s.Repo.ListarFacturas(tenantID, pagina, porPagina)
}
