-- ============================================================
-- SteemPro — RESTRICTED grants (project objects only)
--
-- Scope: ONLY this project's objects — tables prefixed `steempro_`
-- plus the RPC functions the app actually calls. Nothing else in
-- `public` is opened.
--
-- Idempotent: safe to re-run whenever a table or RPC is added.
-- The file ends with a self-check that RAISE NOTICEs anything still
-- locked out, anything missing, and any inventory drift.
--
-- ------------------------------------------------------------
-- INVENTORY (source of truth = the code; keep in sync)
--
-- Tables (8) — `.from(...)` calls
--   steempro_chat                   hooks/useRealtimeUserMessages.ts
--                                   hooks/useRealtimeCommunityMessages.ts
--   steempro_schedules              libs/supabase/schedule.ts
--   steempro_snippets               libs/supabase/snippets.ts
--   steempro_game_heights           libs/supabase/steem-heights.ts
--                                   hooks/games/useHeights.ts
--   steempro_game_heights_shop      libs/supabase/steem-heights.ts
--                                   app/api/game/steem-heights/shop/route.ts
--                                   hooks/games/useHeights.ts
--   steempro_game_chat              libs/supabase/steem-heights.ts
--                                   hooks/games/useHeights.ts
--   steempro_game_heights_sessions  app/api/game/start/route.ts
--                                   app/api/game/submit/route.ts
--                                   app/api/game/steem-heights/shop/route.ts
--   steempro_boost_requests         app/api/boost/request-permission/route.ts
--
-- RPCs (14) — `.rpc(...)` calls
--   get_schedules, get_snippets, get_promoted_posts,
--   notifs_last_read, get_unread_count, get_chat_heads,
--   get_user_chat, get_community_chat,
--   get_heights_highest_score, get_heights_seasonal_winners,
--   get_heights_combined_user_data, get_heights_shop_stats,
--   get_heights_daily_stats, get_heights_player_stats
--
-- Realtime (4) — `postgres_changes` subscriptions in hooks/
--   steempro_chat, steempro_game_chat,
--   steempro_game_heights_shop, steempro_game_heights
--
-- IMPORTANT: every client in this repo — the browser client AND the
-- server routes (`libs/supabase/server.ts`) — uses the ANON key. There
-- is no service-role client, so `anon` genuinely needs every grant
-- below; revoking them breaks the app outright.
-- ------------------------------------------------------------
--
-- Apply: paste into the Supabase SQL editor and run once (or psql).
-- Afterwards reload PostgREST's schema cache so the RPCs appear:
--   notify pgrst, 'reload schema';
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

-- Functions: revoke everything EXCEPT functions contributed by an
-- extension. This file is meant to be re-run on every new table, and a
-- blanket `revoke execute on all functions in schema public` would
-- otherwise lock the app out of pgcrypto / uuid-ossp / etc., which
-- Supabase still installs into `public` on older projects.
--
-- PUBLIC must be in the list. CREATE FUNCTION grants EXECUTE to PUBLIC
-- by default, `anon` inherits it, and revoking only from anon/authenticated
-- is therefore a silent no-op — verified: with `{=X/postgres}` in proacl,
-- `revoke ... from anon` left has_function_privilege('anon',...) = true.
-- Extension functions keep their PUBLIC execute, which is stock behaviour.
do $$
declare f record;
begin
  for f in
    select p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (
        select 1
        from pg_depend d
        where d.classid = 'pg_proc'::regclass
          and d.objid = p.oid
          and d.deptype = 'e'
      )
  loop
    execute format(
      'revoke execute on function public.%I(%s) from anon, authenticated, service_role, public',
      f.proname, f.args
    );
  end loop;
end $$;

-- Default privileges stay CLOSED for anything created later. They cannot
-- be scoped to `steempro_%`, so the only safe default is "deny"; run this
-- file again after adding a table or an RPC (section 6 flags it for you).
--
-- Note: if the database has no pg_default_acl row for `public` yet, these
-- REVOKEs are a harmless no-op (PostgreSQL will not create a row by
-- revoking). Where the row exists — as on Supabase, which pre-grants to
-- anon — they do take effect. The per-object revokes above are what
-- actually close the schema.
alter default privileges in schema public
  revoke all on tables from anon, authenticated, service_role;
alter default privileges in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges in schema public
  revoke execute on functions from anon, authenticated, service_role, public;

-- 1) Schema usage (required by PostgREST)
grant usage on schema public to anon, authenticated, service_role;

-- 2) Project tables only (everything prefixed steempro_).
--    anon/authenticated get exactly the four PostgREST verbs — that is
--    everything the REST layer can do, minus TRUNCATE / REFERENCES /
--    TRIGGER, which the app never uses and the public key must not have.
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'steempro\_%'
  loop
    execute format(
      'grant select, insert, update, delete on table public.%I to anon, authenticated',
      t
    );
    execute format(
      'grant all privileges on table public.%I to service_role',
      t
    );
  end loop;
end $$;

-- 3) Sequences owned by those tables (serial / identity columns need
--    USAGE before the next value can be drawn on INSERT)
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

-- 4) Only the RPC functions the app actually calls.
--    Signatures are read from pg_proc, so overloaded functions are
--    granted per-signature and no manual arg list is needed.
do $$
declare r record;
begin
  for r in
    select p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
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

-- 5) Realtime — the app opens `postgres_changes` subscriptions on these
--    four tables. A table that is not a member of the publication
--    silently delivers no events, which looks identical to an RLS bug.
--    Guarded: skipped if the publication is absent (realtime managed
--    elsewhere) or the tables are already members.
do $$
declare t text;
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    raise notice 'realtime: publication supabase_realtime not found - section skipped';
    return;
  end if;

  foreach t in array array[
    'steempro_chat',
    'steempro_game_chat',
    'steempro_game_heights_shop',
    'steempro_game_heights'
  ] loop
    if not exists (
         select 1 from pg_tables
         where schemaname = 'public' and tablename = t
       )
    then
      raise notice 'realtime: table public.% does not exist - skipped', t;
    elsif not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
      raise notice 'realtime: added public.% to supabase_realtime', t;
    end if;
  end loop;
end $$;

-- 6) Self-check — reports, rather than assumes, that the grants landed.
--    Run this after every change; a silent miss here means 401s at runtime.
do $$
declare
  r record;
  missing text;
  t text;
  expected_tables text[] := array[
    'steempro_chat',
    'steempro_schedules',
    'steempro_snippets',
    'steempro_game_heights',
    'steempro_game_heights_shop',
    'steempro_game_chat',
    'steempro_game_heights_sessions',
    'steempro_boost_requests'
  ];
  expected_fns text[] := array[
    'get_schedules', 'get_snippets', 'get_promoted_posts',
    'notifs_last_read', 'get_unread_count', 'get_chat_heads',
    'get_user_chat', 'get_community_chat',
    'get_heights_highest_score', 'get_heights_seasonal_winners',
    'get_heights_combined_user_data', 'get_heights_shop_stats',
    'get_heights_daily_stats', 'get_heights_player_stats'
  ];
begin
  -- 6a) every steempro_* table usable by anon
  missing := '';
  for r in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'steempro\_%'
      and not (
        has_table_privilege('anon', format('public.%I', tablename), 'SELECT')
        and has_table_privilege('anon', format('public.%I', tablename), 'INSERT')
        and has_table_privilege('anon', format('public.%I', tablename), 'UPDATE')
        and has_table_privilege('anon', format('public.%I', tablename), 'DELETE')
      )
  loop
    missing := missing || r.tablename || ' ';
  end loop;
  if missing <> '' then
    raise notice 'TABLES STILL LOCKED OUT: %', missing;
  else
    raise notice 'tables OK: all steempro_* tables grant select/insert/update/delete to anon';
  end if;

  -- 6b) every RPC the app calls exists and is executable
  missing := '';
  foreach t in array expected_fns loop
    if not exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = t
    ) then
      missing := missing || t || ' [NOT CREATED] ';
    end if;
  end loop;
  for r in
    select p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname = any (expected_fns)
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
  loop
    missing := missing || r.proname || '(' || r.args || ') [NO EXECUTE] ';
  end loop;
  if missing <> '' then
    raise notice 'RPC PROBLEMS: %', missing;
  else
    raise notice 'rpcs OK: all 14 exist and grant execute to anon';
  end if;

  -- 6c) inventory drift against the table above
  missing := '';
  foreach t in array expected_tables loop
    if not exists (
      select 1 from pg_tables
      where schemaname = 'public' and tablename = t
    ) then
      missing := missing || t || ' [documented but absent] ';
    end if;
  end loop;
  for r in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename like 'steempro\_%'
      and tablename <> all (expected_tables)
  loop
    missing := missing || r.tablename || ' [NOT in inventory - update this file] ';
  end loop;
  if missing <> '' then
    raise notice 'INVENTORY DRIFT: %', missing;
  else
    raise notice 'inventory OK: 8 tables match the code';
  end if;

  -- 6d) no stray function is still callable by the public key.
  --     Extension functions are deliberately exempt (stock Supabase
  --     behaviour, and our RPCs call them).
  missing := '';
  for r in
    select p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname <> all (expected_fns)
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_proc'::regclass
          and d.objid = p.oid
          and d.deptype = 'e'
      )
      and has_function_privilege('anon', p.oid, 'EXECUTE')
  loop
    missing := missing || r.proname || '(' || r.args || ') ';
  end loop;
  if missing <> '' then
    raise notice 'LEAK: anon can still execute non-project functions: %', missing;
  else
    raise notice 'functions OK: only the 14 RPCs + extension functions are callable';
  end if;

  -- 6e) no non-project table was re-opened
  missing := '';
  for r in
    select distinct table_name
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee in ('anon', 'authenticated', 'service_role')
      and table_name not like 'steempro\_%'
  loop
    missing := missing || r.table_name || ' ';
  end loop;
  if missing <> '' then
    raise notice 'LEAK: granted to non-project tables: %', missing;
  else
    raise notice 'scope OK: no non-project table is granted';
  end if;
end $$;

-- 7) Make PostgREST pick the grants up immediately. Without this the
--    newly executable RPCs stay hidden and keep returning
--    PGRST202 "Could not find the function ... in the schema cache".
--    Harmless if nothing is listening.
notify pgrst, 'reload schema';
