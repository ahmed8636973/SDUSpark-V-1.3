import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // استثناء الملفات الـ static والـ API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // السماح فقط لـ /admin
  if (pathname.startsWith("/admin")) {
    const adminEmail = "admin@eduspark.com"

    // بافترض إنك بتخزن إيميل المستخدم بعد الـ login في الكوكيز
    const userEmail = request.cookies.get("userEmail")?.value

    if (userEmail !== adminEmail) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
