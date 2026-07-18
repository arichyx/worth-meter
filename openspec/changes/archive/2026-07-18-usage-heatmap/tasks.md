# Tasks: usage-heatmap

## 1. Pure helper

- [x] 1.1 Create `src/lib/calculations/heatmap.ts` exporting `HEATMAP_WEEKS = 26`, types `HeatmapCell`, and `buildHeatmap(records, weeks, nowIso)` returning day cells (date key, count, inRange) for the trailing `weeks` ending `nowIso`.
- [x] 1.2 Bucket records by `format(new Date(recordedAt), 'yyyy-MM-dd')` and count per date; assign each cell in the trailing window its count (0 if none).
- [x] 1.3 Export an `intensityFor(count)` helper returning 0/1/2/3 for 0/1/2/3+ uses.
- [x] 1.4 Re-export from `src/lib/calculations/index.ts`.
- [x] 1.5 Add `src/__tests__/calculations/heatmap.test.ts` covering: bucketing by date, count aggregation, intensity thresholds, trailing-window bounds (today included, old dates excluded), empty input.

## 2. i18n

- [x] 2.1 Add heatmap keys to `en.ts`: `usageHeatmap`, `heatmapNoUses` (with `{date}`), `heatmapUses` (with `{count}`/`{date}`), `heatmapLegendLess`, `heatmapLegendMore`. Mirror in `zh.ts`, `zh-TW.ts`, `ja.ts`.

## 3. Component & wiring

- [x] 3.1 Create `src/components/usage-heatmap.tsx` (server component): accept `records` and `locale`; call `buildHeatmap`; render a weekday-hint row, the 26×7 grid with `title` tooltips, and a legend.
- [x] 3.2 Map intensity to count-type-token opacity classes (`bg-muted/30`, `bg-type-count/30`, `bg-type-count/60`, `bg-type-count`); wrap the grid in a horizontal-scroll container for narrow screens.
- [x] 3.3 In `src/app/assets/[id]/page.tsx`, compose the count `records` content to render `<UsageHeatmap records={asset.usageRecords} locale={locale} />` above `<UsageRecordsList>`; leave quota unchanged.

## 4. Validation

- [x] 4.1 Run `pnpm lint` and fix issues.
- [x] 4.2 Run `pnpm test` and ensure heatmap tests pass.
- [x] 4.3 Run `pnpm build` and confirm no regressions; smoke-test a count asset detail page renders the heatmap.
