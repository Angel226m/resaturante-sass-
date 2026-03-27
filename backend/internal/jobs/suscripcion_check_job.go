package jobs

import (
	"database/sql"
	"log"
	"time"
)

// ==========================================
// Job: Verificar Suscripciones
// Se ejecuta todos los días a las 00:30
// Desactiva tenants con suscripción vencida,
// marca suscripciones expiradas, notifica próximas a vencer
// ==========================================

func VerificarSuscripcionesJob(db *sql.DB) {
	ahora := time.Now()
	hoy := ahora.Format("2006-01-02")

	// 1. Marcar suscripciones vencidas como "vencida"
	resultado, err := db.Exec(`
		UPDATE suscripciones
		SET estado = 'vencida', updated_at = NOW()
		WHERE estado = 'activa'
			AND fecha_fin < $1
	`, hoy)
	if err != nil {
		log.Printf("[JOB] Error marcando suscripciones vencidas: %v", err)
	} else {
		filas, _ := resultado.RowsAffected()
		if filas > 0 {
			log.Printf("[JOB] %d suscripciones marcadas como vencidas", filas)
		}
	}

	// 2. Desactivar tenants cuya suscripción activa venció
	resultado, err = db.Exec(`
		UPDATE tenants t
		SET activo = false, updated_at = NOW()
		WHERE t.activo = true
			AND NOT EXISTS (
				SELECT 1 FROM suscripciones s
				WHERE s.tenant_id = t.id
					AND s.estado = 'activa'
			)
			AND EXISTS (
				SELECT 1 FROM suscripciones s
				WHERE s.tenant_id = t.id
					AND s.estado = 'vencida'
			)
	`)
	if err != nil {
		log.Printf("[JOB] Error desactivando tenants: %v", err)
	} else {
		filas, _ := resultado.RowsAffected()
		if filas > 0 {
			log.Printf("[JOB] %d tenants desactivados por suscripción vencida", filas)
		}
	}

	// 3. Registrar suscripciones a punto de vencer (7 días)
	enSieteDias := ahora.AddDate(0, 0, 7).Format("2006-01-02")
	rows, err := db.Query(`
		SELECT s.id, s.tenant_id, t.nombre_comercial, s.fecha_fin
		FROM suscripciones s
		JOIN tenants t ON s.tenant_id = t.id
		WHERE s.estado = 'activa'
			AND s.fecha_fin BETWEEN $1 AND $2
	`, hoy, enSieteDias)
	if err != nil {
		log.Printf("[JOB] Error consultando suscripciones próximas a vencer: %v", err)
		return
	}
	defer rows.Close()

	var proximasVencer int
	for rows.Next() {
		var suscID int
		var tenantID, nombre string
		var fechaFin time.Time
		rows.Scan(&suscID, &tenantID, &nombre, &fechaFin)
		diasRestantes := int(time.Until(fechaFin).Hours() / 24)
		log.Printf("[JOB] Suscripción próxima a vencer: %s (%s) - %d días restantes", nombre, tenantID, diasRestantes)
		proximasVencer++
	}

	if proximasVencer > 0 {
		log.Printf("[JOB] %d suscripciones próximas a vencer (7 días)", proximasVencer)
	}
}
