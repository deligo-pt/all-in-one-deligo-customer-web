/**
 * The icon registry.
 *
 * Every entry marked with an Iconify name is the icon the design actually uses:
 * the Figma layer names carry them verbatim — `mdi:food-outline`,
 * `carbon:delivery-parcel`, `material-symbols:star-rounded` (75 times on the
 * landing page alone). They were fetched once from api.iconify.design and are
 * committed here, so nothing is fetched at build time or at runtime and the set
 * cannot change under us.
 *
 * The eight marked `drawn` have no counterpart in the design — they are a
 * checkbox tick, a chevron, a plus. They stay hand-drawn rather than pulling a
 * ninth icon set in for shapes nobody specified.
 *
 * Bodies are raw SVG markup and are injected as HTML by `<Icon>`. That is safe
 * for exactly one reason: this file is static, committed, reviewed content, and
 * nothing outside it can add to the registry. Do not make this dynamic.
 *
 * Attribution, as the licences require:
 *
 *   Material Symbols, Material Design Icons, Carbon, Remix Icon  Apache 2.0
 *   Boxicons, Fluent UI System Icons, TDesign, Iconoir, @icons   MIT
 *   Lucide                                                       ISC
 *   IconaMoon                                                    CC BY 4.0
 *
 * Viewboxes differ between sets — 16, 24, 32, 36, 1200 — which is why each entry
 * carries its own rather than everything being forced to 24.
 */
export const ICONS = {
  check: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  "chevron-down": {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  "chevron-up": {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="m18 15-6-6-6 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  "chevron-left": {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  "chevron-right": {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  plus: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  minus: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M5 12h14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  alert: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M12 9v4m0 4h.01M10.3 4 2 18.2A2 2 0 0 0 3.7 21h16.6a2 2 0 0 0 1.7-2.8L13.7 4a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  food: {
    viewBox: "0 0 24 24",
    source: "mdi:food-outline",
    body: `<path fill="currentColor" d="M1 22c0 .54.45 1 1 1h13c.56 0 1-.46 1-1v-1H1zM8.5 9C4.75 9 1 11 1 15h15c0-4-3.75-6-7.5-6m-4.88 4c1.11-1.55 3.47-2 4.88-2s3.77.45 4.88 2zM1 17h15v2H1zM18 5V1h-2v4h-5l.23 2h9.56l-1.4 14H18v2h1.72c.84 0 1.53-.65 1.63-1.47L23 5z"/>`,
  },
  ride: {
    viewBox: "0 0 24 24",
    source: "mdi:car-outline",
    body: `<path fill="currentColor" d="M18.9 6c-.2-.6-.8-1-1.4-1h-11c-.7 0-1.2.4-1.4 1L3 12v8c0 .5.5 1 1 1h1c.6 0 1-.5 1-1v-1h12v1c0 .5.5 1 1 1h1c.5 0 1-.5 1-1v-8zM6.8 7h10.3l1.1 3H5.8zM19 17H5v-5h14zM7.5 13c.8 0 1.5.7 1.5 1.5S8.3 16 7.5 16S6 15.3 6 14.5S6.7 13 7.5 13m9 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5"/>`,
  },
  email: {
    viewBox: "0 0 24 24",
    source: "mdi:email-outline",
    body: `<path fill="currentColor" d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0l-8 5l-8-5zm0 12H4V8l8 5l8-5z"/>`,
  },
  groceries: {
    viewBox: "0 0 24 24",
    source: "boxicons:groceries",
    body: `<path fill="currentColor" d="M20 7h-.69a3.05 3.05 0 0 0-.21-4.1c-1.16-1.16-3.19-1.16-4.35 0l-2.04 2.04C12.07 3.23 10.44 2 8.5 2C6.02 2 4 4.02 4 6.5c0 .17 0 .34.03.5H4c-.52 0-.95.4-1 .92l-.91 10.92a2.007 2.007 0 0 0 1.99 2.17h15.83a2.007 2.007 0 0 0 1.99-2.17l-.91-10.92c-.04-.52-.48-.92-1-.92Zm-3.84-2.68c.41-.41 1.12-.41 1.53 0c.2.2.32.47.32.76s-.11.56-.32.76L16.53 7h-3.05zM6 6.5a2.5 2.5 0 0 1 5 0c0 .14-.01.29-.05.46c0 .01-.01.03-.01.04H6.05C6.02 6.84 6 6.67 6 6.5M4.09 19l.83-10h14.16l.83 10z" class="b"/><path fill="currentColor" d="M12 14c-1.65 0-3-1.35-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.65-1.35 3-3 3" class="b"/>`,
  },
  hotel: {
    viewBox: "0 0 24 24",
    source: "lucide:hotel",
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 22v-6.57M12 11h.01M12 7h.01M14 15.43V22m1-6a5 5 0 0 0-6 0m7-5h.01M16 7h.01M8 11h.01M8 7h.01"/><rect width="16" height="20" x="4" y="2" rx="2"/></g>`,
  },
  party: {
    viewBox: "0 0 24 24",
    source: "lucide:party-popper",
    body: `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10m8 3l-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17M11 2l.33.82c.34.86-.2 1.82-1.11 1.98c-.7.1-1.22.72-1.22 1.43V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5s-3.07-.07-5-2s-2.83-4.17-2-5s3.07.07 5 2"/></g>`,
  },
  parcel: {
    viewBox: "0 0 32 32",
    source: "carbon:delivery-parcel",
    body: `<path fill="currentColor" d="m29.482 8.624l-10-5.5a1 1 0 0 0-.964 0l-10 5.5a1 1 0 0 0 0 1.752L18 15.591V26.31l-3.036-1.67L14 26.391l4.518 2.485a1 1 0 0 0 .964 0l10-5.5A1 1 0 0 0 30 22.5v-13a1 1 0 0 0-.518-.876M19 5.142L26.925 9.5L19 13.858L11.075 9.5Zm9 16.767l-8 4.4V15.59l8-4.4Z"/><path fill="currentColor" d="M10 16H2v-2h8zm2 8H4v-2h8zm2-4H6v-2h8z"/>`,
  },
  electronics: {
    viewBox: "0 0 16 16",
    source: "fluent:phone-laptop-16-regular",
    body: `<path fill="currentColor" d="M3 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 14 4v5a1.5 1.5 0 0 1-1.5 1.5h-4v-1h4A.5.5 0 0 0 13 9V4a.5.5 0 0 0-.5-.5h-8A.5.5 0 0 0 4 4h-.5q-.26 0-.5.063zm11.5 8.5h-6v-1h6a.5.5 0 0 1 0 1m-10 0a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m-3-6A1.5 1.5 0 0 1 3 5h3a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 6 14H3a1.5 1.5 0 0 1-1.5-1.5zM3 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-6A.5.5 0 0 0 6 6z"/>`,
  },
  location: {
    viewBox: "0 0 24 24",
    source: "tdesign:location",
    body: `<g fill="none"><path d="M12 2a8 8 0 0 1 8 8c0 6.5-8 12-8 12s-8-5.5-8-12a8 8 0 0 1 8-8m0 5a3 3 0 1 0 0 6a3 3 0 0 0 0-6" clip-rule="evenodd"/><path stroke="currentColor" stroke-width="2" d="M20 10c0 6.5-8 12-8 12s-8-5.5-8-12a8 8 0 1 1 16 0Z"/><path stroke="currentColor" stroke-width="2" d="M15 10a3 3 0 1 1-6 0a3 3 0 0 1 6 0Z"/></g>`,
  },
  "my-location": {
    viewBox: "0 0 24 24",
    source: "material-symbols:my-location-outline-rounded",
    body: `<path fill="currentColor" d="M11 21.95v-1q-3.125-.35-5.363-2.587T3.05 13h-1q-.425 0-.712-.288T1.05 12t.288-.712T2.05 11h1q.35-3.125 2.588-5.363T11 3.05v-1q0-.425.288-.712T12 1.05t.713.288t.287.712v1q3.125.35 5.363 2.588T20.95 11h1q.425 0 .713.288t.287.712t-.287.713t-.713.287h-1q-.35 3.125-2.587 5.363T13 20.95v1q0 .425-.288.713T12 22.95t-.712-.287T11 21.95m5.95-5Q19 14.9 19 12t-2.05-4.95T12 5T7.05 7.05T5 12t2.05 4.95T12 19t4.95-2.05m-7.775-2.125Q8 13.65 8 12t1.175-2.825T12 8t2.825 1.175T16 12t-1.175 2.825T12 16t-2.825-1.175m4.238-1.412Q14 12.825 14 12t-.587-1.412T12 10t-1.412.588T10 12t.588 1.413T12 14t1.413-.587M12 12"/>`,
  },
  star: {
    viewBox: "0 0 24 24",
    source: "material-symbols:star-rounded",
    body: `<path fill="currentColor" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/>`,
  },
  "check-circle": {
    viewBox: "0 0 1200 1200",
    source: "el:ok-circle",
    body: `<path fill="currentColor" d="M600 0C268.63 0 0 268.63 0 600s268.63 600 600 600s600-268.63 600-600S931.369 0 600 0m0 130.371c259.369 0 469.556 210.325 469.556 469.629S859.369 1069.556 600 1069.556c-259.37 0-469.556-210.251-469.556-469.556C130.445 340.696 340.63 130.371 600 130.371m229.907 184.717L482.153 662.915L369.36 550.122L258.691 660.718l112.793 112.793l111.401 111.401l110.597-110.669l347.826-347.754z"/>`,
  },
  shop: {
    viewBox: "0 0 24 24",
    source: "iconoir:shop",
    body: `<g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9"/><path stroke-miterlimit="16" d="M14.833 21v-6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6"/><path d="m21.818 9.364l-1.694-5.929A.6.6 0 0 0 19.547 3H15.5l.475 5.704a.58.58 0 0 0 .278.45c.39.233 1.152.663 1.747.846c1.016.313 2.5.2 3.346.096a.57.57 0 0 0 .472-.732Z"/><path d="M14 10c.568-.175 1.288-.574 1.69-.812a.58.58 0 0 0 .28-.549L15.5 3h-7l-.47 5.639a.58.58 0 0 0 .28.55c.402.237 1.122.636 1.69.811c1.493.46 2.507.46 4 0Z"/><path d="m3.876 3.435l-1.694 5.93a.57.57 0 0 0 .472.73c.845.105 2.33.217 3.346-.095c.595-.183 1.358-.613 1.747-.845a.58.58 0 0 0 .278-.451L8.5 3H4.453a.6.6 0 0 0-.577.435Z"/></g>`,
  },
  search: {
    viewBox: "0 0 24 24",
    source: "iconamoon:search-light",
    body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"/>`,
  },
  notification: {
    viewBox: "0 0 24 24",
    source: "iconamoon:notification-bold",
    body: `<g fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 19v-9a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v9M6 19h12M6 19H4m14 0h2m-9 3h2"/><circle cx="12" cy="3" r="1"/></g>`,
  },
  close: {
    viewBox: "0 0 24 24",
    source: "at-icons:cross",
    body: `<path fill="currentColor" d="M12.293 2.293a1 1 0 0 1 1.414 1.414L9.414 8l4.293 4.293a1 1 0 1 1-1.414 1.414L8 9.414l-4.293 4.293a1 1 0 1 1-1.414-1.414L6.586 8L2.293 3.707a1 1 0 1 1 1.414-1.414L8 6.586z"/>`,
  },
  cart: {
    viewBox: "0 0 36 36",
    source: "clarity:shopping-cart-outline-badged",
    body: `<circle cx="13.33" cy="29.75" r="2.25" fill="currentColor" class="clr-i-outline--badged clr-i-outline-path-1--badged"/><circle cx="27" cy="29.75" r="2.25" fill="currentColor" class="clr-i-outline--badged clr-i-outline-path-2--badged"/><path fill="currentColor" d="M22.57 7a7.5 7.5 0 0 1-.07-1a7.5 7.5 0 0 1 .07-1H11.49l.65 2Z" class="clr-i-outline--badged clr-i-outline-path-3--badged"/><path fill="currentColor" d="M30 13.5h-.42L28.33 19h-15L8.76 4.53a1 1 0 0 0-.66-.65L4 2.62a1 1 0 1 0-.59 1.92L7 5.64l4.59 14.5l-1.64 1.34l-.13.13A2.66 2.66 0 0 0 9.74 25A2.75 2.75 0 0 0 12 26h16.69a1 1 0 0 0 0-2H11.84a.67.67 0 0 1-.56-1l2.41-2h15.44a1 1 0 0 0 1-.78l1.57-6.91a7.5 7.5 0 0 1-1.7.19" class="clr-i-outline--badged clr-i-outline-path-4--badged"/><circle cx="30" cy="6" r="5" fill="currentColor" class="clr-i-outline--badged clr-i-outline-path-5--badged clr-i-badge"/><path fill="none" d="M0 0h36v36H0z"/>`,
  },
  // Added in Phase 6 for the sign-in flow. All `drawn`: the Figma auth frames
  // were not re-measured for this pass (see Plan.md, Phase 6), so no Iconify
  // name can be claimed for them honestly. If the frames name real sets, these
  // six are the ones to swap.
  phone: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M7.5 3h9a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5v-15A1.5 1.5 0 0 1 7.5 3Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M10.5 18h3" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>`,
  },
  key: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M12 12h9m-3 0v3m-2.5-3v2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  gift: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M4 11h16v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5Zm-.5-4h17a.5.5 0 0 1 .5.5V11H3V7.5a.5.5 0 0 1 .5-.5Zm8.5 0v14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M12 7S10.5 3 8.5 3a2 2 0 0 0 0 4Zm0 0s1.5-4 3.5-4a2 2 0 0 1 0 4Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>`,
  },
  "arrow-left": {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M19 12H5m0 0 6-6m-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  user: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>`,
  },
  devices: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M14 17H3.5A1.5 1.5 0 0 1 2 15.5v-9A1.5 1.5 0 0 1 3.5 5h13A1.5 1.5 0 0 1 18 6.5V8" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 10h4a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/><path d="M6 20h5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>`,
  },
  // Added in Phase 7 for the food vertical. `tag` is the design's own
  // `ic:outline-local-offer` on the discount pill; the other two are drawn.
  clock: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  tag: {
    viewBox: "0 0 24 24",
    source: "ic:outline-local-offer",
    body: `<path fill="currentColor" d="m21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42M13 20.01L4 11V4h7v-.01l9 9z"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/>`,
  },
  sliders: {
    viewBox: "0 0 24 24",
    source: "drawn",
    body: `<path d="M4 6h10m4 0h2M4 12h4m4 0h8M4 18h10m4 0h2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><circle cx="16" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.75"/><circle cx="10" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.75"/><circle cx="16" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.75"/>`,
  },
} as const satisfies Record<string, { viewBox: string; source: string; body: string }>;

export type IconName = keyof typeof ICONS;
