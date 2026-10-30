# Design system — "Dark cinematic"

Source of truth for the site's visual language (2026-10-29). Built with the `ui-ux-pro-max`
skill: its `--design-system` pass recommended a storytelling layout, Liquid Glass surfaces,
spacious density and standard (not flashy) motion. Its default palette (black + gold,
Cormorant/Montserrat) was set aside because it fights the red logo and the splash
photography; the direction below keeps every existing asset and builds on the bottles photo.

Tokens live in `src/index.css` (`@theme`).

## Color

| Token | Value | Use |
|---|---|---|
| `ink` | `#0B1220` | Page background (the navy of `bottles.webp`) |
| `ink-raised` | `#111A2E` | Alternate section band, giving rhythm |
| `cream` | `#F5F1EA` | Headings, primary text |
| `muted` | cream @ 68% | Body copy |
| `line` | white @ 8% | Hairlines, card borders |
| `brand` | `#E0282E` (+ `-hover`, `-active`) | **Fills only**: primary CTA. White on it = 4.7:1 |
| `secondary` | `#FE806B` (coral) | **Accent text** on ink: eyebrows, active nav. 7.6:1 |

Rule: never set red text on ink (4.0:1, fails AA for body sizes). Use coral.

## Type

- **Display**: Playfair Display Variable (self-hosted, `@fontsource-variable/playfair-display`),
  weight 500, `line-height 1.02`, `letter-spacing -0.02em`, `text-wrap: balance` → `.display`
- **Body**: Inter Variable with optical sizing, 17–18px, `leading-relaxed`, `max-w-prose`
- **Eyebrow**: 12px, 600, uppercase, `0.2em` tracking, coral → `.eyebrow`
- Scale: hero `clamp(3.25rem, 8vw, 6.5rem)` · section h2 `clamp(2.25rem, 4.5vw, 3.5rem)` ·
  card title 28px

## Layout

- Container `max-w-6xl`, gutters `px-6 md:px-10`
- Sections `py-24 md:py-36`, separated by a hairline top border; tones alternate base/raised
- Each section opens with a numbered eyebrow ("01 — Nos produits") and a left-aligned display h2

## Surfaces

- **Glass card**: `rounded-3xl`, `border-line`, `bg-white/[.03]`, `p-2` bezel around a
  `rounded-2xl` image. Hover: border to white/20, image scale 1.03 over 500ms
- **Header**: transparent over the hero; `.material-chrome` (blur 24px, ink @ 72%) materializes
  once the page scrolls >24px. Solid under reduced transparency / more contrast
- No drop shadows on dark (invisible); the only glow is the primary CTA's soft red shadow

## Background decor (`src/components/common/Decor.tsx`)

Static, aria-hidden layers passed to `Section` via `decor`, drawn behind the content. Use them
only where a section has real empty space; hidden under `prefers-contrast: more`.

- `Grain`: fractal-noise film grain at 7% (overlay blend), so flat ink reads as a material
- `Glow`: a blurred pool of brand red or coral, echoing the splashes in the photography
- `Watermark`: oversized outlined display word (1px stroke, white @ 7%), cropped by the edge
- `Rings`: concentric hairline circles fading out radially, with a coral center dot

Current use: **02 About** = red glow behind the image + "Kola" watermark bottom-right + grain.
**04 Contact** = rings + coral glow filling the side beside the form (md+ only) + grain.

## Components

- **Button** `primary` (brand pill) / `secondary` (glass ghost); sizes `sm|md|lg`, all ≥ 44px;
  optional `withArrow`; press = scale 0.97
- **Section** `tone`, `eyebrow`, `sectionTitle`
- **Reveal**: fade + 16px rise, 600ms `cubic-bezier(.22,1,.36,1)`, 80ms stagger by `index`.
  Hidden only under `html.js-reveal` so prerendered/no-JS content is always visible;
  final state immediately under reduced motion. Never wrap the hero (LCP).

## Don't

- Gold, floating dots/blobs, looping or animated decor (decor stays static)
- More than one red primary CTA per view (the hero pairs it with a ghost)
- Raw hex in components: add a token
