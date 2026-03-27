#!/bin/bash
# ==========================================
# RestauFlow SaaS — Backup PostgreSQL
# Ejecutado por el cron job de backup
# ==========================================

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/tmp/restauflow_backup_${TIMESTAMP}.sql.gz"

echo "[BACKUP] Iniciando backup de ${DB_NAME}..."

# Crear backup con pg_dump
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    --no-owner --no-acl --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[BACKUP] Backup creado: ${BACKUP_FILE}"

# Verificar tamaño
FILESIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}")
echo "[BACKUP] Tamaño: ${FILESIZE} bytes"

# Subir a B2 (Backblaze) si está configurado
if [ -n "${B2_APPLICATION_KEY_ID:-}" ] && [ -n "${B2_APPLICATION_KEY:-}" ]; then
    echo "[BACKUP] Subiendo a Backblaze B2..."
    b2 upload-file "${B2_BUCKET_NAME}" "${BACKUP_FILE}" "backups/restauflow_backup_${TIMESTAMP}.sql.gz"
    echo "[BACKUP] Subido exitosamente a B2"
fi

# Limpiar archivo temporal
rm -f "${BACKUP_FILE}"

echo "[BACKUP] Proceso completado"
