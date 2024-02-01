import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"


const handler = NextAuth({
    session: {
        strategy: 'jwt',
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

