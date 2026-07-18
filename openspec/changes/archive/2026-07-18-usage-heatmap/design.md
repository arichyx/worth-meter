## Context

The count-based asset detail page shows a paginated usage-record list and a cost-per-use trend chart. Neither conveys the *cadence* of usage - whether the user logs consistently or in bursts with long gaps. A calendar heatmap (GitHub-contributions style) makes cadence and gaps immediately visible. The app already stores `recordedAt` per usage record and uses `date-fns` `format` for date display.

## Goals / Non-Goals

**Goals:**
- Render a trailing-weeks calendar heatmap on count asset detail, colored by per-day usage count using the count type token.
- Pure server-rendered (no client JS); hover via native `title`.
- Bucket records by calendar date; scale intensity by count.
- Localized title, tooltips, legend.

**Non-Goals:**
- No schema changes, no new server actions.
- No heatmap for time/quota (time auto-accumulates by day; quota has a billing-cycle, not daily, cadence).
- No interactive date-range picker; fixed trailing-26-weeks window.
- No click-through from a cell (a future change could link a day to filtered records).

## Decisions

### Decision 1 - Server component, native `title` tooltips
The heatmap is a pure function of the usage records, so it renders as a server component with no `'use client'`. Hover tooltips use the native `title` attribute, avoiding client JS and hydration cost.
- *Alternative:* A client component with a popover tooltip. Rejected - unnecessary complexity and bundle for a read-only visualization.
- *Consequence:* Tooltips are plain text (date + count), which is sufficient.

### Decision 2 - Trailing 26 weeks ending today
26 weeks (~6 months) fits the detail-page width and covers enough history to show cadence without overwhelming. The grid is 26 columns (weeks) × 7 rows (days), ending at the current date.
- *Alternative:* A full 52-week year. Rejected - too wide for the detail layout; 26 weeks is the readable middle ground.
- *Consequence:* Older usage (beyond 26 weeks) is not shown in the heatmap; it remains in the paginated records list and the trend chart.

### Decision 3 - Date bucketing by `yyyy-MM-dd` of `recordedAt`
Each record's `recordedAt` is parsed and formatted to `yyyy-MM-dd` (matching `UsageRecordsList`), then counted per date. The heatmap's day cells are also keyed by `yyyy-MM-dd` for lookup.
- *Alternative:* Bucket by UTC day. Rejected - inconsistent with the records list display, which uses local-date `format`.
- *Consequence:* Timezone handling matches the rest of the app; a record logged late evening local time still counts for its local date.

### Decision 4 - Intensity scale: 0 / 1 / 2 / 3+
Four intensity steps (empty, light, medium, full) map to count-type-token opacities (`bg-type-count/20`, `/40`, `/70`, full). Beyond 3 uses, full intensity - diminishing visual return for higher counts.
- *Alternative:* Continuous scale. Rejected - hard to perceive at small cell sizes; discrete steps read instantly.
- *Consequence:* A day with 5 uses looks the same as 3 - acceptable, since the point is "was it used," not the exact count (the tooltip shows the exact count).

### Decision 5 - Pure helper `buildHeatmap(records, weeks, nowIso)` for testability
Extract the date-bucketing and grid construction into a pure, tested helper returning `{ cells: { date, count, inRange }[] }`. The component renders from this. Keeps logic out of JSX and unit-testable without rendering.
- *Alternative:* Inline in the component. Rejected - untestable bucketing/intensity logic.
- *Consequence:* `nowIso` is injected (server render uses `new Date()` once, passed in), so tests are deterministic. `Date.now()`/`new Date()` are not called inside the helper.

## Risks / Trade-offs

- [Timezone drift between server and client] -> The heatmap is server-rendered with the server's "today"; a user in a different TZ could see a slightly off "today" cell. *Mitigation:* Acceptable for a personal single-user app; matches the existing server-rendered date handling in `UsageRecordsList`.
- [Sparse early data looks empty] -> A new asset with few records shows a mostly-empty grid. *Mitigation:* The empty-records case hides the heatmap entirely; a sparse-but-nonzero grid is honest and useful.
- [Wide grid on narrow screens] -> 26 columns of small cells can overflow on mobile. *Mitigation:* Use a horizontal-scroll container and small cell sizes; verify in build.

## Migration Plan

Additive - new component, new helper, new tests, new i18n keys, and a small composition change in the count records tab. No schema, route, or action changes. Rollback is removing the component/helper and reverting the `records` composition and i18n keys.

## Open Questions

None blocking. A future change may make the window configurable or add a click-through to a day-filtered records view.
