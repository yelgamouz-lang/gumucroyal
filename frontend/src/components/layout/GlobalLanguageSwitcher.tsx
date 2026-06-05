"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

/** Desktop only — fixed top-left, outside header overflow. */
export function GlobalLanguageSwitcher() {
  return (
    <div className="hidden md:block fixed top-5 left-5 z-[200] pointer-events-auto">
      <LanguageSwitcher />
    </div>
  );
}
