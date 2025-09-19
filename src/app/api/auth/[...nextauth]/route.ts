import NextAuth from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

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
      return session;
    },
    async jwt({ token, account, profile }) {
      // Store the picture from Google profile
      if (account && profile) {
        const p = profile as Partial<GoogleProfile> & Record<string, unknown>;
        const pic =
          (p.picture as string | undefined) ?? (p.image as string | undefined);

        if (pic) {
          token.picture = pic;
        }
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
