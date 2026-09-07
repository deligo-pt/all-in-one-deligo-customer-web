import { AppShell } from "@/components/layout/AppShell";

// Cart and checkout — the header lists the six verticals.
export default function CheckoutLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="app">{children}</AppShell>;
}
