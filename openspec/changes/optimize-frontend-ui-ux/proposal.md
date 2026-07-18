## Why

WorthMeter's frontend is functional and already has a consistent cool-violet theme, but there is still room to improve information hierarchy, interaction feedback, and page consistency. The dashboard overview and asset-card areas lack clear visual rhythm; the asset detail page stacks metric cards, charts, and records vertically, making scanning expensive; the new-asset form has many fields but no guided steps or real-time validation; and headers, loading states, empty states, and action feedback are not yet unified across pages. This optimization will improve overall readability, efficiency, and perceived quality without changing the data model, theme system, or routing.

## What Changes

- Refactor the dashboard layout: consolidate total investment, break-even count, and average progress into a clear overview card group; tighten asset-type group cards so type colors and break-even status are easier to scan.
- Upgrade the asset detail page information architecture: reorganize core spotlights, metric cards, chart, and usage records into logical sections (Tabs) to reduce first-screen cognitive load; unify the usage-records component for count and quota assets.
- Transform the new-asset flow into a step-by-step wizard with field hints, real-time validation, and a pre-submit summary, lowering the first-use barrier.
- Unify global navigation: extract a reusable page header component so back buttons, titles, actions, and global toggles are consistent across pages.
- Improve interaction states: provide icon/illustration empty states, loading placeholders, error pages, and immediate feedback (toast / inline success messages) for form submissions and record actions.
- Extend the design system: add motion tokens (duration / easing) and a complete shadow scale, ensuring all interactions remain consistent in both light and dark themes.
- Enhance chart experience: add empty-state and single-data-point handling, keep responsive minimum height, and preserve token-driven colors.

## Capabilities

### New Capabilities

- `dashboard-layout`: Layout, hierarchy, and visual rhythm of the dashboard overview and asset-type groups.
- `asset-detail-layout`: Layout and zoning of the asset detail page: core metrics, detailed metrics, chart, and usage records.
- `asset-creation-flow`: The new-asset page's type selection, step guidance, form validation, and submission feedback.
- `navigation-header`: A reusable top navigation header across pages, including back, title, global toggles, and primary actions.
- `feedback-states`: Empty, loading, error, and success/failure feedback surfaces.

### Modified Capabilities

- `design-system`: Extend shadow/elevation tokens and introduce motion tokens (`duration-*`, `ease-*`), requiring components to use tokens instead of hard-coded transitions.
- `data-visualization`: Add requirements for chart empty/single-data states and a clear responsive minimum height.
- `theming`: Add support for `prefers-reduced-motion`.

## Impact

- **Code**:
  - `src/app/page.tsx` — dashboard layout and overview area refactor.
  - `src/app/assets/[id]/page.tsx` and sub-components — detail page zoning and unified usage-records component.
  - `src/app/assets/new/page.tsx` — wizard-style creation flow with validation and feedback.
  - New shared `src/components/page-header.tsx`; refactor `DashboardHeader` and `DetailHeader` to reuse it.
  - `src/app/globals.css` — add motion and shadow tokens.
  - `src/components/ui/` — possibly extend or add skeleton, toast, stepper primitives.
  - `src/lib/i18n/locales/*` — new keys for layout, validation, and feedback.
- **Data layer**: No schema changes, no migrations, no server action behavior changes.
- **Routing**: No route changes; existing URLs and query params (e.g. `?page`) remain compatible.
- **Tests**: Add/update vitest and UI tests; run `pnpm lint`, `pnpm test`, and `pnpm build`.
