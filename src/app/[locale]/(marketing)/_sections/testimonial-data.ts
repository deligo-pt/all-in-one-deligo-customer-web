/**
 * The nine testimonials the design carries.
 *
 * **These came out of a design file, not out of a database.** They are named
 * people making claims about a product, which is the kind of content that has
 * to be true before it is published — see decision D-9 in Plan.md. Until either
 * a reviews endpoint exists or the client confirms these are real, approved
 * testimonials, this file is the one place to replace.
 *
 * Two things are deliberately not translated. The quotes: you do not translate
 * a statement attributed to a named person — a Portuguese reader sees what
 * Emma actually said, the way every real testimonial section works. And the
 * countries: those are ISO codes, resolved through `Intl.DisplayNames`, so
 * "FR" reads as "France" or "França" without either being written down.
 *
 * Dates are ISO and formatted for the active locale at render.
 */
export type Testimonial = {
  name: string;
  /** ISO 3166-1 alpha-2. */
  region: string;
  quote: string;
  /** ISO date; the design shows month and year. */
  date: string;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "Emma John",
    region: "FR",
    quote: "Absolutely love it. The quality is top-notch.",
    date: "2026-04-01",
  },
  {
    name: "Elanor Pera",
    region: "US",
    quote: "Transparent pricing and great value.",
    date: "2025-06-01",
  },
  {
    name: "Phyllis Godley",
    region: "CN",
    quote: "Delivery was quick and product is exactly as shown.",
    date: "2026-06-01",
  },
  {
    name: "Michael Chen",
    region: "SG",
    quote: "Fast delivery, friendly rider, and my order arrived exactly as expected.",
    date: "2026-03-01",
  },
  {
    name: "Liam Ander",
    region: "CN",
    quote: "Booking a ride was effortless, and the driver arrived right on time.",
    date: "2026-03-01",
  },
  {
    name: "Lauralee Quintero",
    region: "RU",
    quote:
      "Fresh groceries delivered in under an hour. Everything was perfectly packed.",
    date: "2026-07-01",
  },
  {
    name: "Arjun Mehta",
    region: "IN",
    quote: "Hotel booking was quick and easy.",
    date: "2025-07-01",
  },
  {
    name: "Brittni Lando",
    region: "CN",
    quote: "Transparent pricing and great value.",
    date: "2026-05-01",
  },
  {
    name: "Hannah Burress",
    region: "GB",
    quote: "Hotel booking was quick and easy.",
    date: "2026-04-01",
  },
];
