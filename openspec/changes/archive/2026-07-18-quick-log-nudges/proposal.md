## Why

Cost-per-use tracking dies when users stop logging usage - once the count is stale, every metric is wrong and the app stops being useful. Today the only way to log a use is opening the asset detail page and clicking through a dialog, which is enough friction that users skip it. This change adds a one-tap "+1" quick-log affordance directly on count-based asset cards, and surfaces stale-logging nudges on the dashboard so users are reminded to log before the data goes stale.

## What Changes

- Add a `QuickLogButton` client component that records one count usage via the existing `addUsageRecordAction(assetId, 1)` and refreshes, with no modal and no navigation.
- Render the `QuickLogButton` on active (non-archived) count-based asset cards on the dashboard, positioned as a sibling (not nested) to the card's navigation link so the markup stays valid and the +1 click does not navigate.
- Add a `deriveNudges` pure helper that, for each active count asset, computes days since last usage record and flags assets whose logging is stale beyond a threshold (`NUDGE_STALE_DAYS = 7`) and that have not yet broken even.
- Render a dashboard nudge section listing stale count assets with their own inline `QuickLogButton`, so a nudge is directly actionable: tapping +1 logs the use and the nudge clears on refresh.
- Add new translation keys for the +1 label, the nudge sentence, and the nudge section heading.

## Capabilities

### New Capabilities

- `quick-log-nudges`: A one-tap quick-log affordance on count asset cards and a dashboard nudge section that surfaces stale-logging count assets with an inline +1 action, reducing the friction that makes cost-per-use data go stale.

### Modified Capabilities

<!-- None. The dashboard nudge section is specified within `quick-log-nudges`; `dashboard-layout` is not yet a synced main spec (introduced by the in-progress `optimize-frontend-ui-ux` change). The +1 button reuses the existing `addUsageRecordAction` server action with no behavior change to usage records. -->

## Impact

- **Code**:
  - New `src/components/quick-log-button.tsx` (`'use client'`) calling `addUsageRecordAction` from `@/app/assets/[id]/actions`.
  - New pure helper `src/lib/calculations/nudges.ts` with `deriveNudges(assets, nowIso)`, re-exported from `src/lib/calculations/index.ts`.
  - New `src/__tests__/calculations/nudges.test.ts`.
  - `src/app/page.tsx` - restructure `AssetCard` to position the +1 button as a sibling to the `<Link>`; add the nudge section.
  - `src/lib/i18n/locales/*` - new keys: `quickLog` (+1 label / a11y), `nudgesHeading`, `nudgeStale` sentence with `{name}`/`{days}` placeholders.
- **Data layer**: No schema changes, no migrations. Writes only via the existing `addUsageRecordAction` (value `1`).
- **Routing**: No route changes.
- **Tests**: Add nudge unit tests; run `pnpm lint`, `pnpm test`, `pnpm build`.
