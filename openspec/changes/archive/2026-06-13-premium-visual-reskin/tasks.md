## 1. Foundation — research & token system

- [x] 1.1 Read the relevant guides in `node_modules/next/dist/docs/` (layout, cookies, document/`<html>` rendering, fonts) per the AGENTS.md constraint; note anything that affects how `<html class>` is applied or cookies are read server-side, and heed deprecations.
- [x] 1.2 Restructure `src/app/globals.css` into three scopes: extract a **cross-mode shared** scope holding the "bloodline" — asset-type identity hues (`--type-time` amber, `--type-count` sky, `--type-quota` violet), `--brand` emerald, semantic colors (`--success`=brand, `--warning`=amber, `--destructive`), `--chart-1..5` (brand + type hues + one neutral), and the radius/spacing/type scale.
- [x] 1.3 Define the **LIGHT** scope (`:root`): warm off-white background (non-pure-white), frosted card token (semi-transparent), warm hairline borders, a layered shadow scale (`--shadow-sm/md/lg/glow` = warm soft drops), and low-opacity mesh-blob tokens.
- [x] 1.4 Define the **DARK** scope (`.dark`): cool violet-tinted near-black background (non-pure-black), glass card token, `white/<x%>` hairline borders, and a deep + brand-glow shadow scale.
- [x] 1.5 Verify the token cascade: bloodline values are identical across modes; light/dark backgrounds, shadows, and surfaces differ as intended; tokens resolve in both modes.

## 2. Theme switching — cookie-based, no-flash

- [x] 2.1 Add a theme cookie utility + constants, mirroring the existing locale/currency cookie pattern (`src/lib/...`).
- [x] 2.2 In `src/app/layout.tsx`, read the theme cookie server-side and emit `class="dark"` on `<html>` in the initial HTML when dark is active.
- [x] 2.3 Add a tiny inline blocking resolve script in `<head>`: `cookie ?? matchMedia('(prefers-color-scheme: dark)') ?? dark-fallback` → set `<html>` class + write cookie, before first paint (first-visit no-flash).
- [x] 2.4 Add theme context/state in `src/app/providers.tsx` plus a set-cookie action, so the toggle updates instantly and persists.
- [x] 2.5 Build the theme-toggle control and place it in the persistent header (alongside the currency/language toggles).
- [x] 2.6 Verify: returning user (cookie) sees no flash; first-visit follows `prefers-color-scheme`; no-preference falls back to dark; toggle switches immediately and persists across reload.

## 3. Base components — glass, shadows, brand glow

- [x] 3.1 `Card`: apply the glass surface treatment (semi-transparent bg + `backdrop-blur` + hairline border + subtle top-edge inner highlight); keep the existing `size` API and slots unchanged.
- [x] 3.2 `Button`: make `--primary` emerald in both modes; add emerald glow on the primary variant in dark mode; harmonize other variants with the new tokens. No variant/size API changes.
- [x] 3.3 `Badge`: token-driven variants; ensure the break-even badge resolves to emerald semantic tokens.
- [x] 3.4 `Progress`: emerald indicator from tokens; subtle glow on the indicator in dark mode.
- [x] 3.5 `Input`, `Label`, `Separator`: adopt token borders/backgrounds; no API changes.
- [x] 3.6 `Dialog`, `Popover`, `Sheet`, `DropdownMenu`, `Select`, `Tooltip`: apply the glass surface treatment where these surfaces appear.
- [x] 3.7 Verify every base component renders correctly in both light and dark modes.

## 4. Chart refinement (recharts, no library swap)

- [x] 4.1 Add a small chart-palette helper that resolves the design tokens (brand + type hues) into the color values recharts consumes.
- [x] 4.2 Remove the `CartesianGrid strokeDasharray="3 3"` default; render ultra-faint baselines or omit the grid entirely.
- [x] 4.3 Add a `<defs><linearGradient>` area fill beneath line series, fading the series color → transparent.
- [x] 4.4 Drive all series stroke/fill colors from the token palette; delete the hardcoded `hsl(221, 83%, 53%)`.
- [x] 4.5 Add dark-mode line/bar glow via a CSS `drop-shadow` filter; keep a clean solid stroke in light mode.
- [x] 4.6 Build a custom glass tooltip content component using theme tokens (replacing the default white tooltip).
- [x] 4.7 Verify charts render correctly in both modes across `time`, `count`, and `quota` asset types.

## 5. Centralize color across pages & components

- [x] 5.1 `src/app/page.tsx` `TYPE_STYLES`: replace `from-amber/sky/violet-*` chip utilities with type-token-driven classes; keep the three-type visual identity.
- [x] 5.2 `src/app/page.tsx` hero stat chips: make them token-driven; use emerald for the break-even stat (brand semantics).
- [x] 5.3 `src/components/dashboard-header.tsx`: replace `text-amber-500` with the brand/type token; refresh the `Landmark` mark treatment.
- [x] 5.4 `src/app/assets/[id]/page.tsx` (detail): replace any hardcoded colors; refresh `MetricCard` surfaces with tokens. Layout unchanged.
- [x] 5.5 `src/app/assets/new/page.tsx`: token-driven type picker and form surfaces. Layout/form behavior unchanged.
- [x] 5.6 Asset dialogs (`usage`, `edit`, `archive`, `delete`) and `detail-header`: make all color token-driven.
- [x] 5.7 Grep audit: confirm no `hsl(`, `rgb(`, hex color, or `from-/to-/bg-/text-<tailwindcolor>` literals remain in component/page code (token file excepted).

## 6. Cross-mode verification & polish

- [x] 6.1 Walk every surface in LIGHT mode: confirm warm tone, glass cards, soft shadows, and that the mesh is restrained (≤15% opacity, large blur, ≤2 hues, behind cards).
- [x] 6.2 Walk every surface in DARK mode: confirm cool near-black tone, glass cards, glow, and readable contrast.
- [x] 6.3 Verify WCAG AA contrast (≥4.5:1) for body text on background and for primary-foreground on emerald, in both modes.
- [x] 6.4 If any motion was added, confirm it respects `prefers-reduced-motion`.
- [x] 6.5 Final review against the design constitution; confirm **no drift** in layout, information architecture, calculation logic, data flow, or interaction behavior.
