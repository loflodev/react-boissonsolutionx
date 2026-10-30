# Interaction & visual design audit (Apple design principles)

Run: 2026-10-29 · Reviewed against Apple's WWDC design guidance (*Designing Fluid Interfaces*,
*The Details of UI Typography*, *Principles of Great Design*), adapted for the web.

This is a one-page marketing site with no drag or gesture-driven UI, so springs, momentum
projection, velocity handoff and rubber-banding don't apply, and adding a motion library for
them would cost more than it gives. The findings below are about press feedback, the mobile
menu, the header material, typography, form feedback and consistency.

## Response (press feedback)

- [x] Buttons and link-buttons now respond on press, not only on hover: `active:scale-[0.97]` with a
  100 ms ease-out, plus a pressed color per variant. The unused `--color-btn-active` token is now
  used by the primary variant. The same feedback applies to the hamburger button, back-to-top and
  the "Réessayer" button.
- [x] Bug: a loading button had both `bg-gray-400` and the variant's `bg-red-600`, so which color
  showed depended on CSS order. While loading, the button now gets only the gray classes and no
  press feedback.
- [x] Tailwind v4 `scale-*`/`translate-*` set the standalone `scale`/`translate` properties, so the
  transitions list `scale`/`translate`, not `transform`. Listing `transform` would animate nothing.

## Materials & depth

- [x] The header was `bg-gray-900 opacity-95`, which faded the *whole header* (logo and text too)
  instead of making it a surface. It's now a translucent material (`.material-chrome`: 72% gray-900,
  `blur(24px) saturate(160%)`, a faint light bottom edge), so content scrolls visibly beneath it.
- [x] The blur sits on a `::before` layer. If `backdrop-filter` were on the header itself, the
  header would become a backdrop root, and the nested mobile menu's blur would only see the
  header, not the page.
- [x] `prefers-reduced-transparency: reduce` falls back to solid gray-900 with no blur.
  `prefers-contrast: more` uses solid gray-900 with a clearly visible border.

## Mobile menu: spatial consistency & interruptibility

- [x] It used to mount and unmount instantly. It now stays mounted and slides down out of the
  header (`origin-top`, 8 px + opacity, 200 ms), then exits back up the same path. Because it's a
  state-driven CSS transition, tapping again mid-animation reverses from the current position
  with no jump.
- [x] The closed menu is `inert`, so its links can't be tabbed to or read by screen readers.
- [x] The hamburger icon morphs to ✕ while open, so the state shows on the control itself.
- [x] It now closes on outside press, as well as on Escape and when a link is chosen.
- [x] The fixed `h-[35vh]` height and the `opacity-95` text fade are gone. The menu sizes to its
  content and uses the header material.

## Wayfinding ("where am I?")

- [x] New `useActiveSection` hook (IntersectionObserver, client-only) highlights the current
  section in both navs (`text-secondary` + `aria-current="true"`).
  Known limit: in dev, sections that mount after the WordPress fetch (hero, products) aren't
  observed until the next full load. In production the prerendered data is there on the first
  render, so this doesn't happen.

## Typography

- [x] Large bold headings had `tracking-wide`, which is the wrong direction for display sizes. Section
  h2s, the About h2 and the hero kicker now use `tracking-tight`. The hero h1 uses `leading-[1.05]`
  + `tracking-tight`. Headings use `text-balance`.
- [x] The About paragraph was larger on mobile (`text-xl`) than on desktop (`md:text-lg`). It's now
  `text-lg leading-relaxed` everywhere.
- [x] Product feature labels at `text-[11px]` were below comfortable legibility. They're now `text-xs`
  with slight positive tracking (small text gets tracking added, large text gets it removed).
- [x] Inter is now loaded with its optical-size axis (`@fontsource-variable/inter/opsz.css`, same
  `Inter Variable` family) with `font-optical-sizing: auto`, so letterforms adapt to size. Cost:
  the latin woff2 is ~73 kB instead of the weight-only file.

## Feedback: inline validation

- [x] Errors used to appear only on submit. Fields are now validated on blur through the existing
  `validateContactForm` (no duplicate rules). Empty fields wait for submit so that tabbing
  through the form doesn't trigger errors. Errors still clear as the user types.
- [x] The `.form-input` border color transitions (150 ms), so the error state doesn't snap.

## Motion with a purpose

- [x] Removed the infinite `animate-pulse` on the three hero dots. They were a decorative loop with
  no meaning, and slow looping oscillation is what the reduced-motion guidance tells you to avoid.
  The dots stay as static decoration. Removed the redundant wrapper divs around the blur blobs.
- [x] The loading state was a full-screen `fixed bg-black/75` overlay that hid the header and static
  sections and caused a sudden switch to dark. It's now an in-flow `min-h-screen bg-gray-900`
  placeholder in the hero's slot, so the dark hero arrives where the placeholder was.

## Consistency & craft

- [x] The back-to-top button was teal with leftover `dark:` classes and didn't match the brand.
  It now uses the brand red like the other CTAs.
- [x] Removed the dead `text-teal-600 dark:text-teal-600` from the logo link.
- [x] The "Où acheter" icons didn't match their labels (Mail → delivery, Phone → wholesale). They're
  now Truck / MapPin / Store.
- [x] The Contact card key was `${item}-${index}` → `"[object Object]-0"`; it's now `item.title`.

## Not changed

- Springs, momentum, rubber-banding: there are no draggable or gesture-driven elements.
- Sound/haptics: there's no meaningful moment for them on a marketing site.

---

## Re-audit after the premium redesign

The "Dark cinematic" redesign (see `docs/design-system.md`) passed the motion, material and
typography checks overall. These are the fixes it needed:

- [x] **Reduced motion removed feedback too (§14).** The global `* { transition-duration: 0.01ms }`
  rule also stripped color and opacity feedback, so reveals snapped instead of cross-fading.
  It's replaced with targeted rules: movement (press scale, arrow nudge, card image zoom,
  menu slide, reveal rise) uses `motion-safe:`, and under reduced motion the reveals are a
  300 ms opacity cross-fade with no stagger. Loading spinners keep turning because they show
  status.
- [x] **Header now materializes instead of fading (§12).** The blur radius animates from 0 to 24 px
  along with the tint, so the bar arrives as a material and not as an opacity fade.
- [x] **The mobile menu came out of a clear bar (§7, §12).** At the top of the page the frosted
  menu hung under a transparent header. The header now turns into a material while the menu
  is open (`onOpenChange` → `data-scrolled`).
- [x] **Vibrancy (§12, §15):** desktop nav text on the glass goes from cream/80 to cream/90 at
  medium weight, and the negative tracking on that 14 px text is dropped (small text shouldn't
  be tightened). Mobile menu links go to cream/90 as well.
- [x] **Response (§1):** mobile menu links get a pressed background.
- [x] **Bug, not a design issue:** the minifier (Lightning CSS) dropped the unprefixed
  `backdrop-filter` because the `-webkit-` line came after it, so Firefox and Chromium got no
  blur. The source now lists the prefixed line first. Verified in `dist` CSS.

**WordPress content to fix (not code):** the Watermelon card reads "500L" (should be 500mL)
and its ingredient list is copied from Hibiscus. Capitalization is also inconsistent across
cards ("En Savoir plus", "Sans Colorant").
