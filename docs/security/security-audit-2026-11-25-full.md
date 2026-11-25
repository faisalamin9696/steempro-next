# Security Audit Report

**Date**: 2026-11-25
**Scope**: full
**Target**: SteemPro (`steempro-next`) — Next.js 16.4.6, TypeScript, Node 24, deployed at www.steempro.com
**Audited by**: this session (no `security-engineer` agent available in this harness)
**Files scanned**: 19 API route handlers, the Auth.js config, the proxy, 2 server-action modules, 4 analytics modules, the client auth/encryption modules, `next.config.ts`, `package.json`, plus repo-wide greps and live HTTP probes against a production-mode build.

> **Scope note.** `/security-audit` is written for game engines; its Godot/Unity/Unreal
> pattern sets describe engine APIs that do not exist here. The six categories were
> therefore mapped to the web equivalents: session/auth storage, API and proxy surface,
> request validation, data exposure, server-side authority, dependency supply chain.
> No category was skipped; none is reported as "clean" on a zero-hit grep.

---

## Executive Summary

| Severity | Count | Open | Must fix before release |
|----------|-------|------|------------------------|
| CRITICAL | 1 | 0 (fixed, pending manual verification) | Yes — all |
| HIGH | 3 | 3 | Yes — all |
| MEDIUM | 7 | 7 | Recommended |
| LOW | 5 | 5 | Optional |

**Release recommendation**: **FIX BEFORE SHIPPING** — no open CRITICAL (SEC-001 is fixed in
the working tree and needs one manual login test per method before deploy), 3 open HIGH.

The one CRITICAL was reproduced end to end: three unauthenticated requests produced a valid
30-day session for any account, including a `MODERATORS` account with full access to the
request-analytics/IP-blocking console. It is fixed; see SEC-001 for the fix and the residual
risk.

---

## CRITICAL Findings

### SEC-001: Credentials provider issued a session for any username
**Category**: Input / server-side authority
**File**: `auth/index.ts:12-23` (before the fix)
**Status**: **FIXED** in the working tree — verify before deploy (see "Verification" below)

**Description**: `authorize()` returned `{ id: credentials.username, name: credentials.username }`
for any non-empty username. It performed no password check, no signature check, and no
Supabase session check — the client-side `authenticateWithEmail()` step that runs before
`signIn()` was never verified on the server.

**Attack scenario (reproduced on a production-mode build)**:

```
GET  /api/auth/csrf                                  -> csrfToken
POST /api/auth/callback/credentials
     csrfToken=<token>&username=<any account>        -> 302 + authjs.session-token
GET  /api/auth/session                               -> {"user":{"name":"<any account>", ...}}
```

Consequences, all confirmed:
- `GET /api/admin/traffic` returned **200** for a forged session naming the first entry of
  `MODERATORS`, and `/dashboard/traffic` rendered the full operator console — every recorded
  client IP was readable and any address could be blocked.
- `/api/boost` treats `session.user.name` as the requester and grants moderators exemptions
  from its cooldown/follow checks (`app/api/boost/route.ts:33-39`).
- `/api/game/*` treats `session.user.name` as the player, so scores could be submitted in
  another player's name.

**Remediation (applied)**:
- `libs/auth-proof.ts` — issues a stateless challenge `<seconds36>.<random>.<hmac>` and checks
  it (HMAC-SHA256 over the payload with the server secret, 24 h maximum age, 5 min clock skew).
- `app/api/auth/nonce/route.ts` — hands the challenge plus the exact statement to sign.
- `auth/index.ts` — `authorize()` now requires `username`, `message`, `signature`; validates the
  account-name shape; requires the nonce in the message to be one this server issued and still
  fresh; then verifies the signature against the account's on-chain posting/active key with
  `steemApi.verifyMessageSignature` (dynamic import so the Steem client is not pulled into every
  route that calls `auth()`).
- All three login surfaces now produce that proof: private key (`steemApi.signMessage`),
  Steem Keychain (`requestSignBuffer` over the server statement), and the SteemAuthenticator QR
  challenge (`authenticate({ nonce })`, which embeds `Nonce: …` in the signed text).
- `LocalAccount.proof` keeps the proof so switching accounts re-issues a session without a
  second prompt; accounts stored before this change get a clear "sign in again" error once.

**Residual risk**: the challenge is not single-use, so a captured proof can be replayed for up
to 24 h. That is bounded by the same threat model as the 30-day session cookie the same browser
already stores; making it single-use would require a server-side nonce table.

**Verification performed**: bare username → rejected; issued challenge + junk signature →
rejected ("bad signature", proving the nonce was accepted); forged challenge → rejected
("stale challenge"); a real account + junk signature → rejected with no 500. The *positive*
path (a genuine signature accepted) still needs one manual login per method — private key,
Keychain, QR — before this is deployed.

**Effort**: Medium (done).

---

## HIGH Findings

### SEC-002: Steem private keys are encrypted with a key shipped to every browser
**Category**: Data exposure / credential exposure
**Files**: `utils/encryption.ts:12-30`, `utils/encryption.ts:73-81`, `hooks/useSteemAuth.ts:213`,
`components/auth/AccountsContext.tsx:311-313`, `utils/user.ts:36-40`, `utils/user.ts:105-116`

**Description**: accounts logged in without a PIN are stored as
`encryptPrivateKey(key, NEXT_PUBLIC_AUTH_SECRET)`, and the "secure local storage" wrapper uses
`AES(value, constantFingerprint + NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY)`. Both values are
inlined into the client bundle by `NEXT_PUBLIC_*` semantics, and PBKDF2 runs 1 000 iterations
over a 52-character constant. The `.env` check confirms `NEXT_PUBLIC_AUTH_SECRET` is **not** the
server `AUTH_SECRET`, so sessions cannot be forged from it — but the ciphertext in
`localStorage` is decryptable by anyone who can read it.

**Attack scenario**: any XSS on the origin, a malicious/compromised browser extension, or a
copied profile directory yields the posting/active key for every PIN-less account. Combined with
SEC-008 (no CSP) nothing limits what injected script can do with it.

**Remediation**: require a user-supplied secret for key storage (PIN or passphrase, PBKDF2 with
≥ 100k iterations), or delegate signing to Keychain / SteemAuthenticator and stop persisting keys
at all. Treat the current scheme as obfuscation in the UI copy.
**Effort**: High (product change).

---

### SEC-003: Game score "signature" is computed with a key the client is given
**Category**: Server-side authority / cheat
**Files**: `app/api/game/start/route.ts:34-38`, `app/api/game/submit/route.ts:44-57`,
`app/api/game/steem-heights/route.ts` (same pattern), `libs/steem.ts:672`

**Description**: `/api/game/start` returns `{ gameId, challenge }`. `/api/game/submit` verifies
`HMAC_SHA256("player:gameId:challenge:score:combos", challenge)` — the challenge is both the
nonce and the HMAC key, and the client holds it.

**Attack scenario**: call `/api/game/start`, then submit any score (e.g. 10^9) with a correctly
computed HMAC. The route marks the session complete and broadcasts a `custom_json` signed by the
official account (`GAME_KEY`), so a forged score becomes an on-chain record eligible for
rewards. No play is required.

**Remediation**: sign the result server-side with a secret the client never sees, and validate
plausibility (score/second ceilings, monotonic progress pings); or accept that client scores are
unverifiable and gate rewards behind server-side heuristics. Removing `challenge` as the HMAC key
is the minimum.
**Effort**: Medium.

---

### SEC-004: Unauthenticated upload to the project's Pinata account
**Category**: Server-side authority / availability
**File**: `app/api/pinata/upload-hls/route.ts:6-47`

**Description**: the handler has no `auth()` check, no file-count or size cap, and buffers every
part with `await file.arrayBuffer()`. It uploads with the server's `PINATA_JWT`. `username` and
each `file.name` are interpolated into the Pinata `filepath` unsanitised.

**Attack scenario**: verified — an unauthenticated POST reaches the upload code path. Anyone can
pin arbitrary content on the project's account (storage/bandwidth cost, takedown exposure), and a
few large uploads can exhaust the Node process's memory. `file.name` values such as `../../x`
shape the stored path.
**Remediation**: require a session **and** a same-origin proof (the upload has a Steem signature
elsewhere for images — reuse it), cap `content-length` and file count, stream to Pinata instead
of buffering, and validate `username` with `isAccountName` plus `file.name` with
`/^[A-Za-z0-9._/-]+$/` trimmed of `..`.
**Effort**: Low.

---

## MEDIUM Findings

### SEC-005: `validateHost()` reads a client-controlled header
**Category**: Input / authentication
**Files**: `utils/helper.ts:52-59`, `app/api/chat/route.ts:8-17`, `app/api/translate/route.ts:8-10`,
`app/api/price/route.ts:8-10`

The gate compares the request's `Host` header against `ALLOWED_ORIGINS`. `Host` is chosen by the
caller, so the gate is decorative: verified `POST /api/chat` with a spoofed `Host` returned
`200 {"secret":"<…>"}`, a `MESSAGE_SECRET`-derived token minted with no authentication. Same for
`/api/translate` and `/api/price`. **Remediation**: check `Origin`/`Referer` for CSRF, and require
a session or a signed token for anything that mints a credential (the chat token should be bound
to a verified account).
**Effort**: Low.

### SEC-006: IP blocklist trusts headers a client can set
**Category**: Input / availability
**File**: `libs/analytics/request.ts:23-36`

`clientIp()` prefers `cf-connecting-ip`, then `x-real-ip`, then the last `X-Forwarded-For` entry.
Unless the edge overwrites those headers, an attacker can present any address: evade a block, or
get a victim's address recorded and blocked by an operator. **Remediation**: in production set
`ANALYTICS_IP_HEADER` to the one header the edge always rewrites (Cloudflare: `cf-connecting-ip`,
with a firewall rule rejecting direct-to-origin traffic), and document that the blocklist is a
convenience, not a WAF.
**Effort**: Low.

### SEC-007: Unauthenticated, unvalidated report webhook
**Category**: Input / abuse
**File**: `app/api/shorts/report/route.ts:1-30`

No session check and no validation of `author`/`permlink`/`note`; the values go into a Discord
embed posted to the team's webhook. Verified `200` with `{}`. This is a free spam/phishing channel
with markdown (and possibly `@everyone`) injection. **Remediation**: require a session, rate-limit
per IP and per account, validate `author`/`permlink` with `isAccountName`/`isPermlink`, strip
mentions from `note`, cap its length.
**Effort**: Low.

### SEC-008: No security headers
**Category**: Data exposure / defence in depth
**Files**: `next.config.ts`, `proxy.ts` (verified: the only response header is `X-Powered-By`)

No CSP, HSTS, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` or
`Permissions-Policy`. There is nothing to contain an XSS (see SEC-002) and the app can be framed.
**Remediation**: add headers in `next.config.ts` `headers()` (or in the proxy) — at minimum
`Content-Security-Policy` with a nonce-based `script-src`, `frame-ancestors 'none'`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Strict-Transport-Security`, and `poweredByHeader: false`.
**Effort**: Medium (CSP needs an inventory of third-party scripts).

### SEC-009: Image proxy has no size cap and does not encode path segments
**Category**: Input / availability
**File**: `app/api/upload-image/route.ts:46-65`

`request.formData()` buffers the whole body; `username` and `signature` are interpolated into
`${server}/${username}/${signature}` without encoding, so `../` or `?`/`#` reshape the upstream
request. `server` is allow-listed, which contains the blast radius. **Remediation**: reject a
`content-length` above the upload limit, validate `username` with `isAccountName` and `signature`
as hex (`/^[0-9a-f]{130}$/i`), and `encodeURIComponent` both before building the URL.
**Effort**: Low.

### SEC-010: Rate limiting is per-instance and keyed on a spoofable value
**Category**: Availability / abuse
**Files**: `libs/rate-limit.ts:9,32`, `app/api/translate/route.ts:21-32`

The limiter is an in-process `Map`, so it resets on restart and is per-instance; it is keyed on
the *first* `X-Forwarded-For` entry, which the client controls; and only `/api/translate` uses it,
with an unbounded `text` payload forwarded to Google. **Remediation**: key on the same trusted
address as SEC-006, add a payload cap, and move the counter to a shared store (or the existing
SQLite) if more than one instance will run.
**Effort**: Low.

### SEC-011: Dependency advisories
**Category**: Supply chain
**Files**: `package-lock.json`

`npm audit`: 11 advisories — 3 low, 7 moderate, 1 high (991 packages).

| Package | Severity | Path | Fix |
|---|---|---|---|
| `follow-redirects` | high | runtime via `axios` | available |
| `minimatch` (+ 6 eslint transitives) | moderate | dev only | available |
| `@steempro/dsteem` → `secp256k1` → `elliptic` | low | runtime (signing) | none |

The `follow-redirects` advisory concerns credential/header handling across redirects; this app
only calls fixed HTTPS endpoints with axios, so practical exposure is low — but it is a runtime
dependency and the fix is free. **Remediation**: `npm audit fix`, verify the lockfile diff,
re-run build and login tests.
**Effort**: Low.

---

## LOW Findings

### SEC-012: Unauthenticated Pinata analytics proxy
**File**: `app/api/pinata/analytics/route.ts:4-21` — any caller can query the account's request
counts for an arbitrary CID, spending the project's Pinata quota. Require a session or drop the
route.

### SEC-013: Links keep `target` without forced `rel`
**File**: `utils/sanitizeConfig.ts:50` — `a` allows `target`; a post can set `target="_blank"`
without `rel="noopener noreferrer"` (reverse tabnabbing in older browsers). Add a `transformTags`
entry that forces `rel` when `target` is present.

### SEC-014: Relay-supplied QR SVG injected as HTML
**Files**: `components/ui/QrApprovalPanel.tsx:294`, `components/auth/SteemAuthLogin.tsx:198` —
`auth.qr.svg` comes from the SteemAuthenticator relay and is rendered with
`dangerouslySetInnerHTML`. A compromised or impersonated relay gets script execution on this
origin. Render it as a data-URL `<img>` or sanitise to an SVG allow-list.

### SEC-015: Auth secret read from the v4 variable name
**File**: `auth/index.ts:25` (now `AUTH_SECRET || NEXTAUTH_SECRET`) — previously
`process.env.NEXTAUTH_SECRET` alone, which is unset in this deployment; sessions only worked via
Auth.js's implicit `AUTH_SECRET` fallback. A stray `NEXTAUTH_SECRET` would silently change the
signing key. Fixed alongside SEC-001.

### SEC-016: `X-Powered-By` advertised
**File**: `next.config.ts` — set `poweredByHeader: false`. Trivial fingerprinting reduction.

---

## Accepted Risk

None recorded yet.

---

## Dependency Inventory

| Plugin / Library | Version | Source | Known CVEs |
|---|---|---|---|
| `next` | 16.4.6 | npm | none open (16.4.2 advisory fixed in `1827e3d`) |
| `next-auth` | v5 (beta line) | npm | none open |
| `@supabase/ssr`, `@supabase/supabase-js` | lockfile | npm | none open |
| `@steempro/dsteem` + `secp256k1` + `elliptic` | lockfile | npm (scoped fork) | `elliptic` low, no fix |
| `axios` → `follow-redirects` | lockfile | npm | high, fix available |
| `got` | 14.x | npm | none open |
| `sanitize-html` | 2.18.0 | npm | none open |
| `sanitize-html` config | `utils/sanitizeConfig.ts` | in-repo | allow-list reviewed: no `script`/`style`/`object`, iframes URL allow-listed |
| `node:sqlite` | Node builtin | runtime | n/a |

`.env` has never been committed (checked all history) and no hardcoded key patterns exist in
tracked source.

---

## Remediation Priority Order

1. **SEC-001** — signature-gated sessions — done, manual login test pending — effort: Medium
2. **SEC-004** — authenticate and cap the Pinata upload — Low
3. **SEC-003** — stop signing scores with the client's own challenge — Medium
4. **SEC-008** — security headers (CSP first) — Medium
5. **SEC-005** — replace `validateHost` with real checks — Low
6. **SEC-007** — authenticate and validate the report webhook — Low
7. **SEC-002** — user-secret key storage or no key storage — High
8. **SEC-006 / SEC-009 / SEC-010** — trusted IP source, upload limits, shared rate limit — Low
9. **SEC-011** — `npm audit fix` — Low
10. **SEC-012 … SEC-016** — hardening — Low

---

## Re-Audit Trigger

Re-run `/security-audit quick` after SEC-001 is deployed and the three login methods are confirmed
working, and again after SEC-003/SEC-004 are fixed. The release gate this report feeds requires
no open CRITICAL or HIGH.

## Verification log (this session)

| Probe | Result |
|---|---|
| `POST /api/auth/callback/credentials` with username only | before fix: session issued for any name (incl. a moderator); after fix: rejected |
| issued challenge + junk signature | rejected — "bad signature" (nonce accepted) |
| forged challenge + junk signature | rejected — "stale challenge" |
| real account + junk signature | rejected, no 500 |
| `POST /api/chat` with spoofed `Host` | `200` + secret (SEC-005) |
| `POST /api/pinata/upload-hls` unauthenticated | reaches upload path (SEC-004) |
| `POST /api/shorts/report` with `{}` | `200`, no auth (SEC-007) |
| `GET /` response headers | `X-Powered-By` only (SEC-008) |
| `.env` in git history | absent |
| `npx tsc --noEmit` / `npm run build` | clean |
