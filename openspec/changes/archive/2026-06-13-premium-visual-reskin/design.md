## Context

WorthMeter is a Next.js 16 / React 19 / Tailwind v4 / shadcn v4 (base-ui) app that tracks whether purchases have paid for themselves. It has three asset types (`time` / `count` / `quota`), a dashboard, an asset-detail page with a recharts chart, a "new asset" form, and dialogs. It is server-rendered and cookie-driven (locale + currency already read server-side in `layout.tsx`); it shipped a `.dark` token block but was light-only with no theme provider.

The visual system was shadcn's `baseColor: "neutral"` defaults — every token carried zero chroma, so token-routed color was flat gray; color was then bolted on ad-hoc and inconsistently (hardcoded Tailwind palettes, a standalone `hsl(221,83%,53%)` in the chart, default recharts grid).

This change is a **visual-only reskin**. Page logic, calculations, data flow, and server actions are untouched. The dashboard *layout* was intentionally refined (hero + three framed type sections) per the design direction.

> ⚠ **AGENTS.md constraint**: this is a *modified* Next.js with breaking changes vs. training-data Next.js. Read the relevant guide in `node_modules/next/dist/docs/` before touching `layout.tsx`, cookie handling, or `<html>` rendering. In this environment `next dev` fails (shells to a `taskr`/`cross-env` bootstrap that isn't installed); use `next build` + `next start`, and the app needs node v25.9.0 (`fnm use 25.9.0`) for `better-sqlite3` at runtime.

## Direction note (pivot)

The first pass explored a warm emerald + frosted-glass + ambient-mesh direction. Per feedback it was **pivoted to a cold, restrained, Raycast/Linear-style aesthetic**: violet/indigo monochrome, solid surfaces with layered depth, a single top spotlight, and focal glow on the hero figure and primary CTA. The cold palette and minimal composition are retained; the *premium feel* comes from shadow/gradient/glow depth, not from busy decoration.

## Goals / Non-Goals

**Goals:**
- A cold, minimal, premium ("高级 / 冷淡") visual language — violet/indigo monochrome, generous whitespace, restrained palette.
- Premium **depth**: soft layered shadows, subtle surface gradient + lit top edge, a single top spotlight, focal glow on the hero number and primary button.
- Solid, readable surfaces (not glassy) in both light and dark.
- Real, no-flash, cookie-persisted light/dark theming (the `.dark` tokens are finally reachable).
- Refined charts off the default recharts look.

**Non-Goals:**
- No changes to calculations, data models, queries, server actions, routing, i18n, or currency logic.
- No new runtime dependencies (no `next-themes`); no new charting library (keep recharts).
- No ambient color mesh, no glassmorphism on cards, no decorative gradients beyond the restrained spotlight/focal glow.

## Decisions

### Decision 1: Violet/indigo monochrome (hue 270)
The entire structural palette is hue 270 — primary, foreground, borders, shadows. Primary = deep violet in light (`oklch(0.45 0.14 270)`), brighter violet in dark (`oklch(0.7 0.14 270)`). Asset-type identity uses distinct hues: `time`=blue(250), `count`=green(150), `quota`=amber(45); `success`=green(150). Everything resolves through tokens — no hardcoded palette values in app code.

### Decision 2: Cool-toned in both modes (not warm)
LIGHT background = cool light-gray (`oklch(0.97 0.003 270)`), solid white cards. DARK background = cool near-black (`oklch(0.14 0.015 270)`), elevated solid dark cards. Both modes share the cool violet mood — there is no warm/cream mode.

### Decision 3: Solid surfaces with layered depth (not glass)
Cards/popovers/dialogs are **solid** (`bg-card` opaque) with depth from: a subtle vertical gradient (`from-card to-muted/30`), a lit top edge (`inset 0 1px 0 0 white/6%`), and a multi-layer soft shadow (`--elevation-card`). The **only** glass surface is the sticky header (`.glass-header`, blurred+saturated). No `backdrop-blur` on cards.

### Decision 4: Restrained top spotlight (depth, not mesh)
A single soft violet radial anchored at the top-center of the page (`.bg-spotlight::before`, `radial-gradient at 50% 0%`), opacity tuned per mode (light stronger, ~38%, since violet reads weaker on light gray; dark ~30%). This is a "light source," not a multi-color mesh.

### Decision 5: Focal glow
The hero total-invested number carries a soft violet aura (a blurred `bg-primary` layer behind it). The primary button carries an inset top highlight + a soft violet outer glow (`--elevation-glow`). Both add premium focal weight without busy decoration.

### Decision 6: Cookie-based theme, no-flash
Theme is stored in a cookie (`worth-meter-theme`), mirroring the locale/currency pattern. The server reads it in `layout.tsx` and emits `class="dark"` on `<html>` in the initial HTML (returning users get no flash). A tiny inline pre-paint script resolves `cookie ?? prefers-color-scheme ?? dark` for first-visit. Default follows `prefers-color-scheme`; hard fallback dark. A 3-way toggle (light/system/dark) lives in the header. No `next-themes` dependency.

### Decision 7: Chart refinement on recharts (no glow)
Remove the dashed grid; render gradient area fills under lines; drive all series colors from the type/brand tokens via a `useChartTheme()` hook (MutationObserver re-reads on theme change); custom solid tooltip with theme tokens. **No** dark-mode line/bar glow — the cold look is glow-free on data.

### Decision 8: Dashboard layout — editorial hero + three framed sections
Hero: total-invested (large, focal glow) on the left, average break-even progress (label + % + bar) on the right, and a quiet `N assets · M break-even` line — each figure shown **once** (the earlier draft duplicated the stats; this removes that redundancy). The three asset-type sections are **large framed Cards** (header strip with icon shell + label + count + a type-tinted background and bottom divider; content holds the asset cards). Asset cards have **no left edge line**; type identity is carried by the colored primary figure and the section frame.

## Risks / Trade-offs

- **`backdrop-blur` scoped to the header only** → avoids large-area blur performance cost.
- **Spotlight opacity must be tuned per mode** → light needs higher opacity than dark to read; finalized via live feedback (light ~38%, dark ~30%).
- **Cold palette is deliberately less "warm"** → intentional for the 冷淡 direction; if a warmer variant is ever wanted, swap the `:root` hue from 270 toward a warmer axis.
- **Token churn touched many files** → phased rollout (tokens → theme → base components → charts → pages → depth pass); each phase verified by build + render.
- **Modified Next.js surprises** → `next dev` is unavailable here; verified via `next build` + `next start` under node v25.9.0.

## Migration Plan

Phased, each shippable:
1. **Tokens** — restructure `globals.css` (violet palette, solid surfaces, layered elevation tokens, spotlight utility).
2. **Theme wiring** — cookie + inline resolver + `<html>` class + provider + toggle.
3. **Base components** — solid surfaces + depth (Card gradient/inset/shadow, Button glow, Badge success, Progress).
4. **Charts** — gradient fills, token palette, no grid, solid tooltip.
5. **Pages** — dashboard hero + three framed sections + asset cards without left lines; spotlight + focal glow applied.
6. **Depth pass** — spotlight, focal glow, button glow, refined shadows.

**Rollback:** surface-only (CSS + components + theme wiring); no data/schema/logic changes. `git revert` restores prior appearance with no migration.

## Open Questions

- Exact oklch values for the violet ramp, type hues, and shadow layers — continue to be tuned by eye per feedback (the spotlight/glow opacities already went through one round).
- Whether to introduce a fine grain/noise overlay for extra material feel — deferred (current depth reads as premium without it).
