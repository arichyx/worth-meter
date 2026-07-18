## Context

WorthMeter is a personal break-even tracking app built with Next.js 16, React 19, Tailwind CSS v4, and shadcn/ui. The project already has a cool-violet theme, a token-driven design system, SSR theme switching without flash, and paginated count-based usage records. Current pages:

- Dashboard (`src/app/page.tsx`): shows total investment, average break-even progress, and asset cards grouped by type.
- Asset detail (`src/app/assets/[id]/page.tsx`): shows core spotlight, metric grid, trend chart, and usage records for a single asset.
- New asset (`src/app/assets/new/page.tsx`): two-step form (select type, then fill fields).

Current pain points:
1. The dashboard overview mixes a radial glow with text, making scanning indirect.
2. The asset detail page vertically stacks 4 metric cards, a chart, and records with no zoning.
3. The new-asset form lacks step indicators and validation feedback, feeling cramped on mobile.
4. `DashboardHeader` and `DetailHeader` are implemented separately, so back buttons, actions, and toggles are not aligned.
5. Empty, loading, error, and action-feedback states are not unified; some are plain text only.

This design solves those issues through shared components, token extensions, and layout refactoring without touching the data layer, routing, or core calculations.

## Goals / Non-Goals

**Goals:**
- Establish a unified `PageHeader` component for consistent back, title, global controls, and primary actions.
- Refactor the dashboard layout so total investment, break-even stats, and asset groups have clear visual hierarchy.
- Refactor the asset detail page into sections (tabs) for overview, chart, and records, reducing first-screen cognitive load.
- Transform the new-asset flow into a guided wizard with real-time validation and submission feedback.
- Unify empty, loading, error, and success feedback surfaces.
- Extend design tokens (shadow scale, motion duration/easing) and support `prefers-reduced-motion`.
- Keep all changes token-driven, WCAG AA contrast-compliant, and consistent in both light and dark themes.

**Non-Goals:**
- No schema changes, no new server actions, no business-logic changes.
- No charting-library replacement or heavy new dependencies.
- No mobile-native redesign beyond responsive breakpoints.
- No changes to existing routing or URL conventions.

## Decisions

### Decision 1 — Extract a shared `PageHeader` component
Abstract the common parts of `DashboardHeader` and `DetailHeader` into `src/components/page-header.tsx`, supporting left back/icon area, center title/subtitle area, and right action area. `DashboardHeader` and `DetailHeader` will be thin wrappers around it, preserving existing import interfaces and reducing duplicated layout code.
- *Alternative considered:* Keep headers independent per page. Rejected — high duplication and inconsistent placement.
- *Consequence:* `PageHeader` props must be generic enough for both pages without introducing hydration issues (keep `'use client'` or split server/client concerns where appropriate).

### Decision 2 — Dashboard uses "overview cards + group cards" two-level layout
The top of the dashboard will use three equal-width `OverviewCard` components for total investment, break-even count, and average progress, replacing the current hero + progress mix. Below, the existing asset-type group cards remain but with tighter padding and unified header height.
- *Alternative considered:* More complex dashboard grid / sidebar / stats widget. Rejected — overkill for the current app size.
- *Consequence:* `OverviewCard` must be reusable for the detail-page metric spotlights.

### Decision 3 — Asset detail page uses tabs for zoning
Detail content is organized into three tabs: **Overview**, **Trend**, and **Usage Records**. Overview is active by default and contains the spotlight card and 4 metric cards; Trend contains only `AssetChart`; Usage Records contains the unified paginated list.
- *Alternative considered:* Flat layout with anchor navigation. Rejected — too long, especially on mobile.
- *Alternative considered:* Accordion panels. Rejected — tabs better match the "overview / visualization / detail" mental model.
- *Consequence:* Use the existing `src/components/ui/tabs.tsx` to avoid new dependencies. Tab state is client-only; the URL does not carry it to keep SSR simple.

### Decision 4 — New-asset flow becomes a three-step wizard
Steps: 1) select asset type (reuse existing cards); 2) fill basic info (name, total cost, purchase date); 3) fill type-specific fields and submit. Each step shows a progress indicator and back/next buttons; the final step shows an information summary.
- *Alternative considered:* Single long form with anchors. Rejected — weak step sense and long scrolling on mobile.
- *Consequence:* Form state moves from many individual `useState` calls to one form-state object with a `step` field. Submission still writes fields into `FormData` and calls the existing `createAssetAction`.

### Decision 5 — Feedback uses shadcn/ui-style toast + inline states
Global action feedback (create/edit/archive/delete success) is shown via a toast; form field errors use inline text below `Input`; empty states use a unified `EmptyState` component (icon + title + optional action).
- *Alternative considered:* Add a third-party `react-hot-toast` / `sonner` package. Rejected — the project already uses shadcn/ui; prefer extending its toast pattern or implementing a lightweight `ToastProvider` to avoid new dependencies.
- *Consequence:* Need to check whether `src/components/ui/` already has `sonner.tsx` or `toast.tsx`; if not, implement a lightweight provider.

### Decision 6 — Motion and shadow tokens live in `globals.css`
Add `--duration-fast`, `--duration-normal`, `--duration-slow`, `--ease-default`, `--ease-emphasized`, and `--shadow-sm/md/lg/xl/glow` tokens, exposed as Tailwind v4 theme variables in `@theme inline`. All component transitions must use these tokens, avoiding hard-coded `transition-shadow duration-200`.
- *Alternative considered:* Write transitions inline only where needed. Rejected — inconsistent and hard to support `prefers-reduced-motion`.
- *Consequence:* The design spec will require all new/changed components to use tokens; existing hard-coded transitions are out of scope unless touched.

### Decision 7 — Chart empty/single-data state is handled inside `AssetChart`
When `chartData.length === 0`, render an empty-state placeholder; when only one point exists, show an explanatory message instead of hiding the chart. The chart container keeps a minimum height of 288px (`h-72`) so it does not collapse responsively.
- *Alternative considered:* Parent page conditionally renders. Rejected — keeping chart-related logic inside `AssetChart` is more cohesive.
- *Consequence:* `AssetChart` needs to receive or read i18n hint copy for empty/single-data states.

## Risks / Trade-offs

- **[Tabs make some detail content client-state only]** → Refreshing the page always returns to the Overview tab. Acceptable — core info (spotlights + metrics) is still first-screen; chart and records are secondary.
- **[Wizard adds clicks for power users]** → Mitigation: keep Back/Next and direct submit; step 2 pre-fills today's date so no extra typing burden.
- **[Shared `PageHeader` may not match existing header styles exactly]** → Need to align padding, height, and shadow of `DashboardHeader` and `DetailHeader`.
- **[Shadow/motion tokens with Tailwind v4]** → Tailwind v4 exposes CSS variables via `@theme inline`; tokens must be mapped correctly. Mitigation: verify incrementally.
- **[No real toast library added]** → If shadcn/ui toast is missing, implement a lightweight provider. Mitigation: check `src/components/ui/` first.

## Migration Plan

- No data migration or schema changes.
- Deploy: standard `next build` + `next start`.
- Rollback: revert affected files; URLs remain unchanged so bookmarks keep working.
- Visible changes for existing users: dashboard and detail layouts evolve; new-asset becomes a wizard. This is a normal product iteration with no breaking API changes.

## Open Questions

- Should the dashboard add a "recently updated" or "near break-even" quick-entry section? Deferred to a future enhancement.
- Should the active detail tab be persisted in the URL (e.g. `?tab=records`)? Not for this change — keeps SSR simpler.
- Should quota-based usage records also be paginated via the unified component? Plan to unify, but confirm whether quota record counts justify pagination.
