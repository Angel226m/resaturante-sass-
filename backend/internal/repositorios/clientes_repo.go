package repositorios

import (
	"database/sql"
	"fmt"

	"github.com/restauflow/backend/internal/entidades/clientes"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Repositorio: Clientes + Direcciones
// ==========================================

type ClientesRepo struct {
	DB *sql.DB
}

func NuevoClientesRepo(db *sql.DB) *ClientesRepo {
	return &ClientesRepo{DB: db}
}

// ============ CLIENTES ============

func (r *ClientesRepo) ListarClientes(tenantID string, localID int, pagina, porPagina int) ([]clientes.Cliente, int, error) {
	var total int
	r.DB.QueryRow(`
		SELECT COUNT(*) FROM clientes WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL
	`, tenantID, localID).Scan(&total)

	offset := (pagina - 1) * porPagina
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombres, apellidos, tipo_documento,
			   correo_cifrado, celular_cifrado, documento_cifrado,
			   fecha_nacimiento, genero, total_compras,
			   cantidad_visitas, ultima_visita, notas,
			   activo, deleted_at, created_at, updated_at
		FROM clientes WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL
		ORDER BY nombres, apellidos LIMIT $3 OFFSET $4
	`, tenantID, localID, porPagina, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var lista []clientes.Cliente
	for rows.Next() {
		var c clientes.Cliente
		rows.Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombres, &c.Apellidos,
			&c.TipoDocumento, &c.CorreoCifrado, &c.CelularCifrado, &c.DocumentoCifrado,
			&c.FechaNacimiento, &c.Genero, &c.TotalCompras,
			&c.CantidadVisitas, &c.UltimaVisita, &c.Notas,
			&c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
		c.Correo, _ = utils.DecryptFast(c.CorreoCifrado)
		c.Celular, _ = utils.DecryptSecure(c.CelularCifrado)
		c.NumeroDocumento, _ = utils.DecryptFast(c.DocumentoCifrado)
		c.NombreCompleto = c.Nombres + " " + c.Apellidos
		lista = append(lista, c)
	}
	return lista, total, nil
}

func (r *ClientesRepo) ObtenerCliente(tenantID string, id int64) (*clientes.Cliente, error) {
	var c clientes.Cliente
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, nombres, apellidos, tipo_documento,
			   correo_cifrado, celular_cifrado, documento_cifrado,
			   fecha_nacimiento, genero, total_compras,
			   cantidad_visitas, ultima_visita, notas,
			   activo, deleted_at, created_at, updated_at
		FROM clientes WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
	`, id, tenantID).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombres, &c.Apellidos,
		&c.TipoDocumento, &c.CorreoCifrado, &c.CelularCifrado, &c.DocumentoCifrado,
		&c.FechaNacimiento, &c.Genero, &c.TotalCompras,
		&c.CantidadVisitas, &c.UltimaVisita, &c.Notas,
		&c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	c.Correo, _ = utils.DecryptFast(c.CorreoCifrado)
	c.Celular, _ = utils.DecryptSecure(c.CelularCifrado)
	c.NumeroDocumento, _ = utils.DecryptFast(c.DocumentoCifrado)
	c.NombreCompleto = c.Nombres + " " + c.Apellidos

	// Cargar direcciones
	dirRows, err := r.DB.Query(`
		SELECT id, tenant_id, cliente_id, etiqueta, direccion, referencia, distrito,
			   latitud, longitud, es_principal, activo, created_at
		FROM direcciones_cliente WHERE cliente_id = $1 AND tenant_id = $2 AND activo = true
		ORDER BY es_principal DESC
	`, id, tenantID)
	if err == nil {
		defer dirRows.Close()
		for dirRows.Next() {
			var d clientes.DireccionCliente
			dirRows.Scan(&d.ID, &d.TenantID, &d.ClienteID, &d.Etiqueta, &d.Direccion,
				&d.Referencia, &d.Distrito, &d.Latitud, &d.Longitud,
				&d.EsPrincipal, &d.Activo, &d.CreatedAt)
			c.Direcciones = append(c.Direcciones, d)
		}
	}
	return &c, nil
}

func (r *ClientesRepo) CrearCliente(tenantID string, req clientes.NuevoClienteRequest) (*clientes.Cliente, error) {
	correoCifrado, _ := utils.EncryptCorreo(req.Correo)
	celularCifrado, _ := utils.EncryptNumeroCelular(req.Celular)
	documentoCifrado, _ := utils.EncryptFast(req.NumeroDocumento)

	var c clientes.Cliente
	err := r.DB.QueryRow(`
		INSERT INTO clientes (tenant_id, local_id, nombres, apellidos, tipo_documento,
			correo_cifrado, celular_cifrado, documento_cifrado,
			fecha_nacimiento, genero, notas)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id, tenant_id, local_id, nombres, apellidos, tipo_documento,
			correo_cifrado, celular_cifrado, documento_cifrado,
			fecha_nacimiento, genero, total_compras,
			cantidad_visitas, ultima_visita, notas,
			activo, deleted_at, created_at, updated_at
	`, tenantID, req.LocalID, req.Nombres, req.Apellidos, req.TipoDocumento,
		correoCifrado, celularCifrado, documentoCifrado,
		req.FechaNacimiento, req.Genero, req.Notas,
	).Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombres, &c.Apellidos,
		&c.TipoDocumento, &c.CorreoCifrado, &c.CelularCifrado, &c.DocumentoCifrado,
		&c.FechaNacimiento, &c.Genero, &c.TotalCompras,
		&c.CantidadVisitas, &c.UltimaVisita, &c.Notas,
		&c.Activo, &c.DeletedAt, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	c.Correo = req.Correo
	c.Celular = req.Celular
	c.NumeroDocumento = req.NumeroDocumento
	c.NombreCompleto = c.Nombres + " " + c.Apellidos
	return &c, nil
}

func (r *ClientesRepo) ActualizarCliente(tenantID string, id int64, req clientes.ActualizarClienteRequest) error {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1
	if req.Nombres != "" {
		setClauses += fmt.Sprintf("nombres = $%d, ", argIdx)
		args = append(args, req.Nombres)
		argIdx++
	}
	if req.Apellidos != "" {
		setClauses += fmt.Sprintf("apellidos = $%d, ", argIdx)
		args = append(args, req.Apellidos)
		argIdx++
	}
	if req.Correo != "" {
		cifrado, _ := utils.EncryptCorreo(req.Correo)
		setClauses += fmt.Sprintf("correo_cifrado = $%d, ", argIdx)
		args = append(args, cifrado)
		argIdx++
	}
	if req.Celular != "" {
		cifrado, _ := utils.EncryptNumeroCelular(req.Celular)
		setClauses += fmt.Sprintf("celular_cifrado = $%d, ", argIdx)
		args = append(args, cifrado)
		argIdx++
	}
	if req.NumeroDocumento != "" {
		cifrado, _ := utils.EncryptFast(req.NumeroDocumento)
		setClauses += fmt.Sprintf("documento_cifrado = $%d, ", argIdx)
		args = append(args, cifrado)
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
	setClauses += "updated_at = NOW() "
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE clientes SET %sWHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		setClauses, argIdx, argIdx+1)
	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *ClientesRepo) EliminarCliente(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"UPDATE clientes SET deleted_at = NOW(), activo = false, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL",
		id, tenantID)
	return err
}

func (r *ClientesRepo) BuscarClientes(tenantID string, req clientes.BuscarClienteRequest) ([]clientes.Cliente, int, error) {
	termino := "%" + req.Termino + "%"
	var total int
	r.DB.QueryRow(`
		SELECT COUNT(*) FROM clientes
		WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL
		AND (nombres ILIKE $3 OR apellidos ILIKE $3)
	`, tenantID, req.LocalID, termino).Scan(&total)

	offset := (req.Pagina - 1) * req.PorPagina
	rows, err := r.DB.Query(`
		SELECT id, tenant_id, local_id, nombres, apellidos, tipo_documento,
			   correo_cifrado, celular_cifrado, documento_cifrado,
			   total_compras, cantidad_visitas,
			   activo, created_at
		FROM clientes
		WHERE tenant_id = $1 AND local_id = $2 AND deleted_at IS NULL
		AND (nombres ILIKE $3 OR apellidos ILIKE $3)
		ORDER BY nombres LIMIT $4 OFFSET $5
	`, tenantID, req.LocalID, termino, req.PorPagina, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var lista []clientes.Cliente
	for rows.Next() {
		var c clientes.Cliente
		rows.Scan(&c.ID, &c.TenantID, &c.LocalID, &c.Nombres, &c.Apellidos,
			&c.TipoDocumento, &c.CorreoCifrado, &c.CelularCifrado, &c.DocumentoCifrado,
			&c.TotalCompras, &c.CantidadVisitas,
			&c.Activo, &c.CreatedAt)
		c.Correo, _ = utils.DecryptFast(c.CorreoCifrado)
		c.Celular, _ = utils.DecryptSecure(c.CelularCifrado)
		c.NumeroDocumento, _ = utils.DecryptFast(c.DocumentoCifrado)
		c.NombreCompleto = c.Nombres + " " + c.Apellidos
		lista = append(lista, c)
	}
	return lista, total, nil
}

func (r *ClientesRepo) RegistrarVisita(tenantID string, clienteID int64) error {
	_, err := r.DB.Exec(`
		UPDATE clientes SET cantidad_visitas = cantidad_visitas + 1, ultima_visita = NOW(), updated_at = NOW()
		WHERE id = $1 AND tenant_id = $2
	`, clienteID, tenantID)
	return err
}

func (r *ClientesRepo) ActualizarTotalCompras(tenantID string, clienteID int64, monto float64) error {
	_, err := r.DB.Exec(`
		UPDATE clientes SET total_compras = total_compras + $1, updated_at = NOW()
		WHERE id = $2 AND tenant_id = $3
	`, monto, clienteID, tenantID)
	return err
}

// ============ DIRECCIONES ============

func (r *ClientesRepo) CrearDireccion(tenantID string, req clientes.NuevaDireccionClienteRequest) (*clientes.DireccionCliente, error) {
	var d clientes.DireccionCliente
	err := r.DB.QueryRow(`
		INSERT INTO direcciones_cliente (tenant_id, cliente_id, etiqueta, direccion, referencia,
			distrito, latitud, longitud, es_principal)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, tenant_id, cliente_id, etiqueta, direccion, referencia, distrito,
			latitud, longitud, es_principal, activo, created_at
	`, tenantID, req.ClienteID, req.Etiqueta, req.Direccion, req.Referencia,
		req.Distrito, req.Latitud, req.Longitud, req.EsPrincipal,
	).Scan(&d.ID, &d.TenantID, &d.ClienteID, &d.Etiqueta, &d.Direccion,
		&d.Referencia, &d.Distrito, &d.Latitud, &d.Longitud,
		&d.EsPrincipal, &d.Activo, &d.CreatedAt)
	return &d, err
}

func (r *ClientesRepo) EliminarDireccion(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"UPDATE direcciones_cliente SET activo = false WHERE id = $1 AND tenant_id = $2",
		id, tenantID)
	return err
}
