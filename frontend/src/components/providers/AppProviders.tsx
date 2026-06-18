"use client";

import { useEffect } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncHidden = () => {
      if (document.hidden) {
        document.documentElement.dataset.pageHidden = "true";
      } else {
        delete document.documentElement.dataset.pageHidden;
      }
    };

    syncHidden();
    document.addEventListener("visibilitychange", syncHidden);
    return () => document.removeEventListener("visibilitychange", syncHidden);
  }, []);

  return <I18nProvider>{children}</I18nProvider>;
}
