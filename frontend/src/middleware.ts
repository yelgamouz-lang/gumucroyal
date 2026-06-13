import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_ORIGIN = "https://gumucroyal.store";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://analytics.tiktok.com https://sc-static.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.gumucroyal.store https://connect.facebook.net https://analytics.tiktok.com https://tr.snapchat.com",
    "media-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

function getHostname(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded?.split(",")[0] ?? request.headers.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const hostname = getHostname(request);
  const proto = request.headers.get("x-forwarded-proto");

  if (hostname.endsWith("gumucroyal.store") && proto === "http") {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CANONICAL_ORIGIN
    );
    return applySecurityHeaders(NextResponse.redirect(destination, 301));
  }

  if (hostname === "www.gumucroyal.store") {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CANONICAL_ORIGIN
    );
    return applySecurityHeaders(NextResponse.redirect(destination, 301));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|txt)$).*)",
  ],
};
