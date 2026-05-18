import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    
    // Protect /admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (role !== "ADMIN" && role !== "TECHNICIAN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
    // Protect /dashboard routes (User only)
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!role) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
