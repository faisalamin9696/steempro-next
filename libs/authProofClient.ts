/**
 * Client half of the login proof: ask the server for a challenge, then hand
 * the signed result back with `signIn("credentials", …)`.
 *
 * Browser-safe on purpose — `libs/auth-proof.ts` imports `node:crypto` and must
 * never be pulled into a client component.
 */

export type LoginProof = { message: string; signature: string };

export async function fetchLoginChallenge(): Promise<{
  nonce: string;
  statement: string;
}> {
  const res = await fetch("/api/auth/nonce", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw new Error("Sign-in service unavailable. Please retry.");
  }

  const data = (await res.json()) as { nonce?: unknown; statement?: unknown };
  if (typeof data?.nonce !== "string" || typeof data?.statement !== "string") {
    throw new Error("Sign-in service returned an invalid challenge.");
  }

  return { nonce: data.nonce, statement: data.statement };
}
