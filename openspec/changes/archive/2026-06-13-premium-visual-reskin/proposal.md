## Why

The UI shipped shadcn's `baseColor: "neutral"` defaults, so every theme token carried **zero chroma** — anything routed through tokens rendered flat gray. Color was then bolted on ad-hoc and inconsistently (hardcoded Tailwind palettes, a standalone `hsl(221,83%,53%)` in the chart, default recharts grid). It read as plain and unfinished — the opposite of the cold, premium ("高级 / 冷淡") feel a personal-finance tool should project. Separately, `.dark` tokens existed but were **dead code** (no provider, no cookie, no toggle), so the app was light-only.

## What Changes

A **visual-only reskin** to a cold, restrained, Raycast/Linear-style aesthetic. Page logic, calculations, data flow, and server actions are untouched; the dashboard *layout* is intentionally refined (editorial hero + three framed type sections).

- **Violet/indigo monochrome palette (hue 270)** as the structural color in [globals.css](src/app/globals.css). Primary = deep violet (light) / brighter violet (dark). Asset-type identity: `time`=blue, `count`=green, `quota`=amber; `success`=green. All color resolves through tokens — no hardcoded palette values in app code.
- **Cool-toned in both modes**: light = cool light-gray canvas with solid white cards; dark = cool near-black with elevated solid cards. No warm/cream mode.
- **Solid surfaces with layered depth**: cards have a subtle vertical gradient + a lit top edge (inset highlight) + a multi-layer soft shadow. The sticky header is the only glass (blurred) surface. No glassmorphism on cards, no ambient mesh.
- **Restrained top spotlight + focal glow**: a single soft violet radial at the top-center of the page (depth without a mesh), and a violet aura behind the hero total figure and the primary CTA.
- **Refine the charts**: remove the dashed grid, add gradient area fills, drive series colors from tokens, ship a themed solid tooltip. No dark-mode data glow (cold look).
- **Refine the dashboard layout**: an editorial hero (total-invested with focal glow + average break-even progress + a quiet counts line — each figure shown once), and the three asset-type sections as large framed Cards; asset cards drop the left edge line.
- **Wire up theme switching for real**: default follows `prefers-color-scheme`, persists in a cookie, renders the correct theme server-side (no flash), 3-way toggle in the header. Follows the existing server-component-reads-cookie architecture — no new dependency.

## Capabilities

### New Capabilities
- `design-system`: The token system as the single source of truth — violet/indigo monochrome, cool-toned light and dark backgrounds, solid surfaces with layered depth (gradient + inset highlight + soft shadows), and a restrained top spotlight. Governs that all color/elevation resolves through tokens and that both modes meet contrast requirements.
- `theming`: Light/dark theme selection behavior — default follows `prefers-color-scheme`, selection persists across sessions, renders correct theme on first paint (no flash), user-toggleable. Both modes fully supported.
- `data-visualization`: Chart rendering language — no harsh grid, gradient area fills, type-hue palettes (no hardcoded stroke colors), themed solid tooltip.

### Modified Capabilities
<!-- None — openspec/specs/ is empty; this change introduces the first capabilities. -->

## Impact

- **Styles**: `src/app/globals.css` — palette + layered elevation tokens + spotlight utility.
- **Theme wiring**: `src/app/layout.tsx` (theme cookie → `<html class>`), `src/app/providers.tsx`, `src/lib/theme.ts`, `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`.
- **Base components**: `src/components/ui/{card,button,badge,progress,dialog,popover,select,...}.tsx` — solid surfaces + depth; no API changes.
- **Charts**: `src/app/assets/[id]/asset-chart.tsx` + `src/components/charts/chart-theme.tsx`.
- **Pages/components**: dashboard, headers, detail page, new-asset page, asset dialogs — token-driven color + spotlight/focal glow.
- **Dependencies**: none added (cookie-based theming reuses the existing SSR/cookie architecture).
- **Out of scope (must not change)**: calculation logic, data models, queries, server actions, routing, i18n/currency logic.
