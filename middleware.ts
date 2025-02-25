import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get("auth_token"); // Replace with your actual auth method
  console.log("Middleware triggered for:", req.nextUrl.pathname); // Debugging

  // Define public pages (pages that don’t require authentication)
  const publicPaths = ["/auth/login", "/auth/register", "/public-page"];
  const isPublicPage = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  // Redirect if user is not logged in and trying to access a protected page
  if (!isLoggedIn && !isPublicPage) {
    console.log("Redirecting to login from:", req.nextUrl.pathname); // Debugging
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next(); // Continue to the requested page
}

// Apply middleware to ALL routes
export const config = {
  matcher: "/stores/:path*",
};
