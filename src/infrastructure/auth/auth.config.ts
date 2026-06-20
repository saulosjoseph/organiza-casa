import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
