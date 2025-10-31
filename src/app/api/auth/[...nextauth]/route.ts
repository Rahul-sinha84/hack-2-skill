import NextAuth from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { generateGuestId } from "@/utils/generateGuestId";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest Login",
      credentials: {},
      async authorize() {
        // Create a guest user with unique ID
        const guestId = generateGuestId();
        return {
          id: guestId,
          name: "Guest User",
          email: "guest@local",
          image: null,
          isGuest: true,
        };
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  pages: {
    // ? redirect to "/login" page if user is not authenticated
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      // Pass through the user image from token to session
      if (session?.user && token?.picture) {
        session.user.image = token.picture as string;
      }
      // Pass through the isGuest flag
      if (token?.isGuest !== undefined) {
        session.user.isGuest = token.isGuest;
      }
      return session;
    },
    async jwt({ token, account, profile, user }) {
      // Store the picture from Google profile
      if (account && profile) {
        const p = profile as Partial<GoogleProfile> & Record<string, unknown>;
        const pic =
          (p.picture as string | undefined) ?? (p.image as string | undefined);

        if (pic) {
          token.picture = pic;
        }
      }
      // Store the isGuest flag from user object
      if (user?.isGuest !== undefined) {
        token.isGuest = user.isGuest;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
