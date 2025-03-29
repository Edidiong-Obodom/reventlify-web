import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET })

  // 3. Decrypt the session from the cookie
  const session = token;

  console.log("session: ", session);
  

  // 4. Redirect
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (
    isPublicRoute &&
    session?.user &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
