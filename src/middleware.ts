import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    // ! only runs when the 'authorized' callback returns true
    // Get the pathname
    const path = request.nextUrl.pathname;
    const token = request.nextauth.token;

    // If user is authenticated
    if (token) {
      // If user is not on /a or /a/... paths, redirect to /a
      if (!path.startsWith("/a")) {
        return NextResponse.redirect(new URL("/a", request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // ! run on every request before middleware
        // ! returns true when we want middleware function to run (when the user is authenticated)

        // ! returns false when we don't want middleware function to run (when the user is not authenticated)
        // ? in that case it will redirect the app to "/login" (what we have configured in api/auth/[...nextauth]/route.ts)

        const path = req.nextUrl.pathname;

        // Allow access to public pages
        // only public page is /login
        if (path === "/login") return true;

        return !!token;
      },
    },
  }
);

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/a/:path*", // Matches /a and all sub-paths like /a/chat, /a/connect, etc.
    "/login",
    "/",
  ],
};
