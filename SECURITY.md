# Security Policy — ANSTAT AI ENGINE

## 🛡️ Security Disclosures & Reporting

If you discover a potential security vulnerability within **ANSTAT AI ENGINE**, please report it responsibly by contacting the security team at `security@anstat.dev`.

Please do NOT create public GitHub issues for security vulnerabilities.

---

## 🔒 Current Sandbox & Secret Boundaries

1. **Zero Secret Storage**: This repository contains **NO** live API keys, OAuth client secrets, or private keys.
2. **Inert Content Rendering**: All generated code diffs and SAST evidence strings are rendered safely in text containers with zero execution privileges.
3. **Decoupled Mock Layer**: All external integrations (GitHub, AI Providers, CI/CD runners, SAST scanners) run inside deterministic mock services (`lib/services/mock/*`).
