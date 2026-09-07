# Landing page imagery

Exported from the Figma file (`kYeB8Poqz2MKZXDagWx9Vq`, page `Deligo website`,
frame `Home` at `2280:6201`) on 6 September 2026, converted to WebP and resized
to roughly twice their display size. `next/image` serves AVIF where the browser
accepts it — the hero is 71 KB as WebP and 40 KB as AVIF.

| File | Used by | Source in Figma | Source px |
|---|---|---|---|
| `hero.webp` | Hero background | `Desktop - 2 › pic` | **626 × 417** |
| `service-1…6.webp` | Explore Services grid, in order | `service › Frame 464…469` | 600–1200 wide |
| `about.webp` | Designed for your modern life | `ceo › image 1` | 1200 × 1500 |
| `app-food.webp`, `app-home.webp` | Download app, phone mockups | `Download app › Group 3` | 1530 × 3036 |
| `apple.webp`, `google-play.webp` | Store badge marks | `Download app › image 2/3` | 500 × 500 |

`../logo.svg` is the DeliGo mark, exported from node `2997:8406` as SVG.

## Two things still outstanding

**The hero source is 626 × 417** and is displayed across a 1440px viewport — a
2.3× upscale, and it will look soft. That is the resolution the design file
itself contains, so it is not a conversion mistake; a higher-resolution original
is needed from whoever supplied it.

**The store badges are reconstructions.** Apple and Google both require their
official badge artwork rather than a rebuilt lozenge. What is here matches the
design; it still needs replacing with the supplied assets before launch.

None of these images carry a watermark — they were checked individually, which
corrects the assumption behind decision D-5.
