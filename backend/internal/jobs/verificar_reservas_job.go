package jobs

import (
	"database/sql"
	"log"
)

// ==========================================
// Job: Verificar Reservas Vencidas
// Se ejecuta cada 15 minutos
// Marca como "no_asistio" las reservas confirmadas
// cuya hora de fin ya pasó
// ==========================================

func VerificarReservasVencidasJob(db *sql.DB) {
	// Marcar como no_asistio las reservas confirmadas cuya hora ya pasó
	resultado, err := db.Exec(`
		UPDATE reservas
		SET estado = 'no_asistio', updated_at = NOW()
		WHERE estado IN ('pendiente', 'confirmada')
			AND (fecha_reserva + hora_fin::time) < NOW() - INTERVAL '30 minutes'
	`)
	if err != nil {
		log.Printf("[JOB] Error actualizando reservas vencidas: %v", err)
		return
	}

	filas, _ := resultado.RowsAffected()
	if filas > 0 {
		log.Printf("[JOB] %d reservas marcadas como no_asistio", filas)
	}

	// Liberar mesas de reservas que pasaron a no_asistio
	resultado, err = db.Exec(`
		UPDATE mesas m
		SET estado = 'disponible', updated_at = NOW()
		FROM reservas r
		WHERE r.mesa_id = m.id
			AND r.tenant_id = m.tenant_id
			AND r.estado = 'no_asistio'
			AND m.estado = 'reservada'
			AND r.updated_at > NOW() - INTERVAL '5 minutes'
	`)
	if err != nil {
		log.Printf("[JOB] Error liberando mesas de reservas vencidas: %v", err)
	} else {
		filas, _ := resultado.RowsAffected()
		if filas > 0 {
			log.Printf("[JOB] %d mesas liberadas de reservas vencidas", filas)
		}
	}
}
