import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoUserRepository } from "@/src/infrastructure/database/mongoose/repositories/user.repository";

const userRepository = new MongoUserRepository();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        await userRepository.upsertByGoogleId({
          email: profile.email ?? user.email ?? "",
          name: profile.name ?? user.name ?? "",
          image: (profile.picture as string) ?? user.image ?? null,
          googleId: profile.sub,
        });
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        const dbUser = await userRepository.findByGoogleId(profile.sub);
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnLogin = nextUrl.pathname === "/login";
      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      if (isAuthRoute) return true;
      if (isOnLogin) return isLoggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
      return isLoggedIn;
    },
  },
});
