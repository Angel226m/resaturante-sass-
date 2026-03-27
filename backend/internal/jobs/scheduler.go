package jobs

import (
	"database/sql"
	"log"

	"github.com/redis/go-redis/v9"
	"github.com/restauflow/backend/internal/config"
	"github.com/robfig/cron/v3"
)

// ==========================================
// Scheduler: Inicializa todos los cron jobs
// ==========================================

func IniciarJobs(db *sql.DB, rdb *redis.Client, cfg *config.Config) *cron.Cron {
	c := cron.New(cron.WithSeconds())

	// Resumen diario — Todos los días a las 23:55
	c.AddFunc("0 55 23 * * *", func() {
		log.Println("[JOB] Generando resúmenes diarios...")
		GenerarResumenDiarioJob(db)
	})

	// Verificar suscripciones vencidas — Todos los días a las 00:30
	c.AddFunc("0 30 0 * * *", func() {
		log.Println("[JOB] Verificando suscripciones...")
		VerificarSuscripcionesJob(db)
	})

	// Limpieza de tokens expirados — Todos los días a las 03:00
	c.AddFunc("0 0 3 * * *", func() {
		log.Println("[JOB] Limpiando tokens expirados...")
		LimpiarTokensExpiradosJob(db)
	})

	// Verificar reservas vencidas — Cada 15 minutos
	c.AddFunc("0 */15 * * * *", func() {
		log.Println("[JOB] Verificando reservas vencidas...")
		VerificarReservasVencidasJob(db)
	})

	// Backup (solo en producción) — Todos los días a las 02:00
	if cfg.EsProduccion() {
		c.AddFunc("0 0 2 * * *", func() {
			log.Println("[JOB] Ejecutando backup...")
			EjecutarBackupJob(cfg)
		})
	}

	c.Start()
	log.Println("✓ Cron Jobs iniciados")
	return c
}
