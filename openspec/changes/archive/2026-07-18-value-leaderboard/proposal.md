## Why

The dashboard groups assets by type and shows each equally, so the most useful question - "which of my purchases was the best value, and which was the worst?" - is buried. Users have to mentally compare progress bars across three columns of heterogeneous items. A ranked view surfaces the champions (purchases that paid off) and the regrets (expensive items far from break-even) directly, which is the single most insightful thing the accumulated dataset can show and a strong reason to keep logging usage.

## What Changes

- Add a new `/leaderboard` route that ranks all non-archived assets by value recovered (break-even progress, normalized 0-1) descending.
- Derive a comparable `valueScore` per asset from the existing calculators' `breakEvenProgress` (time: days/targetDays, count: uses/targetUses, quota: usageRatio), so heterogeneous types are rankable on one axis.
- Surface two extremes: a "champion" (highest progress) and a "biggest regret" (highest unrecovered value = `(1 - progress) * totalCost` among non-broke-even assets).
- Render a ranked list: rank badge, name, type badge, primary metric (cost-per-use / daily cost / usage ratio), progress bar, and total cost; assets without a target (null progress) sort to the bottom under a "not yet measurable" note.
- Add a type filter via a `?type=` query parameter (`all` / `time` / `count` / `quota`), bookmarkable and shareable, mirroring the existing `?page` URL convention.
- Add a dashboard entry point (link in the dashboard header) to reach the leaderboard.

## Capabilities

### New Capabilities

- `value-leaderboard`: A ranked, filterable view of all assets by value recovered, surfacing the best and worst purchases and a per-type filter, with a dashboard entry point.

### Modified Capabilities

<!-- None. The entry point is specified within `value-leaderboard` rather than modifying `navigation-header`, because `navigation-header` is not yet a synced main spec (introduced by the in-progress `optimize-frontend-ui-ux` change). -->

## Impact

- **Code**:
  - New route `src/app/leaderboard/page.tsx` (server component, reads `?type=`, computes rankings).
  - New pure module `src/lib/calculations/leaderboard.ts` with `rankAssetsByValue` and `pickExtremes`, re-exported from `src/lib/calculations/index.ts`.
  - New `src/__tests__/calculations/leaderboard.test.ts`.
  - `src/components/dashboard-header.tsx` - add a "Leaderboard" link.
  - `src/lib/i18n/locales/*` - new translation keys for the leaderboard title, filter labels, champion/regret headings, and the "not yet measurable" note.
- **Data layer**: No schema changes, no migrations. Reads only via existing `getAllAssetsWithRecords`.
- **Routing**: Adds `/leaderboard`. No existing routes change.
- **Tests**: Add leaderboard unit tests; run `pnpm lint`, `pnpm test`, `pnpm build`.
