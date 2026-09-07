import { AppShell } from "@/components/layout/AppShell";

// A shopping route — the header lists the six verticals.
export default function ShopLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="app">{children}</AppShell>;
}
