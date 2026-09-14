import { notFound } from "next/navigation";
import { AuthPanel, toContactNumber } from "@/features/auth";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import type { AuthFlowOptions } from "@/features/auth";

/**
 * Every state of the sign-in panel, at once.
 *
 * It exists because of an honest awkwardness in Track B: the transport is not
 * wired (Phase 15 does that), so pressing "Send code" fails by design and the
 * verify step, the resend cooldown and the device-limit dialog cannot be
 * reached by using the product. A screen nobody can render is a screen nobody
 * has reviewed, and "it will be fine once the API lands" is how a flow arrives
 * in Phase 15 with three unseen states in it.
 *
 * So the states are rendered directly from their initial props. Nothing is
 * faked: no request is made, no session is invented, no success is simulated.
 * These are the same component with different starting values.
 *
 * Development only, and it 404s in production — the same treatment as
 * `/tokens`, `/primitives` and `/formats`, and for the same reason.
 *
 * Every label here is a state name rendered from the array below, so this page
 * has no prose and needs no dictionary. `verify:i18n` checks that.
 */
const STATES = [
  { id: "identify · phone", props: { initialMode: "phone" } },
  { id: "identify · email", props: { initialMode: "email" } },
  {
    id: "verify · sms",
    props: {
      initialStep: "verify",
      // Joined by the same function the form uses, so the fixture cannot
      // drift from what a real submission would produce.
      initialSentTo: { contactNumber: toContactNumber("912345678") },
    },
  },
  {
    id: "verify · email",
    props: {
      initialStep: "verify",
      initialSentTo: { email: "you@example.com" },
    },
  },
  { id: "device limit", props: { initialDeviceLimit: true } },
] as const satisfies ReadonlyArray<{ id: string; props: AuthFlowOptions }>;

export default async function AuthStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [auth, common] = await Promise.all([
    loadNamespace(locale, "auth"),
    loadNamespace(locale, "common"),
  ]);

  return (
    <TranslationProvider locale={locale} messages={{ common, auth }}>
      <div className="mx-auto grid w-full max-w-shell gap-10 p-8 lg:grid-cols-2">
        {STATES.map((state) => (
          <section
            key={state.id}
            className="border-line rounded-24 bg-surface flex flex-col gap-6 border p-8"
          >
            <h2 className="text-13 text-ink-subtle tracking-wide uppercase">
              {state.id}
            </h2>
            <AuthPanel offline {...state.props} />
          </section>
        ))}
      </div>
    </TranslationProvider>
  );
}
