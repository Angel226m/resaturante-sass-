package utils

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

// ==========================================
// WebSocket Hub — comunicación en tiempo real
// RestauFlow SaaS Multi-Tenant
// ==========================================

// WSMessage es un mensaje WebSocket genérico
type WSMessage struct {
	Tipo    string      `json:"tipo"`
	Canal   string      `json:"canal"`
	Data    interface{} `json:"data"`
	EventID string      `json:"event_id,omitempty"`
}

// Cliente representa una conexión WebSocket
type WSCliente struct {
	Hub      *WSHub
	Conn     *websocket.Conn
	Send     chan []byte
	TenantID string
	Canal    string
}

// WSHub mantiene las conexiones activas y distribuye mensajes
type WSHub struct {
	// Clientes registrados por canal: canal → set de clientes
	clientes map[string]map[*WSCliente]bool

	// Canal para registrar nuevos clientes
	registrar chan *WSCliente

	// Canal para desregistrar clientes
	desregistrar chan *WSCliente

	// Canal para enviar mensajes a un canal específico
	broadcast chan WSMessage

	mu sync.RWMutex
}

var (
	hubInstance *WSHub
	hubOnce     sync.Once
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // En producción, validar origen
	},
}

// GetWSHub retorna la instancia singleton del hub
func GetWSHub() *WSHub {
	hubOnce.Do(func() {
		hubInstance = &WSHub{
			clientes:     make(map[string]map[*WSCliente]bool),
			registrar:    make(chan *WSCliente),
			desregistrar: make(chan *WSCliente),
			broadcast:    make(chan WSMessage, 256),
		}
	})
	return hubInstance
}

// Ejecutar inicia el loop principal del hub
func (h *WSHub) Ejecutar() {
	for {
		select {
		case cliente := <-h.registrar:
			h.mu.Lock()
			if h.clientes[cliente.Canal] == nil {
				h.clientes[cliente.Canal] = make(map[*WSCliente]bool)
			}
			h.clientes[cliente.Canal][cliente] = true
			h.mu.Unlock()
			log.Printf("[WS] Cliente conectado al canal: %s", cliente.Canal)

		case cliente := <-h.desregistrar:
			h.mu.Lock()
			if clientes, ok := h.clientes[cliente.Canal]; ok {
				if _, exists := clientes[cliente]; exists {
					delete(clientes, cliente)
					close(cliente.Send)
					if len(clientes) == 0 {
						delete(h.clientes, cliente.Canal)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WS] Cliente desconectado del canal: %s", cliente.Canal)

		case mensaje := <-h.broadcast:
			h.mu.RLock()
			if clientes, ok := h.clientes[mensaje.Canal]; ok {
				data, err := json.Marshal(mensaje)
				if err != nil {
					h.mu.RUnlock()
					continue
				}
				for cliente := range clientes {
					select {
					case cliente.Send <- data:
					default:
						// Cliente lento, cerrar conexión
						close(cliente.Send)
						delete(clientes, cliente)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Publicar envía un mensaje a todos los clientes de un canal
func (h *WSHub) Publicar(canal, tipo string, data interface{}) {
	h.broadcast <- WSMessage{
		Tipo:  tipo,
		Canal: canal,
		Data:  data,
	}
}

// PublicarOrdenCocina notifica nueva orden o cambio a pantalla de cocina
func (h *WSHub) PublicarOrdenCocina(tenantID string, localID int, data interface{}) {
	canal := canalCocina(tenantID, localID)
	h.Publicar(canal, "orden_cocina", data)
}

// PublicarEstadoMesa notifica cambio de estado de mesa
func (h *WSHub) PublicarEstadoMesa(tenantID string, localID int, data interface{}) {
	canal := canalMesas(tenantID, localID)
	h.Publicar(canal, "estado_mesa", data)
}

// PublicarDelivery notifica actualización de delivery
func (h *WSHub) PublicarDelivery(tenantID string, data interface{}) {
	canal := canalDelivery(tenantID)
	h.Publicar(canal, "delivery_update", data)
}

// HandleWebSocket maneja la conexión WebSocket entrante
func HandleWebSocket(hub *WSHub, tenantID, canal string, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Error al upgrade: %v", err)
		return
	}

	cliente := &WSCliente{
		Hub:      hub,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		TenantID: tenantID,
		Canal:    canal,
	}

	hub.registrar <- cliente

	// Goroutine para escribir mensajes al cliente
	go func() {
		defer func() {
			hub.desregistrar <- cliente
			conn.Close()
		}()
		for msg := range cliente.Send {
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		}
	}()

	// Goroutine para leer mensajes del cliente (keepalive)
	go func() {
		defer func() {
			hub.desregistrar <- cliente
			conn.Close()
		}()
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				return
			}
		}
	}()
}

// Helpers para nombres de canales
func canalCocina(tenantID string, localID int) string {
	return "orders:" + tenantID + ":" + strconv.Itoa(localID)
}

func canalMesas(tenantID string, localID int) string {
	return "tables:" + tenantID + ":" + strconv.Itoa(localID)
}

func canalDelivery(tenantID string) string {
	return "delivery:" + tenantID
}

// CanalCocinaStr genera el nombre del canal de cocina para un local
func CanalCocinaStr(tenantID string, localID int) string {
	return canalCocina(tenantID, localID)
}

// CanalMesasStr genera el nombre del canal de mesas para un local
func CanalMesasStr(tenantID string, localID int) string {
	return canalMesas(tenantID, localID)
}
