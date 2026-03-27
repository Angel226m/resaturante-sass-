package utils

import (
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ==========================================
// Responses estandarizadas
// RestauFlow SaaS Multi-Tenant
// ==========================================

// APIResponse es la estructura estándar de respuesta
type APIResponse struct {
	Exito   bool        `json:"exito"`
	Mensaje string      `json:"mensaje"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// PaginacionResponse es la estructura de respuesta paginada
type PaginacionResponse struct {
	Exito      bool        `json:"exito"`
	Mensaje    string      `json:"mensaje"`
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Pagina     int         `json:"pagina"`
	Limite     int         `json:"limite"`
	TotalPages int         `json:"total_paginas"`
}

// SuccessResponse respuesta exitosa 200
func SuccessResponse(c *gin.Context, mensaje string, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{
		Exito:   true,
		Mensaje: mensaje,
		Data:    data,
	})
}

// CreatedResponse respuesta de creación 201
func CreatedResponse(c *gin.Context, mensaje string, data interface{}) {
	c.JSON(http.StatusCreated, APIResponse{
		Exito:   true,
		Mensaje: mensaje,
		Data:    data,
	})
}

// ErrorResponse respuesta de error con código HTTP
func ErrorResponse(c *gin.Context, statusCode int, mensaje string, err error) {
	respuesta := APIResponse{
		Exito:   false,
		Mensaje: mensaje,
	}
	if err != nil {
		respuesta.Error = err.Error()
	}
	c.JSON(statusCode, respuesta)
}

// BadRequest respuesta 400
func BadRequest(c *gin.Context, mensaje string, errs ...error) {
	var err error
	if len(errs) > 0 {
		err = errs[0]
	}
	ErrorResponse(c, http.StatusBadRequest, mensaje, err)
}

// Unauthorized respuesta 401
func Unauthorized(c *gin.Context, mensaje string) {
	ErrorResponse(c, http.StatusUnauthorized, mensaje, nil)
}

// Forbidden respuesta 403
func Forbidden(c *gin.Context, mensaje string) {
	ErrorResponse(c, http.StatusForbidden, mensaje, nil)
}

// NotFound respuesta 404
func NotFound(c *gin.Context, mensaje string) {
	ErrorResponse(c, http.StatusNotFound, mensaje, nil)
}

// Conflict respuesta 409
func Conflict(c *gin.Context, mensaje string) {
	ErrorResponse(c, http.StatusConflict, mensaje, nil)
}

// TooManyRequests respuesta 429
func TooManyRequests(c *gin.Context, retryAfter string) {
	c.Header("Retry-After", retryAfter)
	ErrorResponse(c, http.StatusTooManyRequests, "Demasiadas solicitudes, intente de nuevo más tarde", nil)
}

// InternalError respuesta 500
func InternalError(c *gin.Context, mensaje string, errs ...error) {
	var err error
	if len(errs) > 0 {
		err = errs[0]
	}
	ErrorResponse(c, http.StatusInternalServerError, mensaje, err)
}

// PaginatedResponse respuesta paginada 200
func PaginatedResponse(c *gin.Context, mensaje string, data interface{}, total int, pagina, limite int) {
	totalPages := int(math.Ceil(float64(total) / float64(limite)))
	c.JSON(http.StatusOK, PaginacionResponse{
		Exito:      true,
		Mensaje:    mensaje,
		Data:       data,
		Total:      total,
		Pagina:     pagina,
		Limite:     limite,
		TotalPages: totalPages,
	})
}

// NoContent respuesta 204
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}
