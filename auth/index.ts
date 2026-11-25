import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isIssuedNonce, readLoginNonce } from "@/libs/auth-proof";
import { isAccountName } from "@/utils/steemParams";

/**
 * Sessions are only issued for a signed challenge.
 *
 * This provider used to return a user for whatever `username` it was handed —
 * no password, no signature, no verification — so
 * `POST /api/auth/callback/credentials` with any name produced a valid 30-day
 * session for that account, including operator accounts.
 *
 * `authorize` now requires the client to prove control of the account's Steem
 * key: `message` must carry a nonce this server issued (`/api/auth/nonce`) and
 * `signature` must verify against the account's on-chain posting or active key.
 * Every login surface produces that proof — Keychain, a private key, and the
 * SteemAuthenticator QR challenge (which embeds the same `Nonce:` line).
 *
 * The chain lookup is dynamic so the auth config does not pull the full Steem
 * client into every route that calls `auth()`.
 */

type ProofCredentials = {
  username?: unknown;
  message?: unknown;
  signature?: unknown;
};

export const { handlers, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "SteemPro Authenticator",
      credentials: {
        username: {},
        message: {},
        signature: {},
      },
      async authorize(credentials: ProofCredentials | undefined) {
        const username = String(credentials?.username ?? "")
          .trim()
          .toLowerCase();
        const message = String(credentials?.message ?? "");
        const signature = String(credentials?.signature ?? "");

        if (!isAccountName(username) || !message || !signature) {
          return null;
        }

        const nonce = readLoginNonce(message);
        if (!nonce || !isIssuedNonce(nonce)) {
          console.warn(`[auth] login rejected for @${username}: stale challenge`);
          return null;
        }

        const { steemApi } = await import("@/libs/steem");
        const valid = await steemApi.verifyMessageSignature(
          username,
          message,
          signature,
        );

        if (!valid) {
          console.warn(`[auth] login rejected for @${username}: bad signature`);
          return null;
        }

        return { id: username, name: username };
      },
    }),
  ],
  // `AUTH_SECRET` is the v5 name; `NEXTAUTH_SECRET` is kept for a deployment
  // that still sets only the v4 variable.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
