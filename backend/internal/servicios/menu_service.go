package servicios

import (
	"fmt"

	"github.com/restauflow/backend/internal/entidades/menu"
	"github.com/restauflow/backend/internal/repositorios"
)

// ==========================================
// Servicio: Menú (Categorías, Productos, Variantes, Modificadores, Combos, Promos, Cupones)
// ==========================================

type MenuService struct {
	Repo *repositorios.MenuRepo
}

func NuevoMenuService(repo *repositorios.MenuRepo) *MenuService {
	return &MenuService{Repo: repo}
}

// ============ CATEGORÍAS ============

func (s *MenuService) ListarCategorias(tenantID string, localID int) ([]menu.CategoriaMenu, error) {
	return s.Repo.ListarCategorias(tenantID, localID)
}

func (s *MenuService) ObtenerCategoria(tenantID string, id int) (*menu.CategoriaMenu, error) {
	return s.Repo.ObtenerCategoria(tenantID, id)
}

func (s *MenuService) CrearCategoria(tenantID string, req menu.NuevaCategoriaMenuRequest) (*menu.CategoriaMenu, error) {
	if req.Nombre == "" {
		return nil, fmt.Errorf("nombre es obligatorio")
	}
	return s.Repo.CrearCategoria(tenantID, req)
}

func (s *MenuService) ActualizarCategoria(tenantID string, id int, req menu.ActualizarCategoriaMenuRequest) error {
	return s.Repo.ActualizarCategoria(tenantID, id, req)
}

func (s *MenuService) EliminarCategoria(tenantID string, id int) error {
	return s.Repo.EliminarCategoria(tenantID, id)
}

// ============ PRODUCTOS ============

func (s *MenuService) ListarProductos(tenantID string, localID int, categoriaID *int) ([]menu.ProductoMenu, error) {
	return s.Repo.ListarProductos(tenantID, localID, categoriaID)
}

func (s *MenuService) ObtenerProducto(tenantID string, id int64) (*menu.ProductoMenu, error) {
	return s.Repo.ObtenerProducto(tenantID, id)
}

func (s *MenuService) CrearProducto(tenantID string, req menu.NuevoProductoMenuRequest) (*menu.ProductoMenu, error) {
	if req.Nombre == "" {
		return nil, fmt.Errorf("nombre es obligatorio")
	}
	if req.PrecioBase < 0 {
		return nil, fmt.Errorf("precio no puede ser negativo")
	}
	return s.Repo.CrearProducto(tenantID, req)
}

func (s *MenuService) ActualizarProducto(tenantID string, id int64, req menu.ActualizarProductoMenuRequest) error {
	return s.Repo.ActualizarProducto(tenantID, id, req)
}

func (s *MenuService) EliminarProducto(tenantID string, id int64) error {
	return s.Repo.EliminarProducto(tenantID, id)
}

func (s *MenuService) CambiarDisponibilidad(tenantID string, id int64, disponible bool) error {
	return s.Repo.CambiarDisponibilidadProducto(tenantID, id, disponible)
}

// ============ VARIANTES ============

func (s *MenuService) ListarVariantes(tenantID string, productoID int64) ([]menu.VarianteProducto, error) {
	return s.Repo.ListarVariantes(tenantID, productoID)
}

func (s *MenuService) CrearVariante(tenantID string, req menu.NuevaVarianteRequest) (*menu.VarianteProducto, error) {
	return s.Repo.CrearVariante(tenantID, req)
}

func (s *MenuService) EliminarVariante(tenantID string, id int64) error {
	return s.Repo.EliminarVariante(tenantID, id)
}

// ============ MODIFICADORES ============

func (s *MenuService) ListarGruposModificadores(tenantID string, localID int) ([]menu.GrupoModificador, error) {
	return s.Repo.ListarGruposModificadores(tenantID, localID)
}

func (s *MenuService) ObtenerGrupoModificador(tenantID string, id int) (*menu.GrupoModificador, error) {
	return s.Repo.ObtenerGrupoModificador(tenantID, id)
}

func (s *MenuService) CrearGrupoModificador(tenantID string, req menu.NuevoGrupoModificadorRequest) (*menu.GrupoModificador, error) {
	return s.Repo.CrearGrupoModificador(tenantID, req)
}

func (s *MenuService) CrearModificador(tenantID string, req menu.NuevoModificadorRequest) (*menu.Modificador, error) {
	return s.Repo.CrearModificador(tenantID, req)
}

func (s *MenuService) AsignarGrupoAProducto(tenantID string, req menu.AsignarGrupoModificadorRequest) error {
	return s.Repo.AsignarGrupoAProducto(tenantID, req)
}

func (s *MenuService) DesasignarGrupoDeProducto(tenantID string, productoID int64, grupoID int) error {
	return s.Repo.DesasignarGrupoDeProducto(tenantID, productoID, grupoID)
}

// ============ COMBOS ============

func (s *MenuService) ListarCombos(tenantID string, localID int) ([]menu.Combo, error) {
	return s.Repo.ListarCombos(tenantID, localID)
}

func (s *MenuService) ObtenerCombo(tenantID string, id int64) (*menu.Combo, error) {
	return s.Repo.ObtenerCombo(tenantID, id)
}

func (s *MenuService) CrearCombo(tenantID string, req menu.NuevoComboRequest) (*menu.Combo, error) {
	if req.Nombre == "" || req.PrecioCombo <= 0 {
		return nil, fmt.Errorf("nombre y precio del combo son obligatorios")
	}
	return s.Repo.CrearCombo(tenantID, req)
}

// ============ PROMOCIONES ============

func (s *MenuService) ListarPromociones(tenantID string, localID int) ([]menu.Promocion, error) {
	return s.Repo.ListarPromociones(tenantID, localID)
}

func (s *MenuService) CrearPromocion(tenantID string, req menu.NuevaPromocionRequest) (*menu.Promocion, error) {
	return s.Repo.CrearPromocion(tenantID, req)
}

// ============ CUPONES ============

func (s *MenuService) ListarCupones(tenantID string, localID int) ([]menu.Cupon, error) {
	return s.Repo.ListarCupones(tenantID, localID)
}

func (s *MenuService) CrearCupon(tenantID string, req menu.NuevoCuponRequest) (*menu.Cupon, error) {
	if req.Codigo == "" {
		return nil, fmt.Errorf("código del cupón es obligatorio")
	}
	return s.Repo.CrearCupon(tenantID, req)
}

func (s *MenuService) ValidarCupon(tenantID string, localID int, req menu.ValidarCuponRequest) (*menu.CuponValidado, error) {
	return s.Repo.ValidarCupon(tenantID, localID, req)
}

func (s *MenuService) IncrementarUsoCupon(tenantID string, cuponID int64) error {
	return s.Repo.IncrementarUsoCupon(tenantID, cuponID)
}

// ============ IMÁGENES ============

func (s *MenuService) AgregarImagen(tenantID string, req menu.NuevaImagenProductoRequest) (*menu.ProductoMenuImagen, error) {
	return s.Repo.AgregarImagenProducto(tenantID, req)
}

func (s *MenuService) EliminarImagen(tenantID string, id int64) error {
	return s.Repo.EliminarImagenProducto(tenantID, id)
}

// ============ HORARIOS ============

func (s *MenuService) ListarHorarios(tenantID string, localID int) ([]menu.MenuHorario, error) {
	return s.Repo.ListarHorarios(tenantID, localID)
}

func (s *MenuService) CrearHorario(tenantID string, req menu.NuevoMenuHorarioRequest) (*menu.MenuHorario, error) {
	return s.Repo.CrearHorario(tenantID, req)
}

func (s *MenuService) EliminarHorario(tenantID string, id int) error {
	return s.Repo.EliminarHorario(tenantID, id)
}
