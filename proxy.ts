import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth(function (req) {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Nepřihlášený → přesměruj na login
  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Přihlášený na /login → přesměruj na dashboard
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin-only routy
  if (pathname.startsWith("/admin") && (session?.user as any)?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)" ],
};
