# Production System Architecture Blueprint — ANSTAT AI ENGINE

> **Phase 7 Blueprint Document**  
> *Target Stack: Next.js Standalone, Supabase PostgreSQL with RLS, Redis + BullMQ, AI Gateway, GitHub App, Ephemeral Execution Sandbox, Hostinger VPS & PM2.*

---

## 1. Executive Summary & System Overview

ANSTAT AI ENGINE transitions from a decoupled mock frontend prototype into a production-grade multi-tenant software delivery engine. 

```
                                  USER BROWSER (Zone 1)
                                           │
                                       HTTPS / WSS
                                           │
                                           ▼
                                 NGINX REVERSE PROXY
                                           │
                                           ▼
                            NEXT.JS STANDALONE / API LAYER (Zone 2)
                                 (Hostinger VPS / Node.js)
                                           │
                 ┌─────────────────────────┼─────────────────────────┐
                 │                         │                         │
                 ▼                         ▼                         ▼
          SUPABASE AUTH              POSTGRESQL (RLS)          REDIS / BULLMQ
       (Identity & Token)            (Zone 3 Source)           (Task Queue)
                 │                         │                         │
                 └─────────────────────────┼─────────────────────────┘
                                           │
                                           ▼
                                ASYNCHRONOUS WORKERS (Zone 4)
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            ▼                              ▼                              ▼
     AI GATEWAY ROUTER             GITHUB APP ENGINE              EPHEMERAL SANDBOX (Zone 5)
  (Anthropic / OpenAI API)       (Webhooks & Installations)    (Network Restricted Docker Container)
```

---

## 2. Production Stack Specification

| Component | Selected Technology | Production Role | Key Constraints & Rationale |
|---|---|---|---|
| **Web App & API** | Next.js 16 (App Router) | Host frontend & API Gateway endpoints | Standalone output bundle (`output: 'standalone'`). Runs under Node.js & PM2. |
| **Authentication** | Supabase Auth | User identity, JWT issuance, session management | Issues JWTs containing `user_id` and `organization_id` claims for RLS. |
| **Primary Database** | Supabase PostgreSQL 15+ | Relational data persistence | RLS policies enforced on all tables. Service role key strictly isolated to server workers. |
| **Task Queue** | Redis 7 + BullMQ | Asynchronous job queuing | Decouples web HTTP request cycle from long-running AI generation, SAST, and sandbox runs. |
| **Worker Engine** | Node.js Worker Processes | Background job execution | Logical process separation: `api-worker`, `ai-worker`, `github-worker`, `security-worker`, `sandbox-worker`. |
| **AI Gateway** | Custom `AIService` Router | Provider failover, token metering & redaction | Enforces prompt separation (System policy > User task > Repository content data). |
| **Git Integration** | GitHub App | Webhooks & installation tokens | Least-privilege permissions. Webhook signature verification mandatory. |
| **Code Execution** | Ephemeral Docker Container | Validation & test execution sandbox | Network restricted (`network: off`), CPU/Memory capped, non-root user, read-only base filesystem. |
| **Reverse Proxy** | Nginx | SSL termination & HTTP/2 routing | Listens on ports 80/443, proxies to local `127.0.0.1:3000`. |
| **Process Manager** | PM2 | Daemon process control & clustering | Auto-restarts server processes; logs to system daemon. |
| **Host Environment** | Hostinger VPS | Virtual Private Server host | Root access for system configuration, firewalling (UFW), and custom container isolation. |

---

## 3. Worker Topology & Decoupled Execution

Long-running operations NEVER block the HTTP request/response cycle:

```
[Browser Request] ──> [Next.js API Handler] ──> [Postgres: Create Job (queued)]
                                            └─> [Redis: Push Job Message]
                                                      │
                                                      ▼
                                            [BullMQ Worker Queue]
                                                      │
                                                      ▼
                                            [Isolated Worker Process]
                                                      │
                                     ┌────────────────┴────────────────┐
                                     ▼                                 ▼
                          [Executes Task / Sandbox]       [Postgres: Update Job (completed)]
```

---

## 4. Hostinger VPS Topology & Hardening

1. **UFW Firewall**: Allow ports `22` (SSH key authentication only), `80` (HTTP redirect to HTTPS), `443` (HTTPS). Block direct public access to `3000` (Next.js), `6379` (Redis), and `5432` (PostgreSQL).
2. **Operational User**: Run PM2 and Node.js applications under non-root system user `anstat-deploy`.
3. **Nginx Reverse Proxy**: Binds SSL certificate (Let's Encrypt / Certbot) and proxies traffic internally to `http://127.0.0.1:3000`.
