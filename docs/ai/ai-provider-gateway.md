# AI Provider Gateway, Model Routing & AI Economics — ANSTAT AI ENGINE

> **Phase 7 Step 4.2 Blueprint Document**  
> *Provider Abstraction, Model Router, Transactional Credit Lifecycle, Cost Accounting, and Security Boundaries.*

---

## 1. Architecture Overview

ANSTAT AI ENGINE uses a provider-agnostic infrastructure layer for all AI executions across product modules (**ProposalOS**, **Code Engine**, **Security Center**, **Debugging Hub**). 

No product module imports provider SDKs (`@google/genai`, `@anthropic-ai/sdk`, `openai`) directly. All requests pass through the central **AI Provider Gateway**.

```text
                    ANSTAT AI ENGINE
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      ProposalOS       Code Engine     Debugging Hub
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                      AIService
                           │
                           ▼
                     AI GATEWAY
                           │
             ┌─────────────┴─────────────┐
             │                           │
        ENTITLEMENT                  MODEL ROUTER
          ENGINE                         │
             │                    ┌──────┼──────┐
             │                    ▼      ▼      ▼
             │                  Gemini Claude OpenAI
             │                    │      │      │
             └────────────────────┴──────┴──────┘
                           │
                           ▼
                  COST + CREDIT ENGINE
                           │
                           ▼
                  USAGE / AI INVOCATIONS
                           │
                           ▼
                    SUPABASE POSTGRES
```

---

## 2. Transactional Credit Reservation & Invocation Lifecycle

AI execution follows an explicit, transaction-safe lifecycle to ensure zero race conditions, no negative balances, and no double charges:

```text
REQUESTED ──> AUTHORIZED ──> RESERVED ──> EXECUTING ──> SUCCEEDED ──> SETTLED
                                                │
                                                └──> FAILED ──> RELEASED / RECONCILED
```

1. **`REQUESTED`**: Client submits an `AIRequest` with an optional `requestId` (generated server-side if omitted).
2. **`AUTHORIZED`**: Gateway verifies user authorization and workspace subscription state (`active` or `trialing`).
3. **`RESERVED`**: Gateway estimates token cost and verifies remaining AI credit availability via `EntitlementService`.
4. **`EXECUTING`**: Provider Adapter executes inference against selected model.
5. **`SUCCEEDED` / `SETTLED`**: Actual token usage is parsed from provider metadata. Actual cost USD and AI credits are calculated and atomically deducted via PostgreSQL RPC `consume_quota_atomic`.
6. **`FAILED` / `RELEASED`**: If provider execution fails, credits reserved during authorization are released safely; zero credits are deducted for unconsumed executions.

---

## 3. Model Registry & Lifecycle Management

Models are registered in an isolated configuration file (`lib/services/ai/model-registry.ts`). Models support explicit lifecycle states:
- **`active`**: Model is live and available for routing.
- **`deprecated`**: Model is being phased out; fallback available.
- **`disabled`**: Model is offline; excluded from routing.

### Current Registered Models

| Provider | Model ID | Capabilities | Context Window | Input Cost ($/1M) | Output Cost ($/1M) | Status |
|---|---|---|---|---|---|---|
| **Google** | `gemini-2.5-flash` | Text, Fast, Code | 1,000,000 | $0.15 | $0.60 | `active` |
| **Google** | `gemini-2.5-pro` | Reasoning, Long Context, Security | 2,000,000 | $1.25 | $5.00 | `active` |
| **Anthropic** | `claude-3-5-haiku-20241022` | Text, Fast, Code | 200,000 | $0.80 | $4.00 | `active` |
| **Anthropic** | `claude-3-5-sonnet-20241022` | Code, Review, Debug, Reasoning | 200,000 | $3.00 | $15.00 | `active` |
| **OpenAI** | `gpt-4o-mini` | Text, Fast, Code | 128,000 | $0.15 | $0.60 | `active` |
| **OpenAI** | `gpt-4o` | Text, Code, Reasoning, Security | 128,000 | $2.50 | $10.00 | `active` |
| **OpenAI** | `o3-mini` | Reasoning, Debugging | 200,000 | $1.10 | $4.40 | `active` |
| **Mock** | `mock-fast-model` | Development Testing | 500,000 | $0.10 | $0.50 | `active` |

---

## 4. Capability-First, Cost-Second Routing Strategy

`ModelRouter` selects models dynamically:
1. **Capability Filter**: Filters models capable of performing the requested operation (`code_generation`, `security_analysis`, `debugging`, etc.).
2. **Health Filter**: Excludes unavailable or degraded providers.
3. **Affordability Filter**: Excludes models whose estimated credit consumption exceeds the organization's remaining AI credit balance.
4. **Cost Optimization**: Selects the lowest-cost capable model among candidates.

---

## 5. Fallback Safety & Affordability Re-Authorization

If Provider 1 encounters a transient failure during execution:
1. The gateway retrieves candidate Provider 2.
2. **Re-Authorization**: The gateway independently re-checks if candidate Provider 2's estimated cost is affordable under the organization's remaining entitlement.
3. If candidate 2 is affordable, execution proceeds.
4. If candidate 2 exceeds remaining credits, fallback execution is blocked and `AI_CREDIT_LIMIT_REACHED` is returned.

---

## 6. AI Credit Economics & Commercial Unit Pricing

AI credit consumption follows the canonical commercial formula from `docs/business/saas-commercial-model.md`:

$$\text{Provider Cost USD} = \frac{\text{Input Tokens} \times \text{Input Price}}{1,000,000} + \frac{\text{Output Tokens} \times \text{Output Price}}{1,000,000}$$

$$\text{AI Credits Consumed} = \lceil \text{Provider Cost USD} \times 100 \rceil$$

Minimum billable credit per successful execution = **1 AI Credit**.

---

## 7. Configuration Modes & Secret Management

### Server Environment Variables

- `GOOGLE_AI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `AI_PROVIDER_MODE` (`production` | `mock`)

### Execution Rules

- **Production Mode (`AI_PROVIDER_MODE=production`)**: Only real provider adapters (Google, Anthropic, OpenAI) are executed. If no real provider API keys exist, the gateway returns `AI_PROVIDER_UNAVAILABLE`. Real API keys are server-only and NEVER exposed to client components.
- **Mock Mode (`AI_PROVIDER_MODE=mock`)**: Deterministic mock provider is enabled for development and testing.

---

## 8. Verification Suite

Verification is executed via `scripts/verify-ai-gateway.ts` across 26 mandatory scenarios:
1. Mock provider success
2. Gemini adapter normalization
3. Claude adapter normalization
4. OpenAI adapter normalization
5. Provider routing
6. Cheap-model preference
7. Deep-debugging routing
8. Large-context routing
9. Insufficient credits rejection (`AI_CREDIT_LIMIT_REACHED`)
10. Expired subscription rejection (`SUBSCRIPTION_EXPIRED`)
11. Permission denial
12. Tenant isolation
13. Provider failure handling
14. Provider fallback
15. Fallback credit protection
16. Trusted token accounting
17. Credit calculation accuracy
18. Zero/negative/NaN input guard
19. Immutable `usage_records` entry
20. `ai_invocations` entry
21. Zero negative balance guarantee
22. Missing API key graceful handling
23. Mock mode execution
24. Production mode enforcement
25. Provider unavailable routing
26. Zero direct provider imports outside adapters
