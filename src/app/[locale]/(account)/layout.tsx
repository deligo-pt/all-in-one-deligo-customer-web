import { AppShell } from "@/components/layout/AppShell";
import { PushListener } from "@/components/shared/PushListener";
import { getTranslations } from "@/i18n/server";

// An account route — the header lists the six verticals. Order updates pushed
// while the customer is here re-read the page (Phase 19).
export default async function AccountLayout({ children }: LayoutProps<"/[locale]">) {
  const t = await getTranslations("orders");
  return (
    <AppShell variant="app">
      {children}
      <PushListener closeLabel={t("close")} />
    </AppShell>
  );
}
