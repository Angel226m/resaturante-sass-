package repositorios

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/restauflow/backend/internal/entidades/auth"
	"github.com/restauflow/backend/internal/utils"
)

// ==========================================
// Repositorio: Auth (Usuarios + SuperAdmins + Tokens)
// ==========================================

type AuthRepo struct {
	DB *sql.DB
}

func NuevoAuthRepo(db *sql.DB) *AuthRepo {
	return &AuthRepo{DB: db}
}

// ============ USUARIOS ============

func (r *AuthRepo) CrearUsuario(tenantID string, req auth.NuevoUsuarioRequest) (*auth.Usuario, error) {
	hash, err := utils.HashPassword(req.Contrasena)
	if err != nil {
		return nil, fmt.Errorf("error al hashear contraseña: %w", err)
	}

	var u auth.Usuario
	err = r.DB.QueryRow(`
		INSERT INTO usuarios (tenant_id, local_id, correo, numero_celular,
			nombre, apellidos, rol, contrasena, pin_acceso)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, tenant_id, local_id, correo, COALESCE(numero_celular, ''), nombre, apellidos,
			rol, COALESCE(pin_acceso, ''), activo, deleted_at, ultimo_login, created_at, updated_at
	`,
		tenantID, req.LocalID, req.Correo, req.NumeroCelular,
		req.Nombre, req.Apellidos, req.Rol, hash, req.PinAcceso,
	).Scan(
		&u.ID, &u.TenantID, &u.LocalID, &u.Correo, &u.NumeroCelular,
		&u.Nombre, &u.Apellidos, &u.Rol, &u.PinAcceso,
		&u.Activo, &u.DeletedAt, &u.UltimoLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *AuthRepo) ObtenerUsuarioPorCorreo(tenantID, correo string) (*auth.Usuario, string, error) {
	var u auth.Usuario
	var hash string
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, correo, COALESCE(numero_celular, ''), nombre, apellidos,
			rol, COALESCE(pin_acceso, ''), contrasena, activo, deleted_at, ultimo_login,
			created_at, updated_at
		FROM usuarios
		WHERE tenant_id = $1 AND correo = $2 AND deleted_at IS NULL
	`, tenantID, correo).Scan(
		&u.ID, &u.TenantID, &u.LocalID, &u.Correo, &u.NumeroCelular,
		&u.Nombre, &u.Apellidos, &u.Rol, &u.PinAcceso,
		&hash, &u.Activo, &u.DeletedAt, &u.UltimoLogin,
		&u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, "", err
	}
	return &u, hash, nil
}

func (r *AuthRepo) ObtenerUsuarioPorID(tenantID string, id int64) (*auth.Usuario, error) {
	var u auth.Usuario
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, correo, COALESCE(numero_celular, ''), nombre, apellidos,
			rol, COALESCE(pin_acceso, ''), activo, deleted_at, ultimo_login, created_at, updated_at
		FROM usuarios
		WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
	`, id, tenantID).Scan(
		&u.ID, &u.TenantID, &u.LocalID, &u.Correo, &u.NumeroCelular,
		&u.Nombre, &u.Apellidos, &u.Rol, &u.PinAcceso,
		&u.Activo, &u.DeletedAt, &u.UltimoLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *AuthRepo) ListarUsuarios(tenantID string, localID int, pagina, porPagina int) ([]auth.Usuario, int, error) {
	var total int
	baseWhere := "WHERE tenant_id = $1 AND deleted_at IS NULL"
	args := []interface{}{tenantID}
	argIdx := 2

	if localID > 0 {
		baseWhere += fmt.Sprintf(" AND local_id = $%d", argIdx)
		args = append(args, localID)
		argIdx++
	}

	err := r.DB.QueryRow("SELECT COUNT(*) FROM usuarios "+baseWhere, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (pagina - 1) * porPagina
	args = append(args, porPagina, offset)
	rows, err := r.DB.Query(fmt.Sprintf(`
		SELECT id, tenant_id, local_id, correo, COALESCE(numero_celular, ''), nombre, apellidos,
			rol, COALESCE(pin_acceso, ''), activo, deleted_at, ultimo_login, created_at, updated_at
		FROM usuarios %s
		ORDER BY created_at DESC LIMIT $%d OFFSET $%d
	`, baseWhere, argIdx, argIdx+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var usuarios []auth.Usuario
	for rows.Next() {
		var u auth.Usuario
		err := rows.Scan(
			&u.ID, &u.TenantID, &u.LocalID, &u.Correo, &u.NumeroCelular,
			&u.Nombre, &u.Apellidos, &u.Rol, &u.PinAcceso,
			&u.Activo, &u.DeletedAt, &u.UltimoLogin, &u.CreatedAt, &u.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		usuarios = append(usuarios, u)
	}
	return usuarios, total, nil
}

func (r *AuthRepo) ActualizarUsuario(tenantID string, id int64, req auth.ActualizarUsuarioRequest) (*auth.Usuario, error) {
	setClauses := ""
	args := []interface{}{}
	argIdx := 1

	if req.Nombre != "" {
		setClauses += fmt.Sprintf("nombre = $%d, ", argIdx)
		args = append(args, req.Nombre)
		argIdx++
	}
	if req.Apellidos != "" {
		setClauses += fmt.Sprintf("apellidos = $%d, ", argIdx)
		args = append(args, req.Apellidos)
		argIdx++
	}
	if req.Correo != "" {
		setClauses += fmt.Sprintf("correo = $%d, ", argIdx)
		args = append(args, req.Correo)
		argIdx++
	}
	if req.NumeroCelular != "" {
		setClauses += fmt.Sprintf("numero_celular = $%d, ", argIdx)
		args = append(args, req.NumeroCelular)
		argIdx++
	}
	if req.Rol != "" {
		setClauses += fmt.Sprintf("rol = $%d, ", argIdx)
		args = append(args, req.Rol)
		argIdx++
	}
	if req.PinAcceso != "" {
		setClauses += fmt.Sprintf("pin_acceso = $%d, ", argIdx)
		args = append(args, req.PinAcceso)
		argIdx++
	}
	if req.ColorIdentificacion != "" {
		setClauses += fmt.Sprintf("color_identificacion = $%d, ", argIdx)
		args = append(args, req.ColorIdentificacion)
		argIdx++
	}
	if req.LocalID != nil {
		setClauses += fmt.Sprintf("local_id = $%d, ", argIdx)
		args = append(args, *req.LocalID)
		argIdx++
	}
	if req.Activo != nil {
		setClauses += fmt.Sprintf("activo = $%d, ", argIdx)
		args = append(args, *req.Activo)
		argIdx++
	}

	if len(args) == 0 {
		return r.ObtenerUsuarioPorID(tenantID, id)
	}

	setClauses += "updated_at = NOW() "
	args = append(args, id, tenantID)
	query := fmt.Sprintf("UPDATE usuarios SET %s WHERE id = $%d AND tenant_id = $%d AND deleted_at IS NULL",
		setClauses, argIdx, argIdx+1)

	_, err := r.DB.Exec(query, args...)
	if err != nil {
		return nil, err
	}
	return r.ObtenerUsuarioPorID(tenantID, id)
}

func (r *AuthRepo) EliminarUsuario(tenantID string, id int64) error {
	_, err := r.DB.Exec(
		"UPDATE usuarios SET deleted_at = NOW(), activo = false, updated_at = NOW() WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	)
	return err
}

func (r *AuthRepo) CambiarContrasena(tenantID string, id int64, nuevaHash string) error {
	_, err := r.DB.Exec(
		"UPDATE usuarios SET contrasena = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3",
		nuevaHash, id, tenantID,
	)
	return err
}

func (r *AuthRepo) ActualizarUltimoLogin(tenantID string, id int64) {
	r.DB.Exec("UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1 AND tenant_id = $2", id, tenantID)
}

// ============ SUPERADMINS ============

func (r *AuthRepo) ObtenerSuperAdminPorCorreo(correo string) (*auth.SuperAdmin, string, error) {
	var sa auth.SuperAdmin
	var hash string
	err := r.DB.QueryRow(`
		SELECT id, correo, nombre, apellidos, nivel, contrasena, activo, created_at, updated_at
		FROM superadmins WHERE correo = $1 AND activo = true
	`, correo).Scan(
		&sa.ID, &sa.Correo, &sa.Nombre, &sa.Apellidos,
		&sa.Nivel, &hash, &sa.Activo, &sa.CreatedAt, &sa.UpdatedAt,
	)
	if err != nil {
		return nil, "", err
	}
	return &sa, hash, nil
}

func (r *AuthRepo) ObtenerSuperAdminPorID(id int) (*auth.SuperAdmin, error) {
	var sa auth.SuperAdmin
	err := r.DB.QueryRow(`
		SELECT id, correo, nombre, apellidos, nivel, activo, created_at, updated_at
		FROM superadmins WHERE id = $1 AND activo = true
	`, id).Scan(
		&sa.ID, &sa.Correo, &sa.Nombre, &sa.Apellidos,
		&sa.Nivel, &sa.Activo, &sa.CreatedAt, &sa.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sa, nil
}

// ============ TOKENS RECUPERACION ============

func (r *AuthRepo) CrearTokenRecuperacion(tenantID string, usuarioID int64, token string, expira time.Time) error {
	// Invalidar tokens anteriores
	r.DB.Exec("UPDATE tokens_recuperacion SET usado = true WHERE usuario_id = $1 AND tenant_id = $2 AND usado = false",
		usuarioID, tenantID)

	_, err := r.DB.Exec(`
		INSERT INTO tokens_recuperacion (tenant_id, usuario_id, token, expires_at)
		VALUES ($1, $2, $3, $4)
	`, tenantID, usuarioID, token, expira)
	return err
}

func (r *AuthRepo) ValidarTokenRecuperacion(tenantID, token string) (*auth.TokenRecuperacion, error) {
	var t auth.TokenRecuperacion
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, usuario_id, token, expires_at, usado, created_at
		FROM tokens_recuperacion
		WHERE tenant_id = $1 AND token = $2 AND usado = false AND expires_at > NOW()
	`, tenantID, token).Scan(
		&t.ID, &t.TenantID, &t.UsuarioID, &t.Token, &t.ExpiresAt, &t.Usado, &t.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *AuthRepo) MarcarTokenUsado(id int64) error {
	_, err := r.DB.Exec("UPDATE tokens_recuperacion SET usado = true WHERE id = $1", id)
	return err
}

// ============ LOGIN POR PIN (POS) ============

func (r *AuthRepo) ObtenerUsuarioPorPin(tenantID string, localID int, pin string) (*auth.Usuario, error) {
	var u auth.Usuario
	err := r.DB.QueryRow(`
		SELECT id, tenant_id, local_id, correo, COALESCE(numero_celular, ''), nombre, apellidos,
			rol, COALESCE(pin_acceso, ''), activo, deleted_at, ultimo_login, created_at, updated_at
		FROM usuarios
		WHERE tenant_id = $1 AND local_id = $2 AND pin_acceso = $3
			AND deleted_at IS NULL AND activo = true
	`, tenantID, localID, pin).Scan(
		&u.ID, &u.TenantID, &u.LocalID, &u.Correo, &u.NumeroCelular,
		&u.Nombre, &u.Apellidos, &u.Rol, &u.PinAcceso,
		&u.Activo, &u.DeletedAt, &u.UltimoLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// ContarUsuariosPorTenant cuenta usuarios activos para verificar límites del plan
func (r *AuthRepo) ContarUsuariosPorTenant(tenantID string) (int, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM usuarios WHERE tenant_id = $1 AND deleted_at IS NULL AND activo = true",
		tenantID,
	).Scan(&count)
	return count, err
}
