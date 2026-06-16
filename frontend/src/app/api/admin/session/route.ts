import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getBackendUrl } from "@/lib/adminApiServer";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ authenticated: false });
    }
    const data = (await res.json()) as { username: string };
    return NextResponse.json({ authenticated: true, username: data.username });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
