import { createClient } from "@supabase/supabase-js";

type PublicClient = ReturnType<typeof createClient>;

let client: PublicClient | null = null;
let attempted = false;

/**
 * Anon, read-only Supabase client for server components.
 *
 * `libs/supabase/supabase.ts` exports `createBrowserClient`, which expects a
 * `document` and — when the project URL or key is missing — throws while the
 * module is being imported. Imported from a server component that turns the
 * route into a 500 before any of its own code runs.
 *
 * This one is a plain client: no session, no cookie jar, no `document`. Public
 * reads on the server only ever need the anon key and RLS.
 *
 * A missing configuration degrades to `null` so the caller can log it and carry
 * on: a decorative block must not be able to take the page down.
 *
 * `fetch` carries a timeout for the same reason. Supabase's client has none, so
 * a deployment whose egress to supabase.co is dropped (not refused) would hang
 * the page that awaits it, instead of failing after a few seconds.
 */

const TIMEOUT_MS = 5_000;

export function supabasePublic(): PublicClient | null {
  if (attempted) return client;
  attempted = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
    },
  });

  return client;
}
