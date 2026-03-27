package jobs

import (
	"database/sql"
	"log"
)

// ==========================================
// Job: Limpiar Tokens Expirados
// Se ejecuta todos los días a las 03:00
// Elimina tokens de recuperación expirados
// y sesiones de refresh vencidas
// ==========================================

func LimpiarTokensExpiradosJob(db *sql.DB) {
	// 1. Eliminar tokens de recuperación expirados
	resultado, err := db.Exec(`
		DELETE FROM tokens_recuperacion
		WHERE expira_en < NOW()
	`)
	if err != nil {
		log.Printf("[JOB] Error limpiando tokens de recuperación: %v", err)
	} else {
		filas, _ := resultado.RowsAffected()
		if filas > 0 {
			log.Printf("[JOB] %d tokens de recuperación expirados eliminados", filas)
		}
	}

	// 2. Eliminar tokens de recuperación ya usados (más de 24h)
	resultado, err = db.Exec(`
		DELETE FROM tokens_recuperacion
		WHERE usado = true
			AND created_at < NOW() - INTERVAL '24 hours'
	`)
	if err != nil {
		log.Printf("[JOB] Error limpiando tokens usados: %v", err)
	} else {
		filas, _ := resultado.RowsAffected()
		if filas > 0 {
			log.Printf("[JOB] %d tokens usados eliminados", filas)
		}
	}

	// 3. Limpiar audit_log antiguo (más de 90 días en producción)
	resultado, err = db.Exec(`
		DELETE FROM audit_log
		WHERE created_at < NOW() - INTERVAL '90 days'
	`)
	if err != nil {
		log.Printf("[JOB] Error limpiando audit_log antiguo: %v", err)
	} else {
		filas, _ := resultado.RowsAffected()
		if filas > 0 {
			log.Printf("[JOB] %d registros de audit_log antiguos eliminados", filas)
		}
	}
}
