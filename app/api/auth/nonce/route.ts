import { NextResponse } from "next/server";
import { issueLoginNonce, loginStatement } from "@/libs/auth-proof";

/**
 * Issues the challenge a login must be signed against.
 *
 * Public by design: the nonce is not a secret, it is the thing that makes a
 * signature single-purpose and short-lived. Signing it still requires the
 * account's key, so handing one to anyone costs nothing.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const nonce = issueLoginNonce();

  return NextResponse.json(
    { nonce, statement: loginStatement(nonce) },
    { headers: { "cache-control": "no-store" } },
  );
}
