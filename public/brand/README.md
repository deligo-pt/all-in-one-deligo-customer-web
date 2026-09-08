# Provider brand marks

`google.svg` and `facebook.svg` are the providers' **own** artwork, reproduced
byte-for-byte from their published brand guidelines. They live here rather than
in `src/lib/icons.ts` for two reasons, and both matter:

1. **They carry their own colours.** `#4285F4`, `#34A853`, `#FBBC05`,
   `#EA4335`, `#1877F2`. Every other icon in this app is drawn in
   `currentColor` so a role can recolour it — these must never be recoloured.
   Google and Facebook both mandate the exact artwork and hues, and Facebook
   checks compliance during App Review. Recolouring one to DeliGo pink is not a
   design decision that is open to us.

2. **`verify:design` forbids a colour literal anywhere under `src/`**, and
   correctly: a hex in a component is a colour that no longer has a name. These
   two files are not colours we chose, so the honest place for them is outside
   the token system entirely — as assets, served as-is.

Rendered by `BrandMark` in `src/features/auth/`, through `next/image` with
`unoptimized` set: the optimiser does not process SVG, and at ~700 bytes there
is nothing for it to do.

**Do not recolour, restyle, crop, or redraw these.** If a provider updates its
mark, replace the file.
