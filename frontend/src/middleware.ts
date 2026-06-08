import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_ORIGIN = "https://gumucroyal.store";

function getHostname(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded?.split(",")[0] ?? request.headers.get("host") ?? "";
  return host.split(":")[0].toLowerCase();
}

export function middleware(request: NextRequest) {
  const hostname = getHostname(request);

  if (hostname === "www.gumucroyal.store") {
    const destination = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      CANONICAL_ORIGIN
    );
    return NextResponse.redirect(destination, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
