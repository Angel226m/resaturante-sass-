package servicios

import (
	"github.com/restauflow/backend/internal/entidades/reportes"
	"github.com/restauflow/backend/internal/repositorios"
)

// ==========================================
// Servicio: Reportes (Resumen Diario, Alertas, Audit Log, Dashboard)
// ==========================================

type ReportesService struct {
	Repo *repositorios.ReportesRepo
}

func NuevoReportesService(repo *repositorios.ReportesRepo) *ReportesService {
	return &ReportesService{Repo: repo}
}

// ============ RESUMEN DIARIO ============

func (s *ReportesService) ObtenerResumenDiario(tenantID string, localID int, fecha string) (*reportes.ResumenDiario, error) {
	return s.Repo.ObtenerResumenDiario(tenantID, localID, fecha)
}

func (s *ReportesService) ListarResumenes(tenantID string, localID int, filtros reportes.FiltrosResumenDiario, pagina, porPagina int) ([]reportes.ResumenDiario, int, error) {
	return s.Repo.ListarResumenesDiarios(tenantID, localID, filtros, pagina, porPagina)
}

func (s *ReportesService) GenerarResumenDiario(tenantID string, localID int, fecha string) (*reportes.ResumenDiario, error) {
	return s.Repo.GenerarResumenDiario(tenantID, localID, fecha)
}

// ============ AUDIT LOG ============

func (s *ReportesService) ListarAuditLog(tenantID string, filtros reportes.FiltrosAuditLog, pagina, porPagina int) ([]reportes.AuditLog, int, error) {
	return s.Repo.ListarAuditLog(tenantID, filtros, pagina, porPagina)
}

func (s *ReportesService) RegistrarAuditLog(tenantID string, usuarioID int64, accion, tabla, registroID string, datosAnt, datosNuevos, ip, ua string) error {
	return s.Repo.RegistrarAuditLog(tenantID, usuarioID, accion, tabla, registroID, datosAnt, datosNuevos, ip, ua)
}

// ============ DASHBOARD ============

func (s *ReportesService) ObtenerDashboard(tenantID string, localID int) (*reportes.DashboardResumen, error) {
	return s.Repo.ObtenerDashboard(tenantID, localID)
}
