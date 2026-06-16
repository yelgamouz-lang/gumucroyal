import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, getBackendUrl } from "@/lib/adminApiServer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${getBackendUrl()}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    return NextResponse.json({ detail: "Too many attempts" }, { status: 429 });
  }
  if (!res.ok) {
    return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
  }

  const data = (await res.json()) as { token: string };
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}
