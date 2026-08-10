# ANSTAT AI ENGINE — Frontend Architecture Specification

## 1. Overview
ANSTAT AI ENGINE is built using Next.js App Router (TypeScript strict mode) and Tailwind CSS with custom ANSTAT design tokens. The application enforces complete separation between UI rendering and backend communication through a clean Service Registry factory pattern (`lib/services/registry.ts`).

## 2. Layering & Boundaries
```
                     +----------------------------------+
                     |    Next.js Page (Server Comp)    |
                     +----------------------------------+
                                      |
                     +----------------------------------+
                     |    Interactive UI Components     |
                     |          ("use client")          |
                     +----------------------------------+
                                      |
                     +----------------------------------+
                     |    Service Factory Registry      |
                     |     (lib/services/registry.ts)   |
                     +----------------------------------+
                                      |
                +---------------------+---------------------+
                |                                           |
    +-----------------------+                   +-----------------------+
    |  Mock Service Layer   |                   |   Future REST/GraphQL |
    | (lib/services/mock/*) |                   |    API Services Layer |
    +-----------------------+                   +-----------------------+
                |                                           |
    +-----------------------+                   +-----------------------+
    |   Seed Mock Data      |                   |    Live Backend API   |
    |  (lib/mock/seed.ts)   |                   |    Endpoints          |
    +-----------------------+                   +-----------------------+
```

## 3. Server vs. Client Boundary Guidelines
- **Server Components (Default)**: Page wrappers, layout structures, initial server-side data fetching via `getAuthService()`, `getProposalService()`, etc.
- **Client Components (`"use client"`)**: Interactive forms, modal dialogs, drawers, command palette (`CMD+K`), code diff viewer, log terminal streams, and toast notifications.

## 4. Design Token Architecture
All styling consumes CSS custom properties defined in `app/globals.css`:
- Primary Emerald Accent: `#059669` / `hsl(var(--primary))`
- Surface Cards: `#FFFFFF` / `hsl(var(--surface))`
- Background Page: `#F8FAFC` / `hsl(var(--background))`
- Technical Borders: `#E2E8F0` / `hsl(var(--border))`
- High Contrast Text: `#0F172A` / `hsl(var(--foreground))`
