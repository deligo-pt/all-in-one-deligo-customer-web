import { notFound } from "next/navigation";

/**
 * The design system, rendered.
 *
 * Two jobs. It is the reference every later phase reads instead of reopening
 * Figma, and it is the thing that makes `verify:design`'s "every token is used"
 * rule true — a token that nothing renders here has no proof it works, and the
 * guard says so.
 *
 * Development only. It is a tool, not a page: a customer has no reason to see
 * it and Plan.md §24 would otherwise have to remember to delete it.
 *
 * Every string on this page is a token name. There is no prose, which is why it
 * needs no dictionary — `verify:i18n` checks that, and it holds by construction
 * rather than by exemption.
 */

const BRAND = [
  { name: "brand-tint", from: "--dg-pink-50", swatch: "bg-brand-tint" },
  { name: "brand-pale", from: "--dg-pink-100", swatch: "bg-brand-pale" },
  { name: "brand-soft", from: "--dg-pink-200", swatch: "bg-brand-soft" },
  { name: "brand-mid", from: "--dg-pink-400", swatch: "bg-brand-mid" },
  { name: "brand", from: "--dg-pink-500", swatch: "bg-brand" },
  { name: "focus", from: "--dg-pink-600", swatch: "bg-focus" },
  { name: "brand-strong", from: "--dg-pink-700", swatch: "bg-brand-strong" },
  { name: "brand-deep", from: "--dg-pink-800", swatch: "bg-brand-deep" },
];

const SURFACES = [
  { name: "surface", from: "--dg-white", swatch: "bg-surface" },
  { name: "surface-subtle", from: "--dg-grey-25", swatch: "bg-surface-subtle" },
  { name: "surface-warm", from: "--dg-warm-25", swatch: "bg-surface-warm" },
  { name: "surface-muted", from: "--dg-grey-50", swatch: "bg-surface-muted" },
];

const STATES = [
  { name: "success", from: "--dg-green", swatch: "bg-success" },
  { name: "warning", from: "--dg-amber", swatch: "bg-warning" },
  { name: "rating", from: "--dg-amber", swatch: "bg-rating" },
  { name: "danger", from: "--dg-red", swatch: "bg-danger" },
];

const INKS = [
  { name: "ink", from: "--dg-grey-800", text: "text-ink" },
  { name: "ink-strong", from: "--dg-grey-900", text: "text-ink-strong" },
  { name: "ink-muted", from: "--dg-grey-600", text: "text-ink-muted" },
  { name: "ink-subtle", from: "--dg-grey-400", text: "text-ink-subtle" },
  { name: "ink-warm", from: "--dg-warm-800", text: "text-ink-warm" },
];

const LINES = [
  { name: "line", from: "--dg-grey-200", border: "border-line" },
  { name: "line-subtle", from: "--dg-grey-100", border: "border-line-subtle" },
  { name: "line-strong", from: "--dg-grey-400", border: "border-line-strong" },
  { name: "line-warm", from: "--dg-warm-200", border: "border-line-warm" },
];

const TYPE = [
  { name: "text-8", cls: "text-8" },
  { name: "text-10", cls: "text-10" },
  { name: "text-12", cls: "text-12" },
  { name: "text-13", cls: "text-13" },
  { name: "text-14", cls: "text-14" },
  { name: "text-16", cls: "text-16" },
  { name: "text-18", cls: "text-18" },
  { name: "text-20", cls: "text-20" },
  { name: "text-24", cls: "text-24" },
  { name: "text-32", cls: "text-32" },
  { name: "text-40", cls: "text-40" },
  { name: "text-48", cls: "text-48" },
  { name: "text-56", cls: "text-56" },
];

const LEADING = [
  { name: "leading-tight", cls: "leading-tight" },
  { name: "leading-snug", cls: "leading-snug" },
  { name: "leading-normal", cls: "leading-normal" },
  { name: "leading-relaxed", cls: "leading-relaxed" },
  { name: "leading-loose", cls: "leading-loose" },
];

const TRACKING = [
  { name: "tracking-tight", cls: "tracking-tight" },
  { name: "tracking-snug", cls: "tracking-snug" },
  { name: "tracking-normal", cls: "tracking-normal" },
  { name: "tracking-wide", cls: "tracking-wide" },
  { name: "tracking-wider", cls: "tracking-wider" },
];

const RADII = [
  { name: "rounded-4", cls: "rounded-4" },
  { name: "rounded-8", cls: "rounded-8" },
  { name: "rounded-10", cls: "rounded-10" },
  { name: "rounded-12", cls: "rounded-12" },
  { name: "rounded-16", cls: "rounded-16" },
  { name: "rounded-20", cls: "rounded-20" },
  { name: "rounded-24", cls: "rounded-24" },
  { name: "rounded-32", cls: "rounded-32" },
  { name: "rounded-full", cls: "rounded-full" },
];

const SHADOWS = [
  { name: "shadow-xs", cls: "shadow-xs" },
  { name: "shadow-sm", cls: "shadow-sm" },
  { name: "shadow-md", cls: "shadow-md" },
  { name: "shadow-lg", cls: "shadow-lg" },
  { name: "shadow-card", cls: "shadow-card" },
  { name: "shadow-brand", cls: "shadow-brand" },
  { name: "shadow-focus", cls: "shadow-focus" },
];

// Hover each one. Under `prefers-reduced-motion` none of them move, which is
// the opt-out block in globals.css doing its job and is worth being able to see.
const MOTION = [
  { name: "transition (default)", cls: "" },
  { name: "duration-fast", cls: "duration-[var(--dg-duration-fast)]" },
  { name: "ease-in-out", cls: "ease-in-out" },
  { name: "ease-linear", cls: "ease-linear" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line-subtle border-t pt-8">
      <h2 className="text-ink-subtle text-12 tracking-wider mb-4 font-medium uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function TokensPage() {
  // A build is a production build, so this route prerenders as a 404 and never
  // reaches a customer. In `next dev` it renders.
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="bg-surface mx-auto max-w-5xl space-y-10 px-8 py-16">
      <h1 className="text-32 text-ink-strong tracking-tight font-semibold">
        {"DeliGo"}
      </h1>

      <Section title="--color · brand">
        <div className="grid grid-cols-4 gap-4">
          {BRAND.map((c) => (
            <div key={c.name}>
              <div
                className={`${c.swatch} border-line-subtle h-16 rounded-12 border`}
              />
              <p className="text-12 text-ink mt-2 font-medium">{c.name}</p>
              <p className="text-10 text-ink-subtle">{c.from}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="--color · surface">
        <div className="grid grid-cols-4 gap-4">
          {SURFACES.map((c) => (
            <div key={c.name}>
              <div className={`${c.swatch} border-line h-16 rounded-12 border`} />
              <p className="text-12 text-ink mt-2 font-medium">{c.name}</p>
              <p className="text-10 text-ink-subtle">{c.from}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="--color · state">
        <div className="grid grid-cols-4 gap-4">
          {STATES.map((c) => (
            <div key={c.name}>
              <div
                className={`${c.swatch} border-line-subtle h-16 rounded-12 border`}
              />
              <p className="text-12 text-ink mt-2 font-medium">{c.name}</p>
              <p className="text-10 text-ink-subtle">{c.from}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="--color · ink">
        <div className="space-y-1">
          {INKS.map((c) => (
            <p key={c.name} className={`${c.text} text-16`}>
              {c.name}
              <span className="text-ink-subtle text-12">{` ${c.from}`}</span>
            </p>
          ))}
          <p className="bg-ink-strong text-ink-inverse rounded-8 px-3 py-2 text-16">
            {"ink-inverse"}
          </p>
        </div>
      </Section>

      <Section title="--color · line">
        <div className="grid grid-cols-4 gap-4">
          {LINES.map((c) => (
            <div key={c.name}>
              <div className={`${c.border} h-16 rounded-12 border-2`} />
              <p className="text-12 text-ink mt-2 font-medium">{c.name}</p>
              <p className="text-10 text-ink-subtle">{c.from}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="--text">
        <div className="space-y-2">
          {TYPE.map((t) => (
            <p key={t.name} className={`${t.cls} text-ink`}>
              {t.name}
            </p>
          ))}
        </div>
      </Section>

      <Section title="--leading">
        <div className="grid grid-cols-5 gap-4">
          {LEADING.map((l) => (
            <p key={l.name} className={`${l.cls} text-12 text-ink`}>
              {`${l.name} ${l.name} ${l.name} ${l.name}`}
            </p>
          ))}
        </div>
      </Section>

      <Section title="--tracking">
        <div className="space-y-1">
          {TRACKING.map((l) => (
            <p key={l.name} className={`${l.cls} text-20 text-ink`}>
              {l.name}
            </p>
          ))}
        </div>
      </Section>

      <Section title="--radius">
        <div className="grid grid-cols-5 gap-4">
          {RADII.map((r) => (
            <div key={r.name}>
              <div className={`${r.cls} bg-brand-tint h-16`} />
              <p className="text-12 text-ink mt-2">{r.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="--shadow">
        <div className="grid grid-cols-4 gap-6">
          {SHADOWS.map((s) => (
            <div key={s.name}>
              <div className={`${s.cls} bg-surface rounded-12 h-16`} />
              <p className="text-12 text-ink mt-3">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="--ease · --duration">
        <div className="grid grid-cols-4 gap-4">
          {MOTION.map((m) => (
            <div key={m.name}>
              <div
                className={`${m.cls} bg-brand-soft hover:bg-brand rounded-8 h-12 transition-colors`}
              />
              <p className="text-12 text-ink mt-2">{m.name}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
