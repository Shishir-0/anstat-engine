# Contributing to ANSTAT AI ENGINE

Thank you for your interest in contributing to **ANSTAT AI ENGINE**!

---

## 🏛️ Architectural Rules & Guidelines

1. **Strict Service Isolation**:
   - UI components MUST consume services strictly via `ServiceRegistry` (`lib/services/registry.ts`).
   - UI components MUST NEVER import mock singletons directly or perform raw `fetch()` calls.
2. **Code Execution Safety**:
   - Generated code or scanner evidence MUST be rendered as inert text strings.
   - NEVER use `eval()`, `new Function()`, `dangerouslySetInnerHTML`, or dynamic script imports.
3. **Rescan & Verification Rule**:
   - Security findings and code patches MUST pass validation gates before marking state transitions.
   - Only a clean security rescan can resolve a security finding.
4. **Branch Protection**:
   - Generated code is proposed through reviewable feature branches (e.g. `anstat/autofix-rbac-104`).
   - Direct modifications to default `main` branch are disabled.

---

## 🧪 Verification Commands

Before submitting code, ensure all automated verification commands pass cleanly:

```bash
# 1. Check linting rules
npm run lint

# 2. Run TypeScript compiler
npx tsc --noEmit

# 3. Build Next.js production bundle
npm run build
```

All 30 static and dynamic routes must compile with zero errors.
