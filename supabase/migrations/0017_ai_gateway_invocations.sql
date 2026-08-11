-- Migration 0017: AI Gateway Invocations Lifecycle & Accounting Schema Extensions
-- Additive additions to public.ai_invocations for transactional credit lifecycle and provider accounting.

ALTER TABLE public.ai_invocations 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'google',
  ADD COLUMN IF NOT EXISTS operation VARCHAR(100) NOT NULL DEFAULT 'general_assistant',
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'SETTLED',
  ADD COLUMN IF NOT EXISTS input_tokens INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS output_tokens INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_tokens INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS provider_cost_usd NUMERIC(12,6) NOT NULL DEFAULT 0.000000,
  ADD COLUMN IF NOT EXISTS ai_credits_consumed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS request_id VARCHAR(100);

-- Indexes for efficient invocation queries by organization and operation
CREATE INDEX IF NOT EXISTS idx_ai_invocations_org_created ON public.ai_invocations(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_invocations_req_id ON public.ai_invocations(request_id);
