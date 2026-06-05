# Security Baseline: OWASP + ISO 27001

This document defines the minimum security baseline for the whole RestauFlow project (backend, frontend, infrastructure, and operations).

## 1) Scope

- Backend API (Go + Gin)
- Frontend SPA (React + Vite + Nginx)
- Data layer (PostgreSQL + Redis)
- Runtime and deployment (Docker Compose)
- Operations and governance

## 2) OWASP Coverage

### A01: Broken Access Control
- JWT auth middleware validates identity and active status.
- Tenant middleware enforces tenant isolation before business routes.
- Role middleware enforces RBAC by route.
- Plan middleware enforces feature access by subscription.

### A02: Cryptographic Failures
- Password hashing uses bcrypt.
- App-level encryption uses AES-256-GCM.
- Secrets are loaded from environment variables (no hardcoded production secrets).
- HttpOnly cookies are used for tokens.

### A03: Injection
- Repository pattern uses parameterized SQL.
- Host header allowlist blocks invalid host values.
- Request URL checks in frontend block unsafe absolute URLs and traversal patterns.

### A04: Insecure Design
- API request body size cap (MaxBodyBytes middleware).
- API and auth route rate limiting with Redis sliding window.
- Blacklist middleware for blocked IP addresses.

### A05: Security Misconfiguration
- Security headers on backend and frontend nginx.
- CORS allowlist configuration via environment.
- Trusted proxy ranges configured explicitly.
- Nginx server tokens disabled.

### A06: Vulnerable and Outdated Components
- Dependency versions pinned in go.mod and package.json.
- Action required: run periodic dependency scanning (SCA) in CI.

### A07: Identification and Authentication Failures
- Access token short TTL plus refresh token flow.
- Login and recovery endpoints are rate limited.
- Password policy enforces length and complexity categories.

### A08: Software and Data Integrity Failures
- Action required: enforce signed images and immutable tag policy in CI/CD.
- Action required: add integrity checks for build artifacts.

### A09: Security Logging and Monitoring Failures
- Request logging includes request id and status.
- Panic/error middleware avoids leaking stack traces to clients.
- Action required: centralize logs and alerting (SIEM).

### A10: Server-Side Request Forgery (SSRF)
- No direct user-controlled outbound fetch flow by default.
- Action required: add explicit outbound allowlist if external callbacks are introduced.

## 3) ISO 27001 Controls Mapping (practical)

- A.5 Information security policies:
  - This baseline document + operational runbooks.
- A.6 Organization of information security:
  - Ownership per service and security review in pull requests.
- A.8 Asset management:
  - Inventory of services, DB, Redis, volumes, and secrets.
- A.9 Access control:
  - RBAC roles and least privilege per route.
- A.10 Cryptography:
  - JWT secrets and AES key management in env/secret store.
- A.12 Operations security:
  - Rate limit, body limits, backups, health checks, and hardening headers.
- A.13 Communications security:
  - HTTPS required in production, secure cookie usage.
- A.14 System acquisition/development/maintenance:
  - Security middleware and validation checks in codebase.
- A.16 Incident management:
  - Action required: documented incident process and response SLA.
- A.17 Business continuity:
  - DB backups and restore test procedure.
- A.18 Compliance:
  - Action required: periodic evidence collection and control review.

## 4) Mandatory Environment Configuration

Set these variables in production:

- ENV=production
- JWT_SECRET and JWT_REFRESH_SECRET (>= 32 chars)
- ENCRYPTION_KEY
- CORS_ORIGIN (comma-separated allowlist)
- ALLOWED_HOSTS (comma-separated allowlist)
- MAX_REQUEST_BODY_BYTES
- DB_PASSWORD and REDIS_PASSWORD (strong and rotated)

## 5) Operational Checklist

- [ ] Enforce TLS certificates and HTTPS redirect at edge.
- [ ] Rotate secrets every 90 days.
- [ ] Run dependency scan on each PR.
- [ ] Run SAST + secret scanning on each PR.
- [ ] Centralize logs and set security alerts.
- [ ] Validate backup restore every month.
- [ ] Review RBAC and dormant users monthly.
- [ ] Run yearly risk assessment and control audit.

## 6) Evidence for Audits

Keep these artifacts for ISO 27001 evidence:

- Security policy documents and approvals.
- Access review reports.
- Vulnerability scan reports and remediation tickets.
- Backup restore test reports.
- Incident drill records.
- Change management records tied to pull requests.
