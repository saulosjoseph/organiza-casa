import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
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
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnLogin = nextUrl.pathname === "/login";
      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      if (isAuthRoute) return true;
      if (isOnLogin) return isLoggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
