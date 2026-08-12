-- ==============================================================================
-- OSPREY IT HELPDESK - DATABASE MIGRATION: SOFTWARE LICENSES
-- Migration Identifier: 20260811100000_software_licenses
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_software_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  software_name TEXT NOT NULL,
  license_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'SUSPENDED')),
  allocated_by TEXT NOT NULL DEFAULT 'OSPREY_AUTOMATION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on software licenses for fast user lookup
CREATE INDEX IF NOT EXISTS idx_user_software_licenses_user ON public.user_software_licenses (user_email);
CREATE INDEX IF NOT EXISTS idx_user_software_licenses_software ON public.user_software_licenses (software_name);
