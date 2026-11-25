import crypto from "node:crypto";

/**
 * Proof-of-key login challenges.
 *
 * The credentials provider used to accept a bare username, which meant any
 * three-request script could mint a session for any account. A session now
 * needs a signature over a challenge this server issued, checked against the
 * account's on-chain posting (or active) key — something only the key holder
 * can produce.
 *
 * The challenge is stateless: `<seconds in base36>.<random>.<hmac>`, so nothing
 * has to be stored between issuing it and checking it, and a restart does not
 * invalidate logins in flight. The HMAC is what makes it unforgeable, the
 * timestamp is what makes it expire.
 *
 * Server-only. The client receives the nonce from `/api/auth/nonce`; it never
 * imports this module (`node:crypto` is not available in the browser).
 */

const SECRET =
  process.env.LOGIN_PROOF_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "";

/**
 * Long enough that an account can be switched without re-scanning the QR,
 * short enough that a proof captured from a log is not a permanent key. A
 * stolen proof is no more powerful than the 30-day session cookie the same
 * browser already holds.
 */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Tolerate a clock a little ahead of ours when the client mints nothing. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/** `Nonce: …` on its own line — the shape the QR package also emits. */
const NONCE_LINE = /^[ \t]*Nonce:[ \t]*([\x21-\x7e]{8,200})[ \t]*$/m;

function mac(payload: string): string {
  if (!SECRET) return "";
  return crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 32);
}

/** The exact text the user signs, identical on every login surface. */
export function loginStatement(nonce: string): string {
  return `SteemPro login\nNonce: ${nonce}`;
}

export function issueLoginNonce(now = Date.now()): string {
  const stamp = Math.floor(now / 1000).toString(36);
  const id = crypto.randomBytes(12).toString("hex");
  return `${stamp}.${id}.${mac(`${stamp}.${id}`)}`;
}

/** The nonce embedded in a signed message, if it carries one. */
export function readLoginNonce(message: string): string | null {
  return NONCE_LINE.exec(message)?.[1] ?? null;
}

/**
 * `true` only for a nonce this server issued and that is still fresh.
 *
 * Fails closed when no secret is configured: without one the MAC cannot be
 * checked, and accepting the nonce anyway would restore the original hole.
 */
export function isIssuedNonce(nonce: string, now = Date.now()): boolean {
  const parts = nonce.split(".");
  if (parts.length !== 3) return false;

  const [stamp, id, signature] = parts;
  const expected = mac(`${stamp}.${id}`);
  if (!expected || signature.length !== expected.length) return false;
  if (
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return false;
  }

  const issuedAt = parseInt(stamp, 36) * 1000;
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return false;

  return now - issuedAt <= MAX_AGE_MS && issuedAt - now <= CLOCK_SKEW_MS;
}

/** One line in the server log when proofs cannot be verified at all. */
export function proofSecretConfigured(): boolean {
  return SECRET.length > 0;
}
