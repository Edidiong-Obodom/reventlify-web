import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@mail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );
        const user = await res.json();

        if (!res.ok) {
          throw new Error("Invalid credentials");
        }

        if (user) {
          return {
            id: user.user.user,
            firstName: user.user.firstName ?? user.user.userName,
            lastName: user.user.lastName,
            email: user.user.email,
            token: user.user.token, // Ensure this exists in the API response
            expiresAt: user.expiresAt,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.accessToken = user.token; // Ensure token exists
        token.expiresAt = (user as any)?.expiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
      };
      (session as any).accessToken = token.accessToken;
      (session as any).expiresAt = token.expiresAt;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
