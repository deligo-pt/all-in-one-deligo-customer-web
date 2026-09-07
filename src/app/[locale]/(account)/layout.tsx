import { AppShell } from "@/components/layout/AppShell";

// An account route — the header lists the six verticals.
export default function AccountLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="app">{children}</AppShell>;
}
