import { AppShell } from "@/components/layout/AppShell";

// A service vertical — the header lists the six verticals.
export default function ServicesLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="app">{children}</AppShell>;
}
