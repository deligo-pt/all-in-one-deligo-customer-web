import { notFound } from "next/navigation";
import { Gallery } from "./Gallery";

/**
 * Every primitive, in every state, on one page.
 *
 * Same arrangement as `/tokens`: a development tool that prerenders as a 404 in
 * a production build. It is where a primitive is looked at before it is used,
 * and it is what makes `verify:design`'s "every token is rendered" rule have
 * something to be true about.
 */
export default function PrimitivesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Gallery />;
}
