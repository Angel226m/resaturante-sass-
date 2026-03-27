package jobs

import (
	"database/sql"
	"log"
	"time"
)

// ==========================================
// Job: Generar Resumen Diario
// Se ejecuta todos los días a las 23:55
// Genera resumen del día para todos los locales activos
// ==========================================

func GenerarResumenDiarioJob(db *sql.DB) {
	fecha := time.Now().Format("2006-01-02")

	// Obtener todos los locales activos de todos los tenants
	rows, err := db.Query(`
		SELECT l.tenant_id, l.id
		FROM locales l
		JOIN tenants t ON l.tenant_id = t.id
		WHERE l.activo = true AND t.estado = 'activo' AND l.deleted_at IS NULL
	`)
	if err != nil {
		log.Printf("[JOB] Error obteniendo locales: %v", err)
		return
	}
	defer rows.Close()

	var procesados, errores int
	for rows.Next() {
		var tenantID string
		var localID int
		if err := rows.Scan(&tenantID, &localID); err != nil {
			errores++
			continue
		}

		if err := generarResumenParaLocal(db, tenantID, localID, fecha); err != nil {
			log.Printf("[JOB] Error generando resumen tenant=%s local=%d: %v", tenantID, localID, err)
			errores++
		} else {
			procesados++
		}
	}

	log.Printf("[JOB] Resumen diario completado: %d procesados, %d errores", procesados, errores)
}

func generarResumenParaLocal(db *sql.DB, tenantID string, localID int, fecha string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Set tenant context para RLS
	if _, err = tx.Exec("SET LOCAL app.tenant_id = $1", tenantID); err != nil {
		return err
	}

	// Totales de ordenes del día
	var totalVentas, totalPropinas, totalDescuentos float64
	var numOrdenes, numMesa, numDelivery, numLlevar, clientesNuevos int

	_ = tx.QueryRow(`
		SELECT COALESCE(SUM(total), 0),
		       COALESCE(SUM(propina), 0),
		       COALESCE(SUM(descuento_total), 0),
		       COUNT(*),
		       COUNT(*) FILTER (WHERE tipo IN ('mesa','barra')),
		       COUNT(*) FILTER (WHERE tipo = 'delivery'),
		       COUNT(*) FILTER (WHERE tipo = 'para_llevar')
		FROM ordenes
		WHERE local_id = $1 AND DATE(created_at) = $2
		  AND estado NOT IN ('cancelada')
	`, localID, fecha).Scan(
		&totalVentas, &totalPropinas, &totalDescuentos,
		&numOrdenes, &numMesa, &numDelivery, &numLlevar,
	)

	// Clientes nuevos
	_ = tx.QueryRow(`
		SELECT COUNT(DISTINCT o.cliente_id)
		FROM ordenes o
		JOIN clientes c ON c.id = o.cliente_id AND c.tenant_id = o.tenant_id
		WHERE o.local_id = $1 AND DATE(o.created_at) = $2
		  AND o.estado NOT IN ('cancelada') AND o.cliente_id IS NOT NULL
		  AND DATE(c.created_at) = $2
	`, localID, fecha).Scan(&clientesNuevos)

	// Costo insumos consumidos
	var costoInsumos float64
	_ = tx.QueryRow(`
		SELECT COALESCE(SUM(ABS(cantidad) * COALESCE(costo_unitario, 0)), 0)
		FROM movimientos_inventario
		WHERE local_id = $1 AND DATE(created_at) = $2
		  AND tipo = 'salida_produccion'
	`, localID, fecha).Scan(&costoInsumos)

	// Producto más vendido
	var prodID sql.NullInt64
	var cantProd int
	_ = tx.QueryRow(`
		SELECT io.producto_id, SUM(io.cantidad)::int AS cant
		FROM items_orden io
		JOIN ordenes o ON o.id = io.orden_id AND o.tenant_id = io.tenant_id
		WHERE o.local_id = $1 AND DATE(o.created_at) = $2
		  AND o.estado NOT IN ('cancelada')
		GROUP BY io.producto_id ORDER BY cant DESC LIMIT 1
	`, localID, fecha).Scan(&prodID, &cantProd)

	// Cálculos
	ticketPromedio := 0.0
	if numOrdenes > 0 {
		ticketPromedio = totalVentas / float64(numOrdenes)
	}
	margenBruto := totalVentas - costoInsumos

	// UPSERT resumen diario
	_, err = tx.Exec(`
		INSERT INTO resumen_diario (
			tenant_id, local_id, fecha, total_ventas, numero_ordenes,
			numero_ordenes_mesa, numero_ordenes_delivery, numero_ordenes_llevar,
			ticket_promedio, total_propinas, total_descuentos,
			clientes_nuevos, costo_insumos, margen_bruto,
			producto_mas_vendido_id, cantidad_producto_mas_vendido
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
		ON CONFLICT (tenant_id, local_id, fecha) DO UPDATE SET
			total_ventas = EXCLUDED.total_ventas,
			numero_ordenes = EXCLUDED.numero_ordenes,
			numero_ordenes_mesa = EXCLUDED.numero_ordenes_mesa,
			numero_ordenes_delivery = EXCLUDED.numero_ordenes_delivery,
			numero_ordenes_llevar = EXCLUDED.numero_ordenes_llevar,
			ticket_promedio = EXCLUDED.ticket_promedio,
			total_propinas = EXCLUDED.total_propinas,
			total_descuentos = EXCLUDED.total_descuentos,
			clientes_nuevos = EXCLUDED.clientes_nuevos,
			costo_insumos = EXCLUDED.costo_insumos,
			margen_bruto = EXCLUDED.margen_bruto,
			producto_mas_vendido_id = EXCLUDED.producto_mas_vendido_id,
			cantidad_producto_mas_vendido = EXCLUDED.cantidad_producto_mas_vendido,
			updated_at = NOW()
	`, tenantID, localID, fecha, totalVentas, numOrdenes,
		numMesa, numDelivery, numLlevar,
		ticketPromedio, totalPropinas, totalDescuentos,
		clientesNuevos, costoInsumos, margenBruto,
		prodID, cantProd,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}
