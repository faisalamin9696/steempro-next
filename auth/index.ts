import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "SteemPro Authenticator",
      credentials: {
        username: {},
      },
      async authorize(
        credentials: any,
      ): Promise<{ id: string; name: string } | null> {
        if (credentials) {
          return {
            id: credentials.username,
            name: credentials.username,
          };
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    // 10 years 10 * 12 * 365 * 24 * 60 * 60
    maxAge: 3784320000,
  },
});
