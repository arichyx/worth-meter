## Why

For count-based assets, *consistency* is what drives break-even - a gym pass used twice a week pays off far faster than one used in bursts then abandoned. The detail page shows a paginated list of individual records and a cost-per-use trend line, but neither surfaces the *cadence* of usage in a glanceable way. A calendar heatmap (GitHub-contributions style) makes the rhythm of usage - and the gaps that kill break-even - immediately visible, which both diagnoses past behavior and motivates continued logging.

## What Changes

- Add a `UsageHeatmap` component that renders a calendar grid (last N weeks, default 26) of day cells colored by the number of count usages logged that day, using the count type token at increasing opacities.
- Render the heatmap on the count-based asset detail page, in the Usage Records tab, above the paginated records list. It uses the full usage-record set (not just the current page).
- Each day cell carries a native `title` tooltip (date + count) so hovering explains intensity without client-side interactivity.
- Empty days render as faint cells; days with uses render as count-tinted cells with intensity scaling by count (1, 2, 3+).
- Include a small legend (less → more) and weekday row hints.
- Add new translation keys for the heatmap title, the "no uses on this day" tooltip, and the legend labels.

## Capabilities

### New Capabilities

- `usage-heatmap`: A calendar heatmap on the count-based asset detail page that visualizes usage cadence over time, complementing the paginated records list and the cost-per-use trend.

### Modified Capabilities

<!-- None. The heatmap is added to the existing Usage Records tab without changing the paginated list's behavior specified in `usage-records`. It is a new visualization, not a modification to `data-visualization` (which covers chart-series concerns). -->

## Impact

- **Code**:
  - New `src/components/usage-heatmap.tsx` (server component; pure render from records).
  - `src/app/assets/[id]/page.tsx` - compose the count `records` tab content to include `<UsageHeatmap>` above `<UsageRecordsList>`.
  - `src/lib/i18n/locales/*` - new keys: `usageHeatmap`, `heatmapNoUses` (tooltip for empty day), `heatmapLegendLess`, `heatmapLegendMore`, `heatmapUses` (tooltip "{count} uses on {date}").
- **Data layer**: No schema changes, no migrations. Reads the existing `asset.usageRecords`.
- **Routing**: No route changes.
- **Tests**: Add `src/__tests__/components/usage-heatmap.test.tsx` covering day-bucketing, intensity scaling, and the empty-records case; run `pnpm lint`, `pnpm test`, `pnpm build`.
