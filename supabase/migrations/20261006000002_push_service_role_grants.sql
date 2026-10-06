-- Fix drift found on 2026-10-06 by comparing the live database with supabase/migrations
-- (read-only, Supabase MCP):
--
-- 1) push_subscriptions and notified_sessions were created with "revoke all ... from anon,
--    authenticated" and no GRANT to service_role (the migrations relied on default
--    privileges). On the live project service_role has NO privileges on either table
--    (has_table_privilege = false for SELECT/INSERT/UPDATE/DELETE), so /api/push/register
--    and /api/cron/notify-sessions cannot read or write them. RLS stays enabled with no
--    policies: anon/authenticated still get nothing; service_role bypasses RLS but needs
--    the table privileges.
-- 2) Supabase security advisor `function_search_path_mutable` on public.set_updated_at().
--    The body only calls now() (pg_catalog), so an empty search_path is safe.
--
-- Idempotent: GRANT and ALTER FUNCTION can be re-run.

grant select, insert, update, delete on public.push_subscriptions to service_role;
grant select, insert, update, delete on public.notified_sessions to service_role;

revoke all on public.push_subscriptions from anon, authenticated;
revoke all on public.notified_sessions from anon, authenticated;

alter function public.set_updated_at() set search_path = '';
