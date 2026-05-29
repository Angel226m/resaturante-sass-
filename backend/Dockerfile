# ==========================================
# RestauFlow SaaS - Backend Dockerfile
# Hardened: non-root, minimal surface, OWASP
# ==========================================

# --- Etapa de compilación ---
FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -extldflags '-static'" \
    -tags netgo \
    -trimpath \
    -o /app/restauflow ./cmd/main.go

# --- Etapa final (distroless-like) ---
FROM alpine:3.21

# Instalar solo lo necesario: certs, timezone y wget (para healthcheck)
RUN apk add --no-cache ca-certificates tzdata wget \
    && addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup \
    && mkdir -p /app \
    && chown -R appuser:appgroup /app

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/restauflow .

# Run as non-root user (OWASP, ISO 27001)
USER appuser:appgroup

EXPOSE 8080

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./restauflow"]
