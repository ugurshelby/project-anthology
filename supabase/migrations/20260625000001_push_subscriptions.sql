CREATE TABLE push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  CONSTRAINT push_subscriptions_token_unique UNIQUE (token)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can upsert own token"
  ON push_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT INSERT, UPDATE, SELECT ON push_subscriptions TO anon, authenticated;
