"use client";

import { I18nProvider } from "@/i18n/I18nProvider";
import { GlobalLanguageSwitcher } from "@/components/layout/GlobalLanguageSwitcher";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <GlobalLanguageSwitcher />
      {children}
    </I18nProvider>
  );
}
