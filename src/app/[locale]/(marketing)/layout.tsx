import { AppShell } from "@/components/layout/AppShell";

// The pages a visitor arrives at — the marketing header.
export default function MarketingLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="marketing">{children}</AppShell>;
}
