// /middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // 🔐 make sure this matches .env
  });

  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!token && !isLoginPage) {
    // Not authenticated, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isLoginPage) {
    // Already authenticated, redirect away from login
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|public|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)",
  ],
};

