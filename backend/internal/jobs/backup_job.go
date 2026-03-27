package jobs

import (
	"log"
	"os/exec"

	"github.com/restauflow/backend/internal/config"
)

// ==========================================
// Job: Backup de base de datos
// Se ejecuta todos los días a las 02:00 (solo producción)
// Ejecuta pg_dump y sube a almacenamiento externo
// ==========================================

func EjecutarBackupJob(cfg *config.Config) {
	// Ejecutar script de backup si existe
	cmd := exec.Command("/bin/sh", "/app/scripts/backup-postgres-to-b2.sh")
	cmd.Env = append(cmd.Env,
		"DB_HOST="+cfg.DBHost,
		"DB_PORT="+cfg.DBPort,
		"DB_NAME="+cfg.DBName,
		"DB_USER="+cfg.DBUser,
		"PGPASSWORD="+cfg.DBPassword,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("[JOB] Error ejecutando backup: %v\nOutput: %s", err, string(output))
		return
	}

	log.Printf("[JOB] Backup completado exitosamente")
}
