-- ============================================================
-- SteemPro — RESTRICTED grants (project objects only)
--
-- Grants access ONLY to this project's objects (all prefixed
-- `steempro_` + the RPC functions the app actually calls),
-- instead of every table in `public`.
--
-- Idempotent: re-run this file whenever you add a new
-- steempro_* table or a new RPC function.
--
-- Verify nothing else is open afterwards:
--   select distinct table_name
--   from information_schema.role_table_grants
--   where table_schema = 'public'
--     and grantee in ('anon','authenticated','service_role')
--     and table_name not like 'steempro\_%';
--   -- expect: 0 rows
-- ============================================================

-- 0) ONE-TIME CLEANUP (only if you already ran the broad version)
revoke all on all tables in schema public
  from anon, authenticated, service_role;
revoke usage, select on all sequences in schema public
  from anon, authenticated, service_role;
revoke execute on all functions in schema public
  from anon, authenticated, service_role;
alter default privileges in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges in schema public
  revoke execute on functions from anon, authenticated, service_role;

-- 1) Schema usage (required by PostgREST)
grant usage on schema public to anon, authenticated, service_role;

-- 2) Project tables only (everything prefixed steempro_)
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'steempro\_%'
  loop
    execute format(
      'grant all privileges on table public.%I to anon, authenticated, service_role',
      t
    );
  end loop;
end $$;

-- 3) Sequences owned by those tables
do $$
declare s text;
begin
  for s in
    select distinct c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'S'
      and (
        c.relname like 'steempro\_%'
        or exists (
          select 1 from pg_depend d
          where d.classid = 'pg_class'::regclass
            and d.objid = c.oid
            and d.refclassid = 'pg_class'::regclass
            and exists (
              select 1 from pg_class t2
              where t2.oid = d.refobjid
                and t2.relname like 'steempro\_%'
            )
        )
      )
  loop
    execute format(
      'grant usage, select on sequence public.%I to anon, authenticated, service_role',
      s
    );
  end loop;
end $$;

-- 4) Only the RPC functions the app actually calls
--    (get_schedules, get_snippets, get_promoted_posts, chat RPCs,
--     steem-heights RPCs)
do $$
declare r record;
begin
  for r in
    select p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'get_schedules', 'get_snippets', 'get_promoted_posts',
        'notifs_last_read', 'get_unread_count', 'get_chat_heads',
        'get_user_chat', 'get_community_chat',
        'get_heights_highest_score', 'get_heights_seasonal_winners',
        'get_heights_combined_user_data', 'get_heights_shop_stats',
        'get_heights_daily_stats', 'get_heights_player_stats'
      )
  loop
    execute format(
      'grant execute on function public.%I(%s) to anon, authenticated, service_role',
      r.proname, r.args
    );
  end loop;
end $$;
