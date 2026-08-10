# Security Architecture & Trust Policy — ANSTAT AI ENGINE

## 1. Core Trust Boundaries

1. **Browser Code Execution Protection**:
   - The browser UI NEVER executes repository source code, generated AI patches, or scanner payloads.
   - All code diffs and findings evidence are treated as static text data.
2. **Deterministic Rescan Policy**:
   - Security findings cannot be marked `resolved` by AI patch generation alone.
   - A finding is marked `resolved` ONLY after a successful security rescan confirms zero active findings.
3. **Branch Protection Guard**:
   - AI-generated patches are proposed strictly to reviewable feature branches (`anstat/*`).
   - Direct modifications to default `main` branch are architecturally disabled.

---

## 2. Security Standards Matrix

- **CWE Integration**: Supports Common Weakness Enumeration references (`CWE-352`, `CWE-79`, `CWE-89`, `CWE-798`).
- **OWASP Integration**: Supports OWASP Top 10 categories (`OWASP A01:2021-Broken Access Control`, `OWASP A07:2021-Identification and Authentication Failures`).
