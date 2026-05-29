# ═══════════════════════════════════════════════════════════
# RestauFlow Frontend — Multi-stage Dockerfile
# Hardened: non-root, minimal surface, OWASP
# ═══════════════════════════════════════════════════════════

# Stage 1: Dependencies (reproducible install)
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: prevents postinstall scripts from running arbitrary code
# --no-audit: skip network audit (run separately in CI)
RUN npm ci --ignore-scripts --no-audit --prefer-offline

# Stage 2: Build (type-check + bundle)
FROM node:22-alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production with nginx (hardened)
FROM nginx:1.27-alpine AS production

# Remove default configs and unnecessary files
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/* \
    && addgroup -g 1001 -S appgroup || true \
    && adduser -u 1001 -S appuser -G appgroup || true \
    && mkdir -p /var/cache/nginx /var/log/nginx /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /usr/share/nginx/html \
    && touch /run/nginx.pid && chown appuser:appgroup /run/nginx.pid

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Run as non-root (OWASP)
USER appuser:appgroup

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
