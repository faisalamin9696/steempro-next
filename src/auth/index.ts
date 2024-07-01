import NextAuth, { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const BASE_PATH = "/api/auth";

const authOptions: NextAuthConfig = {
  providers: [
    Credentials({
      name: "SteemPro Authenticator",
      credentials: {
        username: {},
      },
      async authorize(credentials: any): Promise<User | null> {
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
