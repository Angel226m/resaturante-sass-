package repositorios

import (
	"database/sql"
	"fmt"

	"github.com/restauflow/backend/internal/entidades/menu"
)

// ==========================================
// Repositorio: Menú completo
// Categorías, Productos, Variantes, Modificadores,
// Combos, Promociones, Cupones, Horarios, Imágenes
// ==========================================

type MenuRepo struct {
	DB *sql.DB
}

func NuevoMenuRepo(db *sql.DB) *MenuRepo {
	return &MenuRepo{DB: db}
}

// ============ CATEGORÍAS MENÚ ============

func (r *MenuRepo) ListarCategorias(tenantID string, localID int) ([]menu.CategoriaMenu, error) {
	rows, err := r.DB.Query(`
		SELECT c.id, c.tenant_id, c.local_id, c.nombre, c.descripcion, c.icono, c.color, c.orden,
			   c.activo, c.deleted_at, c.created_at,
			   (SELECT COUNT(*) FROM productos_menu p WHERE p.categoria_menu_id = c.id AND p.deleted_at IS NULL) as cantidad_productos
		FROM categorias_menu c
		WHERE c.tenant_id = $1 AND c.local_id = $2 AND c.deleted_at IS NULL
		ORDER BY c.orden, c.nombre
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categorias []menu.CategoriaMenu
	for rows.Next() {
		var c menu.CategoriaMenu
		err := rows.Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombre, &c.Descripcion,
			&c.Icono, &c.Color, &c.Orden, &c.Activo, &c.DeletedAt, &c.CreatedAt,
			&c.CantidadProductos)
		if err != nil {
			return nil, err
		}
		categorias = append(categorias, c)
	}
	return categorias, nil
}

func (r *MenuRepo) ObtenerCategoria(tenantID string, id int) (*menu.CategoriaMenu, error) {
	var c menu.CategoriaMenu
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, nombre, descripcion, icono, color, orden,
			   activo, deleted_at, created_at
		FROM categorias_menu WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
	`, id, tenantID).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombre, &c.Descripcion,
		&c.Icono, &c.Color, &c.Orden, &c.Activo, &c.DeletedAt, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *MenuRepo) CrearCategoria(tenantID string, req menu.NuevaCategoriaMenuRequest) (*menu.CategoriaMenu, error) {
	var c menu.CategoriaMenu
	err := r.DB.QueryRow(`
		INSERT INTO categorias_menu (tenant_id, local_id, nombre, descripcion, icono, color, orden)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, tenant_id, local_id, nombre, descripcion, icono, color, orden, activo, deleted_at, created_at
	`, tenantID, req.LocalID, req.Nombre, req.Descripcion, req.Icono, req.Color, req.Orden,
	).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombre, &c.Descripcion,
		&c.Icono, &c.Color, &c.Orden, &c.Activo, &c.DeletedAt, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *MenuRepo) ActualizarCategoria(tenantID string, id int, req menu.ActualizarCategoriaMenuRequest) error {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1
	if req.Nombre != "" {
		setClauses += fmt.Sprintf("nombre = $%d, ", argIdx)
		args = append(args, req.Nombre)
		argIdx++
	}
	if req.Descripcion != "" {
		setClauses += fmt.Sprintf("descripcion = $%d, ", argIdx)
		args = append(args, req.Descripcion)
		argIdx++
	}
	if req.Icono != "" {
		setClauses += fmt.Sprintf("icono = $%d, ", argIdx)
		args = append(args, req.Icono)
		argIdx++
	}
	if req.Color != "" {
		setClauses += fmt.Sprintf("color = $%d, ", argIdx)
		args = append(args, req.Color)
		argIdx++
	}
	if req.Orden != nil {
		setClauses += fmt.Sprintf("orden = $%d, ", argIdx)
		args = append(args, *req.Orden)
		argIdx++
	}
	if req.Activo != nil {
		setClauses += fmt.Sprintf("activo = $%d, ", argIdx)
		args = append(args, *req.Activo)
		argIdx++
	}
	if len(args) == 0 {
		return nil
	}
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE categorias_menu SET %supdated_at = NOW() WHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		setClauses, argIdx, argIdx+1)
	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *MenuRepo) EliminarCategoria(tenantID string, id int) error {
	_, err := r.DB.Exec(
		"UPDATE categorias_menu SET deleted_at = NOW(), activo = false WHERE id = $1 AND tenant_id = $2",
		id, tenantID)
	return err
}

// ============ PRODUCTOS MENÚ ============

func (r *MenuRepo) ListarProductos(tenantID string, localID int, categoriaID *int) ([]menu.ProductoMenu, error) {
	query := `
		SELECT p.id, p.tenant_id, p.local_id, p.categoria_menu_id, p.nombre, p.descripcion,
			   p.precio_base, p.imagen_url, p.tiempo_preparacion, p.calorias, p.alergenos,
			   p.es_vegetariano, p.es_vegano, p.es_gluten_free, p.es_popular, p.es_nuevo,
			   p.disponible, p.orden, p.activo, p.deleted_at, p.created_at, p.updated_at,
			   COALESCE(c.nombre, '') as nombre_categoria
		FROM productos_menu p
		LEFT JOIN categorias_menu c ON c.id = p.categoria_menu_id AND c.tenant_id = p.tenant_id
		WHERE p.tenant_id = $1 AND p.local_id = $2 AND p.deleted_at IS NULL`
	args := []interface{}{tenantID, localID}
	if categoriaID != nil {
		query += " AND p.categoria_menu_id = $3"
		args = append(args, *categoriaID)
	}
	query += " ORDER BY p.orden, p.nombre"

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var productos []menu.ProductoMenu
	for rows.Next() {
		var p menu.ProductoMenu
		err := rows.Scan(
			&p.ID, &p.TenantID, &p.LocalID, &p.CategoriaMenuID, &p.Nombre, &p.Descripcion,
			&p.PrecioBase, &p.ImagenURL, &p.TiempoPreparacion, &p.Calorias, &p.Alergenos,
			&p.EsVegetariano, &p.EsVegano, &p.EsGlutenFree, &p.EsPopular, &p.EsNuevo,
			&p.Disponible, &p.Orden, &p.Activo, &p.DeletedAt, &p.CreatedAt, &p.UpdatedAt,
			&p.NombreCategoria,
		)
		if err != nil {
			return nil, err
		}
		productos = append(productos, p)
	}
	return productos, nil
}

func (r *MenuRepo) ObtenerProducto(tenantID string, id int64) (*menu.ProductoMenu, error) {
	var p menu.ProductoMenu
	err := r.DB.QueryRow(`
		SELECT p.id, p.tenant_id, p.local_id, p.categoria_menu_id, p.nombre, p.descripcion,
			   p.precio_base, p.imagen_url, p.tiempo_preparacion, p.calorias, p.alergenos,
			   p.es_vegetariano, p.es_vegano, p.es_gluten_free, p.es_popular, p.es_nuevo,
			   p.disponible, p.orden, p.activo, p.deleted_at, p.created_at, p.updated_at,
			   COALESCE(c.nombre, '') as nombre_categoria
		FROM productos_menu p
		LEFT JOIN categorias_menu c ON c.id = p.categoria_menu_id AND c.tenant_id = p.tenant_id
		WHERE p.id = $1 AND p.tenant_id = $2 AND p.deleted_at IS NULL
	`, id, tenantID).Scan(
		&p.ID, &p.TenantID, &p.LocalID, &p.CategoriaMenuID, &p.Nombre, &p.Descripcion,
		&p.PrecioBase, &p.ImagenURL, &p.TiempoPreparacion, &p.Calorias, &p.Alergenos,
		&p.EsVegetariano, &p.EsVegano, &p.EsGlutenFree, &p.EsPopular, &p.EsNuevo,
		&p.Disponible, &p.Orden, &p.Activo, &p.DeletedAt, &p.CreatedAt, &p.UpdatedAt,
		&p.NombreCategoria,
	)
	if err != nil {
		return nil, err
	}

	// Cargar imágenes
	imgRows, err := r.DB.Query(`
		SELECT id, tenant_id, producto_menu_id, url, alt_texto, orden, es_principal, created_at
		FROM producto_menu_imagenes WHERE producto_menu_id = $1 AND tenant_id = $2 ORDER BY orden
	`, id, tenantID)
	if err == nil {
		defer imgRows.Close()
		for imgRows.Next() {
			var img menu.ProductoMenuImagen
			imgRows.Scan(&img.ID, &img.TenantID, &img.ProductoMenuID, &img.URL, &img.AltTexto,
				&img.Orden, &img.EsPrincipal, &img.CreatedAt)
			p.Imagenes = append(p.Imagenes, img)
		}
	}

	// Cargar variantes
	varRows, err := r.DB.Query(`
		SELECT id, tenant_id, producto_menu_id, nombre, precio_adicional, disponible, orden, activo, created_at
		FROM variantes_producto_menu WHERE producto_menu_id = $1 AND tenant_id = $2 AND activo = true ORDER BY orden
	`, id, tenantID)
	if err == nil {
		defer varRows.Close()
		for varRows.Next() {
			var v menu.VarianteProducto
			varRows.Scan(&v.ID, &v.TenantID, &v.ProductoMenuID, &v.Nombre,
				&v.PrecioAdicional, &v.Disponible, &v.Orden, &v.Activo, &v.CreatedAt)
			p.Variantes = append(p.Variantes, v)
		}
	}

	return &p, nil
}

func (r *MenuRepo) CrearProducto(tenantID string, req menu.NuevoProductoMenuRequest) (*menu.ProductoMenu, error) {
	var p menu.ProductoMenu
	err := r.DB.QueryRow(`
		INSERT INTO productos_menu (tenant_id, local_id, categoria_menu_id, nombre, descripcion,
			precio_base, imagen_url, tiempo_preparacion, calorias, alergenos,
			es_vegetariano, es_vegano, es_gluten_free, es_popular, es_nuevo, orden)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
		RETURNING id, tenant_id, local_id, categoria_menu_id, nombre, descripcion,
			precio_base, imagen_url, tiempo_preparacion, calorias, alergenos,
			es_vegetariano, es_vegano, es_gluten_free, es_popular, es_nuevo,
			disponible, orden, activo, deleted_at, created_at, updated_at
	`,
		tenantID, req.LocalID, req.CategoriaMenuID, req.Nombre, req.Descripcion,
		req.PrecioBase, req.ImagenURL, req.TiempoPreparacion, req.Calorias, req.Alergenos,
		req.EsVegetariano, req.EsVegano, req.EsGlutenFree, req.EsPopular, req.EsNuevo, req.Orden,
	).Scan(
		&p.ID, &p.TenantID, &p.LocalID, &p.CategoriaMenuID, &p.Nombre, &p.Descripcion,
		&p.PrecioBase, &p.ImagenURL, &p.TiempoPreparacion, &p.Calorias, &p.Alergenos,
		&p.EsVegetariano, &p.EsVegano, &p.EsGlutenFree, &p.EsPopular, &p.EsNuevo,
		&p.Disponible, &p.Orden, &p.Activo, &p.DeletedAt, &p.CreatedAt, &p.UpdatedAt,
	)
	return &p, err
}

func (r *MenuRepo) ActualizarProducto(tenantID string, id int64, req menu.ActualizarProductoMenuRequest) error {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1
	if req.CategoriaMenuID != nil {
		setClauses += fmt.Sprintf("categoria_menu_id = $%d, ", argIdx)
		args = append(args, *req.CategoriaMenuID)
		argIdx++
	}
	if req.Nombre != "" {
		setClauses += fmt.Sprintf("nombre = $%d, ", argIdx)
		args = append(args, req.Nombre)
		argIdx++
	}
	if req.PrecioBase != nil {
		setClauses += fmt.Sprintf("precio_base = $%d, ", argIdx)
		args = append(args, *req.PrecioBase)
		argIdx++
	}
	if req.ImagenURL != "" {
		setClauses += fmt.Sprintf("imagen_url = $%d, ", argIdx)
		args = append(args, req.ImagenURL)
		argIdx++
	}
	if req.TiempoPreparacion != nil {
		setClauses += fmt.Sprintf("tiempo_preparacion = $%d, ", argIdx)
		args = append(args, *req.TiempoPreparacion)
		argIdx++
	}
	if req.Disponible != nil {
		setClauses += fmt.Sprintf("disponible = $%d, ", argIdx)
		args = append(args, *req.Disponible)
		argIdx++
	}
	if req.EsPopular != nil {
		setClauses += fmt.Sprintf("es_popular = $%d, ", argIdx)
		args = append(args, *req.EsPopular)
		argIdx++
	}
	if req.EsNuevo != nil {
		setClauses += fmt.Sprintf("es_nuevo = $%d, ", argIdx)
		args = append(args, *req.EsNuevo)
		argIdx++
	}
	if req.Activo != nil {
		setClauses += fmt.Sprintf("activo = $%d, ", argIdx)
		args = append(args, *req.Activo)
		argIdx++
	}
	if req.Orden != nil {
		setClauses += fmt.Sprintf("orden = $%d, ", argIdx)
		args = append(args, *req.Orden)
		argIdx++
	}
	if len(args) == 0 {
		return nil
	}
	setClauses += "updated_at = NOW() "
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE productos_menu SET %sWHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		setClauses, argIdx, argIdx+1)
	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *MenuRepo) EliminarProducto(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"UPDATE productos_menu SET deleted_at = NOW(), activo = false, updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
		id, tenantID)
	return err
}

func (r *MenuRepo) CambiarDisponibilidadProducto(tenantID string, id int64, disponible bool) error {
	_, err := r.DB.Exec(
		"UPDATE productos_menu SET disponible = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL",
		disponible, id, tenantID)
	return err
}

// ============ VARIANTES ============

func (r *MenuRepo) ListarVariantes(tenantID string, productoID int64) ([]menu.VarianteProducto, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, producto_menu_id, nombre, precio_adicional, disponible, orden, activo, created_at
		FROM variantes_producto_menu WHERE tenant_id = $1 AND producto_menu_id = $2 AND activo = true ORDER BY orden
	`, tenantID, productoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var variantes []menu.VarianteProducto
	for rows.Next() {
		var v menu.VarianteProducto
		rows.Scan(&v.ID, &v.TenantID, &v.ProductoMenuID, &v.Nombre,
			&v.PrecioAdicional, &v.Disponible, &v.Orden, &v.Activo, &v.CreatedAt)
		variantes = append(variantes, v)
	}
	return variantes, nil
}

func (r *MenuRepo) CrearVariante(tenantID string, req menu.NuevaVarianteRequest) (*menu.VarianteProducto, error) {
	var v menu.VarianteProducto
	err := r.DB.QueryRow(`
		INSERT INTO variantes_producto_menu (tenant_id, producto_menu_id, nombre, precio_adicional, orden)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id, tenant_id, producto_menu_id, nombre, precio_adicional, disponible, orden, activo, created_at
	`, tenantID, req.ProductoMenuID, req.Nombre, req.PrecioAdicional, req.Orden,
	).Scan(&v.ID, &v.TenantID, &v.ProductoMenuID, &v.Nombre,
		&v.PrecioAdicional, &v.Disponible, &v.Orden, &v.Activo, &v.CreatedAt)
	return &v, err
}

func (r *MenuRepo) EliminarVariante(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"UPDATE variantes_producto_menu SET activo = false WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

// ============ GRUPOS MODIFICADORES ============

func (r *MenuRepo) ListarGruposModificadores(tenantID string, localID int) ([]menu.GrupoModificador, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombre, tipo_seleccion, minimo_seleccion, maximo_seleccion,
			   es_obligatorio, activo, deleted_at, created_at
		FROM grupos_modificadores WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL ORDER BY nombre
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var grupos []menu.GrupoModificador
	for rows.Next() {
		var g menu.GrupoModificador
		rows.Scan(&g.ID, &g.TenantID, &g.LocalID, &g.Nombre, &g.TipoSeleccion,
			&g.MinimoSeleccion, &g.MaximoSeleccion, &g.EsObligatorio,
			&g.Activo, &g.DeletedAt, &g.CreatedAt)
		grupos = append(grupos, g)
	}
	return grupos, nil
}

func (r *MenuRepo) ObtenerGrupoModificador(tenantID string, id int) (*menu.GrupoModificador, error) {
	var g menu.GrupoModificador
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, nombre, tipo_seleccion, minimo_seleccion, maximo_seleccion,
			   es_obligatorio, activo, deleted_at, created_at
		FROM grupos_modificadores WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
	`, id, tenantID).Scan(&g.ID, &g.TenantID, &g.LocalID, &g.Nombre, &g.TipoSeleccion,
		&g.MinimoSeleccion, &g.MaximoSeleccion, &g.EsObligatorio,
		&g.Activo, &g.DeletedAt, &g.CreatedAt)
	if err != nil {
		return nil, err
	}

	// Cargar modificadores del grupo
	modRows, err := r.DB.Query(`
		SELECT id, tenant_id, grupo_modificador_id, nombre, precio_adicional, disponible, orden, activo, created_at
		FROM modificadores WHERE grupo_modificador_id = $1 AND tenant_id = $2 AND activo = true ORDER BY orden
	`, id, tenantID)
	if err == nil {
		defer modRows.Close()
		for modRows.Next() {
			var m menu.Modificador
			modRows.Scan(&m.ID, &m.TenantID, &m.GrupoModificadorID, &m.Nombre,
				&m.PrecioAdicional, &m.Disponible, &m.Orden, &m.Activo, &m.CreatedAt)
			g.Modificadores = append(g.Modificadores, m)
		}
	}
	return &g, nil
}

func (r *MenuRepo) CrearGrupoModificador(tenantID string, req menu.NuevoGrupoModificadorRequest) (*menu.GrupoModificador, error) {
	var g menu.GrupoModificador
	err := r.DB.QueryRow(`
		INSERT INTO grupos_modificadores (tenant_id, local_id, nombre, tipo_seleccion, minimo_seleccion, maximo_seleccion, es_obligatorio)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, tenant_id, local_id, nombre, tipo_seleccion, minimo_seleccion, maximo_seleccion, es_obligatorio, activo, deleted_at, created_at
	`, tenantID, req.LocalID, req.Nombre, req.TipoSeleccion, req.MinimoSeleccion, req.MaximoSeleccion, req.EsObligatorio,
	).Scan(&g.ID, &g.TenantID, &g.LocalID, &g.Nombre, &g.TipoSeleccion,
		&g.MinimoSeleccion, &g.MaximoSeleccion, &g.EsObligatorio,
		&g.Activo, &g.DeletedAt, &g.CreatedAt)
	return &g, err
}

func (r *MenuRepo) CrearModificador(tenantID string, req menu.NuevoModificadorRequest) (*menu.Modificador, error) {
	var m menu.Modificador
	err := r.DB.QueryRow(`
		INSERT INTO modificadores (tenant_id, grupo_modificador_id, nombre, precio_adicional, orden)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id, tenant_id, grupo_modificador_id, nombre, precio_adicional, disponible, orden, activo, created_at
	`, tenantID, req.GrupoModificadorID, req.Nombre, req.PrecioAdicional, req.Orden,
	).Scan(&m.ID, &m.TenantID, &m.GrupoModificadorID, &m.Nombre,
		&m.PrecioAdicional, &m.Disponible, &m.Orden, &m.Activo, &m.CreatedAt)
	return &m, err
}

func (r *MenuRepo) AsignarGrupoAProducto(tenantID string, req menu.AsignarGrupoModificadorRequest) error {
	_, err := r.DB.Exec(`
		INSERT INTO producto_grupos_modificadores (tenant_id, producto_menu_id, grupo_modificador_id)
		VALUES ($1,$2,$3) ON CONFLICT DO NOTHING
	`, tenantID, req.ProductoMenuID, req.GrupoModificadorID)
	return err
}

func (r *MenuRepo) DesasignarGrupoDeProducto(tenantID string, productoID int64, grupoID int) error {
	_, err := r.DB.Exec(`
		DELETE FROM producto_grupos_modificadores
		WHERE tenant_id = $1 AND producto_menu_id = $2 AND grupo_modificador_id = $3
	`, tenantID, productoID, grupoID)
	return err
}

// ============ COMBOS ============

func (r *MenuRepo) ListarCombos(tenantID string, localID int) ([]menu.Combo, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombre, descripcion, precio_combo, imagen_url,
			   fecha_inicio, fecha_fin, disponible, activo, deleted_at, created_at, updated_at
		FROM combos WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL ORDER BY nombre
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var combos []menu.Combo
	for rows.Next() {
		var c menu.Combo
		rows.Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombre, &c.Descripcion,
			&c.PrecioCombo, &c.ImagenURL, &c.FechaInicio, &c.FechaFin,
			&c.Disponible, &c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
		combos = append(combos, c)
	}
	return combos, nil
}

func (r *MenuRepo) ObtenerCombo(tenantID string, id int64) (*menu.Combo, error) {
	var c menu.Combo
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, nombre, descripcion, precio_combo, imagen_url,
			   fecha_inicio, fecha_fin, disponible, activo, deleted_at, created_at, updated_at
		FROM combos WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
	`, id, tenantID).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombre, &c.Descripcion,
		&c.PrecioCombo, &c.ImagenURL, &c.FechaInicio, &c.FechaFin,
		&c.Disponible, &c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Cargar detalle del combo
	detRows, err := r.DB.Query(`
		SELECT d.id, d.tenant_id, d.combo_id, d.producto_menu_id, d.cantidad,
			   COALESCE(p.nombre, '') as nombre_producto, COALESCE(p.precio_base, 0) as precio_unitario
		FROM detalle_combos d
		LEFT JOIN productos_menu p ON p.id = d.producto_menu_id AND p.tenant_id = d.tenant_id
		WHERE d.combo_id = $1 AND d.tenant_id = $2
	`, id, tenantID)
	if err == nil {
		defer detRows.Close()
		var precioNormal float64
		for detRows.Next() {
			var d menu.DetalleCombo
			detRows.Scan(&d.ID, &d.TenantID, &d.ComboID, &d.ProductoMenuID,
				&d.Cantidad, &d.NombreProducto, &d.PrecioUnitario)
			precioNormal += d.PrecioUnitario * float64(d.Cantidad)
			c.Detalle = append(c.Detalle, d)
		}
		c.PrecioNormal = precioNormal
		c.Ahorro = precioNormal - c.PrecioCombo
	}
	return &c, nil
}

func (r *MenuRepo) CrearCombo(tenantID string, req menu.NuevoComboRequest) (*menu.Combo, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var c menu.Combo
	err = tx.QueryRow(`
		INSERT INTO combos (tenant_id, local_id, nombre, descripcion, precio_combo, imagen_url, fecha_inicio, fecha_fin)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		RETURNING id, tenant_id, local_id, nombre, descripcion, precio_combo, imagen_url,
			fecha_inicio, fecha_fin, disponible, activo, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, req.Nombre, req.Descripcion, req.PrecioCombo, req.ImagenURL,
		req.FechaInicio, req.FechaFin,
	).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombre, &c.Descripcion,
		&c.PrecioCombo, &c.ImagenURL, &c.FechaInicio, &c.FechaFin,
		&c.Disponible, &c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}

	for _, d := range req.Detalle {
		_, err = tx.Exec(`
			INSERT INTO detalle_combos (tenant_id, combo_id, producto_menu_id, cantidad)
			VALUES ($1,$2,$3,$4)
		`, tenantID, c.ID, d.ProductoMenuID, d.Cantidad)
		if err != nil {
			return nil, err
		}
	}

	return &c, tx.Commit()
}

// ============ PROMOCIONES ============

func (r *MenuRepo) ListarPromociones(tenantID string, localID int) ([]menu.Promocion, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombre, descripcion, tipo_descuento, valor_descuento,
			   fecha_inicio, fecha_fin, dias_aplicables, hora_inicio, hora_fin,
			   aplica_a, producto_menu_id, categoria_id, usos_maximos, usos_actuales,
			   activo, deleted_at, created_at, updated_at
		FROM promociones WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL ORDER BY created_at DESC
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var promos []menu.Promocion
	for rows.Next() {
		var p menu.Promocion
		rows.Scan(&p.ID, &p.TenantID, &p.LocalID, &p.Nombre, &p.Descripcion,
			&p.TipoDescuento, &p.ValorDescuento, &p.FechaInicio, &p.FechaFin,
			&p.DiasAplicables, &p.HoraInicio, &p.HoraFin,
			&p.AplicaA, &p.ProductoMenuID, &p.CategoriaID,
			&p.UsosMaximos, &p.UsosActuales,
			&p.Activo, &p.DeletedAt, &p.CreatedAt, &p.UpdatedAt)
		promos = append(promos, p)
	}
	return promos, nil
}

func (r *MenuRepo) CrearPromocion(tenantID string, req menu.NuevaPromocionRequest) (*menu.Promocion, error) {
	var p menu.Promocion
	err := r.DB.QueryRow(`
		INSERT INTO promociones (tenant_id, local_id, nombre, descripcion, tipo_descuento, valor_descuento,
			fecha_inicio, fecha_fin, dias_aplicables, hora_inicio, hora_fin,
			aplica_a, producto_menu_id, categoria_id, usos_maximos)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
		RETURNING id, tenant_id, local_id, nombre, descripcion, tipo_descuento, valor_descuento,
			fecha_inicio, fecha_fin, dias_aplicables, hora_inicio, hora_fin,
			aplica_a, producto_menu_id, categoria_id, usos_maximos, usos_actuales,
			activo, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, req.Nombre, req.Descripcion, req.TipoDescuento, req.ValorDescuento,
		req.FechaInicio, req.FechaFin, req.DiasAplicables, req.HoraInicio, req.HoraFin,
		req.AplicaA, req.ProductoMenuID, req.CategoriaID, req.UsosMaximos,
	).Scan(&p.ID, &p.TenantID, &p.LocalID, &p.Nombre, &p.Descripcion,
		&p.TipoDescuento, &p.ValorDescuento, &p.FechaInicio, &p.FechaFin,
		&p.DiasAplicables, &p.HoraInicio, &p.HoraFin,
		&p.AplicaA, &p.ProductoMenuID, &p.CategoriaID,
		&p.UsosMaximos, &p.UsosActuales,
		&p.Activo, &p.DeletedAt, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

// ============ CUPONES ============

func (r *MenuRepo) ListarCupones(tenantID string, localID int) ([]menu.Cupon, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, codigo, descripcion, tipo_descuento, valor_descuento,
			   monto_minimo, monto_max_descuento, fecha_inicio, fecha_fin,
			   usos_maximos, usos_por_cliente, usos_actuales, cliente_id,
			   activo, deleted_at, created_at, updated_at
		FROM cupones WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL ORDER BY created_at DESC
	`, tenantID, localID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var cupones []menu.Cupon
	for rows.Next() {
		var c menu.Cupon
		rows.Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Codigo, &c.Descripcion,
			&c.TipoDescuento, &c.ValorDescuento, &c.MontoMinimo, &c.MontoMaxDescuento,
			&c.FechaInicio, &c.FechaFin, &c.UsosMaximos, &c.UsosPorCliente,
			&c.UsosActuales, &c.ClienteID, &c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
		cupones = append(cupones, c)
	}
	return cupones, nil
}

func (r *MenuRepo) CrearCupon(tenantID string, req menu.NuevoCuponRequest) (*menu.Cupon, error) {
	var c menu.Cupon
	err := r.DB.QueryRow(`
		INSERT INTO cupones (tenant_id, local_id, codigo, descripcion, tipo_descuento, valor_descuento,
			monto_minimo, monto_max_descuento, fecha_inicio, fecha_fin,
			usos_maximos, usos_por_cliente, cliente_id)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
		RETURNING id, tenant_id, local_id, codigo, descripcion, tipo_descuento, valor_descuento,
			monto_minimo, monto_max_descuento, fecha_inicio, fecha_fin,
			usos_maximos, usos_por_cliente, usos_actuales, cliente_id,
			activo, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, req.Codigo, req.Descripcion, req.TipoDescuento, req.ValorDescuento,
		req.MontoMinimo, req.MontoMaxDescuento, req.FechaInicio, req.FechaFin,
		req.UsosMaximos, req.UsosPorCliente, req.ClienteID,
	).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Codigo, &c.Descripcion,
		&c.TipoDescuento, &c.ValorDescuento, &c.MontoMinimo, &c.MontoMaxDescuento,
		&c.FechaInicio, &c.FechaFin, &c.UsosMaximos, &c.UsosPorCliente,
		&c.UsosActuales, &c.ClienteID, &c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
	return &c, err
}

func (r *MenuRepo) ValidarCupon(tenantID string, localID int, req menu.ValidarCuponRequest) (*menu.CuponValidado, error) {
	var c menu.Cupon
	err := r.DB.QueryRow(`
		SELECT id, tipo_descuento, valor_descuento, monto_minimo, monto_max_descuento,
			   usos_maximos, usos_por_cliente, usos_actuales, cliente_id
		FROM cupones
		WHERE tenant_id = $1 AND local_id = $2 AND codigo = $3
			AND activo = true AND deleted_at IS NULL
			AND fecha_inicio <= NOW() AND fecha_fin >= NOW()
	`, tenantID, localID, req.Codigo,
	).Scan(&c.ID, &c.TipoDescuento, &c.ValorDescuento, &c.MontoMinimo, &c.MontoMaxDescuento,
		&c.UsosMaximos, &c.UsosPorCliente, &c.UsosActuales, &c.ClienteID)
	if err != nil {
		return &menu.CuponValidado{Valido: false, Mensaje: "Cupón no encontrado o expirado"}, nil
	}

	// Validar usos máximos
	if c.UsosMaximos > 0 && c.UsosActuales >= c.UsosMaximos {
		return &menu.CuponValidado{Valido: false, Mensaje: "Cupón ha alcanzado el límite de usos"}, nil
	}

	// Validar monto mínimo
	if req.Monto < c.MontoMinimo {
		return &menu.CuponValidado{Valido: false, Mensaje: fmt.Sprintf("Monto mínimo requerido: %.2f", c.MontoMinimo)}, nil
	}

	// Validar cliente específico
	if c.ClienteID != nil && (req.ClienteID == nil || *req.ClienteID != *c.ClienteID) {
		return &menu.CuponValidado{Valido: false, Mensaje: "Cupón no válido para este cliente"}, nil
	}

	// Calcular descuento
	var descuento float64
	if c.TipoDescuento == "porcentaje" {
		descuento = req.Monto * c.ValorDescuento / 100
		if c.MontoMaxDescuento > 0 && descuento > c.MontoMaxDescuento {
			descuento = c.MontoMaxDescuento
		}
	} else {
		descuento = c.ValorDescuento
		if descuento > req.Monto {
			descuento = req.Monto
		}
	}

	return &menu.CuponValidado{
		Valido:         true,
		Descuento:      descuento,
		Mensaje:        "Cupón válido",
		CuponID:        c.ID,
		TipoDescuento:  c.TipoDescuento,
		ValorDescuento: c.ValorDescuento,
	}, nil
}

func (r *MenuRepo) IncrementarUsoCupon(tenantID string, cuponID int64) error {
	_, err := r.DB.Exec(
		"UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE id = $1 AND tenant_id = $2",
		cuponID, tenantID)
	return err
}

// ============ IMÁGENES PRODUCTO ============

func (r *MenuRepo) AgregarImagenProducto(tenantID string, req menu.NuevaImagenProductoRequest) (*menu.ProductoMenuImagen, error) {
	var img menu.ProductoMenuImagen
	err := r.DB.QueryRow(`
		INSERT INTO producto_menu_imagenes (tenant_id, producto_menu_id, url, alt_texto, orden, es_principal)
		VALUES ($1,$2,$3,$4,$5,$6)
		RETURNING id, tenant_id, producto_menu_id, url, alt_texto, orden, es_principal, created_at
	`, tenantID, req.ProductoMenuID, req.URL, req.AltTexto, req.Orden, req.EsPrincipal,
	).Scan(&img.ID, &img.TenantID, &img.ProductoMenuID, &img.URL,
		&img.AltTexto, &img.Orden, &img.EsPrincipal, &img.CreatedAt)
	return &img, err
}

func (r *MenuRepo) EliminarImagenProducto(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"DELETE FROM producto_menu_imagenes WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

// ============ HORARIOS MENÚ ============

func (r *MenuRepo) ListarHorarios(tenantID string, categoriaID int) ([]menu.MenuHorario, error) {
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, categoria_menu_id, dia_semana, hora_inicio, hora_fin, activo, created_at
		FROM menu_horarios WHERE tenant_id = $1 AND categoria_menu_id = $2 ORDER BY dia_semana, hora_inicio
	`, tenantID, categoriaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var horarios []menu.MenuHorario
	for rows.Next() {
		var h menu.MenuHorario
		rows.Scan(&h.ID, &h.TenantID, &h.CategoriaMenuID, &h.DiaSemana,
			&h.HoraInicio, &h.HoraFin, &h.Activo, &h.CreatedAt)
		horarios = append(horarios, h)
	}
	return horarios, nil
}

func (r *MenuRepo) CrearHorario(tenantID string, req menu.NuevoMenuHorarioRequest) (*menu.MenuHorario, error) {
	var h menu.MenuHorario
	err := r.DB.QueryRow(`
		INSERT INTO menu_horarios (tenant_id, categoria_menu_id, dia_semana, hora_inicio, hora_fin)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id, tenant_id, categoria_menu_id, dia_semana, hora_inicio, hora_fin, activo, created_at
	`, tenantID, req.CategoriaMenuID, req.DiaSemana, req.HoraInicio, req.HoraFin,
	).Scan(&h.ID, &h.TenantID, &h.CategoriaMenuID, &h.DiaSemana,
		&h.HoraInicio, &h.HoraFin, &h.Activo, &h.CreatedAt)
	return &h, err
}

func (r *MenuRepo) EliminarHorario(tenantID string, id int) error {
	_, err := r.DB.Exec("DELETE FROM menu_horarios WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}
