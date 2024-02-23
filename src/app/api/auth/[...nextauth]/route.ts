import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials"


const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        // 10 years 10 * 12 * 365 * 24 * 60 * 60
        maxAge: 3784320000

    },

    providers: [
        CredentialsProvider({
            name: 'SteemPro Authenticator',
            credentials: {
                username: {},
            },
            async authorize(credentials, req) {
                if (credentials) {
                    return {
                        id: credentials.username,
                        name: credentials.username,
                    };


                }
                return null
            }
        })
    ],
});

export { handler as GET, handler as POST };

