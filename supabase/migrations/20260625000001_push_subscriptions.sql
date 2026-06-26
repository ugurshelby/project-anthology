CREATE TABLE push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  CONSTRAINT push_subscriptions_token_unique UNIQUE (token)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Service-role key (used by Next.js API routes) bypasses RLS entirely.
-- The anon key should never reach this table directly, so we grant nothing.
-- All writes go through /api/push/register which uses SUPABASE_SERVICE_ROLE_KEY.
REVOKE ALL ON push_subscriptions FROM anon, authenticated;
