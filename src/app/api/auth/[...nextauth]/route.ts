import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  pages: {
    // ? redirect to "/login" page if user is not authenticated
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      // Ensure user image is properly passed through
      if (session?.user) {
        session.user.image =
          (session.user.image as string | null | undefined) ||
          (token?.picture as string | undefined) ||
          null;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Ensure profile image is included in the token
      if (account && profile) {
        token.picture = (profile as any).picture || (profile as any).image;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
