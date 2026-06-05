# Credenciales Reales (Sin Demo)

Este archivo contiene credenciales de prueba para entorno local del portafolio.

## Reglas

- Todo login va por BD -> backend -> frontend.
- No usar cuentas demo ni bypass en frontend.
- El campo `Codigo de restaurante` acepta `slug` o `UUID` del tenant.

## SuperAdmin

- Codigo de restaurante: `superadmin`
- Correo: `superadmin@restauflow.com`
- Contrasena: `SuperAdmin.2026!`

## Restaurante 1 - La Buena Mesa

- Slug: `la-buena-mesa`
- UUID: `22222222-2222-2222-2222-222222222222`

Usuarios:

- ADMIN: `admin@labuenamese.com` / `BuenaMesa.Admin2026!`
- GERENTE: `gerente@labuenamese.com` / `BuenaMesa.Gerente2026!`
- MESERO 1: `mesero1@labuenamese.com` / `BuenaMesa.Mesero2026!`
- MESERO 2: `mesero2@labuenamese.com` / `BuenaMesa.Mesero2.2026!`
- CAJERO: `cajero@labuenamese.com` / `BuenaMesa.Cajero2026!`
- COCINERO: `cocinero@labuenamese.com` / `BuenaMesa.Cocina2026!`

## Restaurante 2 - El Rincon Criollo

- Slug: `rincon-criollo`
- UUID: `33333333-3333-3333-3333-333333333333`

Usuarios:

- ADMIN: `admin@rinconcriollo.com` / `Criollo.Admin2026!`
- MESERO 1: `mesero1@rinconcriollo.com` / `Criollo.Mesero2026!`
- MESERO 2: `mesero2@rinconcriollo.com` / `Criollo.Mesero2.2026!`
- CAJERO: `cajero@rinconcriollo.com` / `Criollo.Cajero2026!`
- COCINERO 1: `cocinero1@rinconcriollo.com` / `Criollo.Cocina2026!`
- COCINERO 2: `cocinero2@rinconcriollo.com` / `Criollo.Cocina2.2026!`

## Restaurante 3 - Sabor Marino

- Slug: `sabor-marino`
- UUID: `44444444-4444-4444-4444-444444444444`

Usuarios:

- ADMIN: `admin@sabormarino.com` / `Marino.Admin2026!`
- MESERO: `mesero@sabormarino.com` / `Marino.Mesero2026!`
- CAJERO: `cajero@sabormarino.com` / `Marino.Cajero2026!`
- COCINERO: `cocinero@sabormarino.com` / `Marino.Cocina2026!`

## Notas tecnicas

- Hashes de contrasena en BD: bcrypt costo 14 generado por Go (`golang.org/x/crypto/bcrypt`).
- Login publico ahora resuelve tenant desde `tenant_slug`/`tenant_id` (body, header o query).
- En local HTTP, cookies auth no usan `Secure`; en HTTPS si usan `Secure`.
