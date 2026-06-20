import NextAuth from "next-auth";
import { MongoUserRepository } from "@/src/infrastructure/database/mongoose/repositories/user.repository";
import { authConfig } from "./auth.config";

const userRepository = new MongoUserRepository();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
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
  },
});
