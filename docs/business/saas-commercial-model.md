# SaaS Commercial Model, Entitlements & Unit Economics — ANSTAT AI ENGINE

> **Phase 7 Blueprint Document**  
> *Subscription Tiers, Entitlements Architecture, AI Credit Conversions, Idempotent Billing Webhooks, and Unit Economics.*

---

## 1. Subscription Tier Matrix

ANSTAT AI ENGINE offers four commercial tiers structured around agency scale, repository footprint, and monthly AI execution quotas:

| Plan Tier | Price (INR / Mo) | Price (USD Est.) | Target Audience | Positioning |
|---|---|---|---|---|
| **STARTER** | **₹499 / month** | ~$6.00 / mo | Solo Developers & Freelancers | Essential SOW & Code Assistant |
| **PRO** | **₹999 / month** | ~$12.00 / mo | Boutique Software Agencies (2-5 devs) | Full Commercial & Engineering Engine |
| **STUDIO** | **₹2,499 / month** | ~$30.00 / mo | Growing Software Studios (5-15 devs) | Advanced DevSecOps & Priority Workers |
| **BUSINESS** | **₹5,999+ / month** | ~$72.00+ / mo | Enterprise Agencies & Scale-ups | Unlimited Repos & Dedicated Isolation |

---

## 2. Entitlements Architecture

### Structural Rule: `PLAN ≠ PERMISSION`
Plan subscription determines workspace **Entitlements** (Resource Quotas & Caps). User role determines workspace **Permissions** (RBAC Capabilities).

```
[Workspace Subscription] ──> [Active Plan] ──> [Entitlements Matrix] ──> [Quota Enforcement]
[User Membership]        ──> [User Role]   ──> [RBAC Permissions]   ──> [Action Authorization]
```

### Entitlement Capabilities Matrix

| Entitlement Capability | STARTER (₹499) | PRO (₹999) | STUDIO (₹2,499) | BUSINESS (₹5,999+) |
|---|---|---|---|---|
| `max_members` | 2 Seats | 5 Seats | 15 Seats | Custom (Unlimited) |
| `max_repositories` | 3 Repositories | 10 Repositories | 25 Repositories | Custom (Unlimited) |
| `monthly_proposals` | 10 Proposals | 50 Proposals | 200 Proposals | Unlimited |
| `monthly_code_jobs` | 25 Code Jobs | 100 Code Jobs | 500 Code Jobs | Custom (Unlimited) |
| `monthly_security_scans` | 10 Scans | 50 Scans | 250 Scans | Unlimited |
| `monthly_debugging_investigations` | 10 Incidents | 50 Incidents | 250 Incidents | Unlimited |
| `monthly_ai_credits` | **300 AI Credits** | **1,000 AI Credits** | **3,000 AI Credits** | **10,000+ AI Credits** |
| `github_enabled` | ✅ Enabled | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| `advanced_security` | ❌ Disabled | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| `team_rbac` | ❌ Disabled | ❌ Disabled | ✅ Enabled | ✅ Enabled |
| `priority_workers` | ❌ Disabled | ❌ Disabled | ✅ Enabled | ✅ Dedicated Pool |

---

## 3. AI Credit Conversion & Unit Economics

### User Facing Abstraction
Customers consume **AI Credits**, decoupling public subscription pricing from underlying LLM provider token cost fluctuations.

$$\text{AI Credits Consumed} = \left( \frac{\text{Input Tokens} \times \$0.003}{1000} + \frac{\text{Output Tokens} \times \$0.015}{1000} \right) \times 100$$

### Conversion Examples
- **Proposal SOW Generation** (~2,500 input, 1,500 output tokens): **3.0 AI Credits** (Actual provider cost ~$0.03)
- **Code Patch Synthesis** (~15,000 input, 2,000 output tokens): **7.5 AI Credits** (Actual provider cost ~$0.075)
- **Security Finding Explanation** (~3,000 input, 800 output tokens): **2.1 AI Credits** (Actual provider cost ~$0.021)

### Margin Protection Calculation (Starter Plan: ₹499 / $6.00)
- **Gross Revenue**: ₹499 ($6.00)
- **Payment Processing (2.5%)**: ₹12.50 ($0.15)
- **Max AI Allowance (300 Credits)**: ~$3.00 (₹250 max inference cost)
- **Infrastructure Overhead (Hosting, DB)**: ~$0.80 (₹65)
- **Net Contribution Margin**: **~34% (₹171 / $2.05 profit per starter subscriber)**

---

## 4. Usage Accounting & Ledger

1. **`UsageRecord` (Immutable Ledger)**: Every AI invocation, code job, and security scan appends a permanent row detailing tokens, provider cost, and credits deducted.
2. **`UsageCounter` (Billing Period Aggregate)**: Tracks current cycle consumption. Resets automatically on billing cycle rollover; historical ledgers remain untouched.

---

## 5. Subscription Lifecycle States

```
[Trialing] ──> [Active] ───────> [Past Due] ──> [Grace Period] ──> [Expired (Read-Only)]
                  │                                                       ▲
                  └────────────> [Cancelled] ─────────────────────────────┘
```

- **`active`**: Full platform entitlement access.
- **`past_due`**: Payment failed; 3-day grace period with email alerts. Access maintained.
- **`grace_period`**: Day 4–7 after failed payment. Write operations restricted.
- **`expired`**: Restricted read-only workspace access. **Data is NEVER deleted upon expiration.**

---

## 6. Upgrade & Downgrade Policies

### Upgrade Path
- Immediate entitlement cap increase.
- Unused AI credits from previous plan rollover into the upgraded billing cycle.

### Downgrade Handling
- Existing repositories, proposals, and user seats are retained.
- Creation of **NEW** resources is blocked until usage drops below downgraded plan caps.

---

## 7. Cancellation & Controlled Trial Model

### Cancellation
- Selecting cancellation sets `cancel_at_period_end = true`.
- Workspace retains full access until the end of the paid billing cycle, then transitions to `expired` (Read-only).

### 7-Day Controlled Trial
- **Duration**: 7 Days
- **Included Allowance**: **100 AI Credits**, 2 Repositories, 3 Proposals, 5 Code Jobs.
- **Abuse Prevention**: Card authorization or verified mobile OTP required before trial activation to prevent multi-account credit farming.

---

## 8. Idempotent Billing Webhook Engine

```
[Payment Gateway Webhook] ──> [Signature Verification (Provider HMAC Header)] ──> [Idempotency Check (payment_webhook_events)]
                                                                    │
                                                           [Already Processed?]
                                                           ├── YES ──> HTTP 200 (Ignore)
                                                           └── NO  ──> Execute State Transition & Log
```

---

## 9. Profitability & Unit Economics Matrix

| Cost Component | STARTER (₹499) | PRO (₹999) | STUDIO (₹2,499) | BUSINESS (₹5,999+) |
|---|---|---|---|---|
| **Subscription Revenue** | ₹499.00 | ₹999.00 | ₹2,499.00 | ₹5,999.00 |
| **Payment Gateway (2.5%)** | ₹12.50 | ₹25.00 | ₹62.50 | ₹150.00 |
| **Max AI Inference Cost** | ₹250.00 | ₹500.00 | ₹1,250.00 | ₹2,500.00 |
| **Server & DB Overhead** | ₹65.00 | ₹120.00 | ₹280.00 | ₹600.00 |
| **Contribution Margin** | **₹171.50 (34.3%)** | **₹354.00 (35.4%)** | **₹906.50 (36.2%)** | **₹2,749.00 (45.8%)** |
