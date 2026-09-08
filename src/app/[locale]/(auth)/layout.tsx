import { AppShell } from "@/components/layout/AppShell";

// Signing in is a task, not a destination. The shell's `auth` variant keeps the
// mark, the language control, the skip link and the `<main>` landmark, and
// drops the six verticals, the search field, the cart and the footer — every
// one of which is a way to leave without finishing.
export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell variant="auth">{children}</AppShell>;
}
