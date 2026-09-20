import { AppShell } from "@/components/layout/AppShell";

// An account route — the header lists the six verticals. Push moved to the
// locale layout in Phase 20g: an order update should reach a customer who is
// reading a menu, not only one who is already on their orders.
export default function AccountLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="app">{children}</AppShell>;
}
