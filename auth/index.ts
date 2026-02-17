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
