"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { recordAnalyticsEvent } from "@/lib/analytics";

/** Records page views — backend filters to valid Morocco IPs only. */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const productMatch = pathname.match(/^\/products\/([^/]+)/);
    recordAnalyticsEvent({
      event_type: "page_view",
      path: pathname,
      product_slug: productMatch?.[1] ?? null,
    });
  }, [pathname]);

  return null;
}
