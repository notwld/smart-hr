import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip checking for auth-related routes
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.startsWith("/api/upload") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  
  // If user is not logged in and trying to access protected route, redirect to login
  if (!token && !request.nextUrl.pathname.startsWith("/api")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // If user is logged in, check if their account is active
  if (token?.id) {
    const userStatus = (token as any).status as string | undefined;
    // If user is not active and not on the login page
    if (userStatus && userStatus !== "ACTIVE" && request.nextUrl.pathname !== "/login") {
      // For API routes, return unauthorized
      if (request.nextUrl.pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ 
            message: `Your account is ${userStatus.toLowerCase()}. Please contact administrator.` 
          }),
          { status: 401, headers: { "content-type": "application/json" } }
        );
      }

      // For regular routes, redirect to login with error message
      const url = new URL("/login", request.url);
      url.searchParams.set("error", `Your account is ${userStatus.toLowerCase()}. Please contact administrator.`);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
}; 