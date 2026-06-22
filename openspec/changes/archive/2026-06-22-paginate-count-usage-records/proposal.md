## Why

Count-based assets (次数型资产) accumulate one usage record per use, so a frequently-used asset (e.g. a 100-entry gym pass) produces a single, ever-growing list on the detail page. The page currently renders **every** record at once, which degrades readability and client-render performance as the count grows. Paginating that list bounds the rendered output and gives users a predictable, navigable view of their history.

## What Changes

- Add URL-driven pagination to the **count-based** asset's usage-records list on the asset detail page (`src/app/assets/[id]/page.tsx`).
- Read the active page from a `page` query parameter (`/assets/[id]?page=N`); default to page 1, clamp to the valid range.
- Render only one page of records at a time (page size 10), keeping the existing newest-first ordering and the global `#{N}` numbering (numbering reflects position across the full record set, not within the page).
- Add prev/next (and page indicator) navigation controls using the existing `Button` component and `next/link`, wired through the current locale's i18n strings.
- Add the new i18n keys to all four locales (`zh`, `zh-TW`, `en`, `ja`).
- Extract a small, unit-testable pagination helper (slice + page math) following the existing `src/__tests__/` vitest convention.
- Scope: count-based assets only. Quota-based and time-based assets are intentionally left as-is; the shared rendering is refactored so quota *could* adopt the same component later without behavior change.

## Capabilities

### New Capabilities
- `usage-records`: How an asset's usage history is listed and navigated on the detail page — specifically paginated, newest-first display for count-based assets, with URL-driven page state and stable global numbering.

### Modified Capabilities
<!-- None. No existing spec covers usage-record listing behavior, so there are no requirement deltas to existing capabilities. -->

## Impact

- **Code**:
  - `src/app/assets/[id]/page.tsx` — consume `searchParams.page`, slice records for the count-based list, render pagination controls.
  - New `src/app/assets/[id]/usage-records-list.tsx` (server component) — extracted list + pagination UI, reused for count-based records.
  - New `src/lib/calculations/`-adjacent or `src/lib/` pagination helper (pure function) + unit test under `src/__tests__/`.
  - `src/lib/i18n/locales/{zh,zh-TW,en,ja}.ts` — new keys (prev/next, page indicator).
- **Data layer**: No schema or migration changes. Records are already loaded in full for the cost-per-use chart and metrics, so pagination is a presentation-layer slice — no new DB query is required (see design.md for the rationale and the deferred DB-level pagination option).
- **Routing**: Introduces use of the `page` search param on `/assets/[id]`. Next.js 16 (non-standard per `AGENTS.md`) — `searchParams` API contract must be verified against `node_modules/next/dist/docs/` before coding.
- **Tests**: New vitest unit tests for the pagination helper; manual verification of prev/next navigation, clamping, and stable numbering.
