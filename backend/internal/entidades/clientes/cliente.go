package clientes

import "time"

// ==========================================
// Entidad: Cliente
// RestauFlow SaaS Multi-Tenant
// ==========================================

// Cliente cliente del restaurante
type Cliente struct {
	ID              int64      `json:"id_cliente"           db:"id"`
	TenantID        string     `json:"tenant_id"            db:"tenant_id"`
	LocalID         int        `json:"local_id"             db:"local_id"`
	Nombres         string     `json:"nombres"              db:"nombres"`
	Apellidos       string     `json:"apellidos"            db:"apellidos"`
	TipoDocumento   string     `json:"tipo_documento"       db:"tipo_documento"`
	NumeroDocumento string     `json:"numero_documento"     db:"numero_documento"`
	Correo          string     `json:"correo,omitempty"     db:"correo"`
	Celular         string     `json:"celular,omitempty"    db:"celular"`
	FechaNacimiento *time.Time `json:"fecha_nacimiento,omitempty" db:"fecha_nacimiento"`
	Genero          string     `json:"genero,omitempty"     db:"genero"`
	TotalCompras    float64    `json:"total_compras"        db:"total_compras"`
	CantidadVisitas int        `json:"cantidad_visitas"     db:"cantidad_visitas"`
	UltimaVisita    *time.Time `json:"ultima_visita,omitempty" db:"ultima_visita"`
	Notas           string     `json:"notas,omitempty"      db:"notas"`
	Activo          bool       `json:"activo"               db:"activo"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	CreatedAt       time.Time  `json:"created_at"           db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"           db:"updated_at"`
	// Campos cifrados originales
	CorreoCifrado    string `json:"-" db:"correo_cifrado"`
	CelularCifrado   string `json:"-" db:"celular_cifrado"`
	DocumentoCifrado string `json:"-" db:"documento_cifrado"`
	// Campos virtuales
	Direcciones    []DireccionCliente `json:"direcciones,omitempty" db:"-"`
	NombreCompleto string             `json:"nombre_completo,omitempty" db:"-"`
}

// NuevoClienteRequest request para crear cliente
type NuevoClienteRequest struct {
	LocalID         int        `json:"local_id"         validate:"required"`
	Nombres         string     `json:"nombres"          validate:"required,min=2,max=100"`
	Apellidos       string     `json:"apellidos"        validate:"required,min=2,max=100"`
	TipoDocumento   string     `json:"tipo_documento"   validate:"required"`
	NumeroDocumento string     `json:"numero_documento" validate:"required"`
	Correo          string     `json:"correo"`
	Celular         string     `json:"celular"`
	FechaNacimiento *time.Time `json:"fecha_nacimiento"`
	Genero          string     `json:"genero"`
	Notas           string     `json:"notas"`
}

// ActualizarClienteRequest request para actualizar cliente
type ActualizarClienteRequest struct {
	Nombres         string     `json:"nombres"`
	Apellidos       string     `json:"apellidos"`
	TipoDocumento   string     `json:"tipo_documento"`
	NumeroDocumento string     `json:"numero_documento"`
	Correo          string     `json:"correo"`
	Celular         string     `json:"celular"`
	FechaNacimiento *time.Time `json:"fecha_nacimiento"`
	Genero          string     `json:"genero"`
	Notas           string     `json:"notas"`
	Activo          *bool      `json:"activo"`
}

// BuscarClienteRequest request para buscar clientes
type BuscarClienteRequest struct {
	Termino   string `json:"termino"` // búsqueda por nombre, documento, correo, celular
	LocalID   int    `json:"local_id"`
	Pagina    int    `json:"pagina"`
	PorPagina int    `json:"por_pagina"`
}
