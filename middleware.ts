import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/notifications"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 3. Decrypt the session from the cookie
  const session = token;
  let isTokenExpired = false;

  if (session?.expiresAt && typeof session.expiresAt === "number") {
    const currentDate = new Date();
    const timestamp = Math.floor(currentDate.getTime() / 1000);

    isTokenExpired = session.expiresAt < timestamp;
  }

  // 🚨 If token is expired, redirect to sign-in (optionally, you can clear cookies here)
  if (isTokenExpired) {
    const response = NextResponse.redirect(new URL("/signin", req.nextUrl));
    // Optionally: clear the session cookie to force re-authentication
    response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
    return response;
  }

  // 4. Redirect
  if (
    (isProtectedRoute || path.includes("profile")) &&
    !session?.id
  ) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.user &&
    !path.startsWith("/dashboard")
    // path.startsWith("/profile/") &&
    // path !== "/profile/edit"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// ⬇️ This config ensures middleware only runs on relevant paths
export const config = {
  matcher: [
    /*
      Only apply middleware to pages, not API or static files
    */
    '/((?!api|_next|favicon.ico|.*\\.).*)',
  ],
}
