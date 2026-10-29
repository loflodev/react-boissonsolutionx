# Fallow audit — findings & fix plan

Run: 2026-10-29 · fallow 3.34.1 · no fallow config (defaults)
Health score: **64.6 / C** before → **78.0 / B** after (0 dead-code issues, 0 critical functions)

**Status: all items done (2026-10-29).** P0 verified live on WordPress after uploading the new
contact code; one commit per item on `main`.

Scope note: fallow only analyzes JS/TS. Item P0-1 was found while verifying the
contact-form findings (it lives in `functions.php`), not by fallow itself.

## Priority × workload overview

| ID   | Priority | Workload | Item | Commit |
|------|----------|----------|------|--------|
| P0-1 | Critical | M (1–2h) | Contact messages are published as public WordPress posts | 65c0385 |
| P1-1 | High     | XS (5m)  | Remove unused deps `lucide`, `@tanstack/react-query-devtools` | ecadb7c |
| P1-2 | High     | XS (5m)  | Move build-only deps to devDependencies | e90b1a9 |
| P1-3 | High     | S (30m)  | Hero `dangerouslySetInnerHTML` (XSS candidate + renders "undefined") | d1e19c2 |
| P2-1 | Medium   | S (30m)  | Duplicated axios error handling in `homePageService.ts` | 3f257bf |
| P2-2 | Medium   | S (30m)  | `submitContactForm`: wrong error type + retried mutation | a46b17d |
| P3-1 | Low      | M (2–3h) | Add Vitest + tests for service/validation (lowers CRAP scores) | dd81e48 |
| P3-2 | Low      | M (1–2h) | Split large components (`Button`, `ContactForm`, `useContactFormQuery`) | 49fb466, 572e8d4 |
| P3-3 | Low      | XS (10m) | Add `.fallowrc.json` + keep the score as a baseline | 9607e9f |

Suggested order: P0-1 → P1-1/P1-2 (one commit) → P1-3 → P2-1+P2-2 (same file, one commit) → P3-3 → P3-1 → P3-2.

---

## P0 — Critical

### P0-1 Contact messages are published publicly (privacy leak + spam vector)
- **Where:** `functions.php:96-104` (mutation `createContactMessage`), `src/services/homePageService.ts:106-109`
- **What:** each submission becomes a normal `post` with `post_status` taken from the client
  (`"publish"`). Visitors' names, emails and messages show up on the public WP site, RSS and the
  public GraphQL/REST APIs. The mutation is unauthenticated, so anyone can create published posts.
- **Fix:**
  - [x] Server: always force `post_status = 'private'` (or `draft`); ignore the client `status` input.
  - [x] Server: store in a dedicated non-public CPT (`contact_message`, `public => false`, `show_in_graphql => false` for reads).
  - [x] Server: add basic anti-spam (honeypot field and/or rate limit per IP; consider a captcha).
  - [x] Client: remove `status: "publish"` from the mutation input.
  - [x] Clean up: switch already-published contact posts to private (`_contact_form_submission` meta flags them).
- **Verify:** submit the form, confirm the post is not visible logged-out (site, `/feed`, `/wp-json/wp/v2/posts`) and the email still sends.

## P1 — High (quick wins, biggest score gain)

### P1-1 Unused dependencies (−25 health points)
- **Where:** `package.json:15`, `package.json:17`
- `lucide` is unused (the code imports `lucide-react`); `@tanstack/react-query-devtools` is never imported.
- [x] `npm uninstall lucide @tanstack/react-query-devtools`
- **Verify:** `npm run build` passes; re-run fallow `analyze` → 0 unused deps.

### P1-2 Build-only packages in `dependencies`
- **Where:** `package.json:13` and `:22`. `@tailwindcss/vite` and `tailwindcss` are only used by `vite.config.ts` and the CSS build.
  (Fallow labels this "test-only"; it is really build-only.)
- [x] Move both to `devDependencies`.
- **Verify:** `npm ci && npm run build`.

### P1-3 Hero `dangerouslySetInnerHTML`
- **Where:** `src/components/layouts/Hero.tsx:59-63`
- **What:** the WP `description` is injected as raw HTML. Risk is low (only WP admins write it), but a
  compromised or shared editor account becomes stored XSS. Also, `` `${heroData?.description}` `` prints the
  literal string `"undefined"` while data is missing.
- [x] Sanitize with DOMPurify (`DOMPurify.sanitize(heroData.description)`), or render it as plain text if HTML isn't needed.
- [x] Render the block only when `heroData?.description` exists.
- **Verify:** hero still renders formatting; no "undefined" flashes while loading.

## P2 — Medium

### P2-1 Duplicate error handling (36 lines × 2)
- **Where:** `src/services/homePageService.ts:52-85` and `:123-157` (clone `dup:2eef1b64`)
- [x] Extract `toServiceError(error: unknown): Error` (axios → `NetworkError`, rethrow known errors, wrap unknown).
- Also lowers cognitive complexity of `getHomePageData` (18) and `submitContactForm` (18) below 15.

### P2-2 `submitContactForm` error semantics
- **Where:** `src/services/homePageService.ts:114-119`, retry config in `src/hooks/useContactFormQuery.ts:60-65`
- **What:** GraphQL errors are thrown as `NetworkError` with the typo "No data return form API endpoint".
  The mutation retries up to 3× on anything that isn't a `ValidationError`, so one failed submit can create up to 4 posts or emails.
- [x] Throw `GraphQLServiceError` with the real error messages (same as `getHomePageData`).
- [x] Mutations: `retry: false` (or retry only on network errors with no response).

## P3 — Low (maintainability)

### P3-1 No test setup (all CRAP scores use estimated 0% coverage)
- Top CRAP: `submitContactForm` 240, `getHomePageData` 182, `Button` 56, `ContactForm` 56, `validateForm` 42.
- [x] Add Vitest (+ Testing Library for components).
- [x] Unit-test `homePageService` (mock axios: success, GraphQL errors, network error, no response).
- [x] Extract `validateForm` into a pure function (`validateContactForm(data): FormErrors`) and test it.
- **Verify:** `check_health` with `coverage` path → CRAP under 30.

### P3-2 Large functions (> 60 lines)
- `useContactFormQuery` 126 lines, `Button` 108 (cognitive 17), `ContactForm` 81, `Hero` 78.
- [x] `Button`: move variant/size class maps into constants; simplify the state/effect logic.
- [x] `useContactFormQuery`: validation split out (P3-1); still ~100 lines but no longer flagged for complexity.
- Do this last; it's style work with no user-facing impact.

### P3-3 Fallow config + baseline
- [x] Add `.fallowrc.json` (turn off `boundary-violation` / `policy-violation` noise for this small app).
- [x] After P1, save a health snapshot so later runs show the trend.

---

## Not issues (checked)
- 0 unused files/exports, 0 circular deps, 0 unresolved imports.
- `security_candidates` reported 16 "unresolved callee" sites, mostly in `src/type.ts` error classes. These are analysis blind spots, not findings.
