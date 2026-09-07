import { PagePlaceholder } from "@/components/shared/PagePlaceholder";

// Placeholder until Phase 5. The route exists now because the header
// and footer link to it, and a link whose target does not exist is a 404 that
// nobody finds until a customer does. See src/lib/routes.ts.
export default function Page() {
  return <PagePlaceholder route="services" />;
}
