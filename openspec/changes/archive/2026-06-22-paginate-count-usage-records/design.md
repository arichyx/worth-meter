## Context

The asset detail page (`src/app/assets/[id]/page.tsx`) is a React Server Component. For count-based assets it currently:

1. Loads the asset and **all** of its usage records via `getAssetWithRecords(id)` ([queries.ts:32](src/lib/db/queries.ts#L32)).
2. Feeds the full record array into `calculateCountBased` (uses `records.length` for `usedCount`, `costPerUse`, `breakEvenProgress`) and into `AssetChart`, which builds a cumulative cost-per-use trend line by iterating every record ascending ([asset-chart.tsx:38-47](src/app/assets/[id]/asset-chart.tsx#L38-L47)).
3. Renders **every** record as a row in the "Usage records" card, sorted newest-first, each tagged with a global `#{total - i}` index ([page.tsx:307-343](src/app/assets/[id]/page.tsx#L307-L343)).

There is no pagination anywhere in the codebase today. The framework is Next.js 16 (a non-standard release per `AGENTS.md` — APIs may differ from training data, so the bundled docs in `node_modules/next/dist/docs/` must be consulted before writing code).

## Goals / Non-Goals

**Goals:**
- Bound the rendered output of the count-based usage-records list to one page (default size 10) so the detail page stays readable and cheap to render as usage grows.
- Make page state bookmarkable and shareable via the URL (`/assets/[id]?page=N`).
- Preserve the existing newest-first ordering and the global, cross-page `#{N}` use numbering.
- Keep the change surgical, server-rendered, and consistent with existing patterns (RSC, `Button`, `next/link`, server `t()` i18n, vitest unit tests).
- Lay the rendering out as a reusable component so quota-based could adopt it later without behavior change.

**Non-Goals:**
- DB-level `LIMIT/OFFSET` pagination. The chart and metrics already require the full record set server-side, so a second paginated query would duplicate work for no current benefit. This is deferred (see Decisions).
- Paginating quota-based or time-based assets. Scope is count-based only per the request.
- Decoupling the cost-per-use chart from the full record set.
- Changing the schema, adding migrations, or adding new server actions.

## Decisions

### Decision 1 — Paginate at the presentation layer (slice the in-memory array), not via a new DB query
The full record set is **already loaded** on the server for the chart and metrics. Slicing that array for display therefore costs nothing extra, whereas a separate `LIMIT/OFFSET` query would load records twice (once fully for the chart, once for the page) for no net win.
- *Alternative considered:* Add `getUsageRecordsPage(assetId, page, size)` with `LIMIT/OFFSET` + a `COUNT(*)`. Rejected now because it doesn't reduce total DB work until the chart is also decoupled (a larger, out-of-scope refactor). The helper is easy to add later if record counts grow large enough that even loading for the chart matters.
- *Consequence:* The number of records fetched from the DB is unchanged; the win is bounded **render** size and list UX. This is the actual user-visible problem.

### Decision 2 — URL search param (`?page=N`) is the source of page state
The detail page is already a server component and already reads a Promise-based `params`. Page state lives in `searchParams.page`, read server-side, so pagination is fully SSR'd, bookmarkable, and integrates with the existing `router.refresh()` flow in `UsageDialog` without extra client state.
- *Alternative considered:* A client component holding `useState(currentPage)` and re-fetching via a server action. Rejected — adds client JS, loses SSR of later pages, and breaks back/forward and share semantics.
- *API caveat:* In Next 15+/16 `searchParams` is a Promise (like `params`); the page must `await` it. This contract **must** be verified against `node_modules/next/dist/docs/` before coding (per `AGENTS.md`).

### Decision 3 — Page size 10, defined as a single constant
Ten rows fits the dense, bordered row design without scrolling on a typical viewport while bounding render cost. Exposed as one named constant (e.g. `USAGE_RECORDS_PAGE_SIZE`) so it is trivially tunable later.

### Decision 4 — Preserve global `#{N}` numbering across pages
Each row's badge shows its absolute use number: `total - (offset + index)` where `offset = (page - 1) * size`. So page 1 shows `#{total} … #{total-9}`, page 2 continues `#{total-10} …`. This preserves the "this was the Nth use" meaning.
- *Alternative considered:* Per-page numbering (`#1..#10`). Rejected — ambiguous and loses the cost-per-use correlation users see in the chart.

### Decision 5 — Extract a `UsageRecordsList` server component
`page.tsx` is already ~390 lines. Extracting the list + pagination into `src/app/assets/[id]/usage-records-list.tsx` (server component; navigation via `<Link>`, so no client JS needed) isolates the new behavior, makes it reusable for quota later, and keeps the page file readable. Inputs: the records page slice, `total`, `page`, `pageSize`, `assetType`, and `locale` (for server `t()`).

### Decision 6 — Pure, unit-tested pagination helper
Put slice + page math in a pure function (e.g. `paginateRecords(records, page, size)` returning `{ rows, total, page, totalPages }` and clamping inputs) under `src/lib/` with a vitest test in `src/__tests__/`, mirroring the existing `src/__tests__/calculations/` convention. Keeps logic out of JSX and testable without rendering.

### Decision 7 — Clamp/normalize the `page` param defensively
Accept only integers `≥ 1`. Treat missing/non-numeric/`0`/negative as page 1. Clamp values above `totalPages` down to `totalPages`. When there are zero records, `totalPages = 1` and the empty state is handled by the existing `usageRecords.length > 0` guard (the card does not render at all), so the helper never runs for the empty case.

## Risks / Trade-offs

- **[Full record set still loaded server-side for the chart]** → Acceptable; the chart legitimately shows the full cost-per-use trend. If an asset accumulates thousands of records and server load matters, revisit Decision 1 and decouple the chart + move to `LIMIT/OFFSET`. Documented as deferred, not forgotten.
- **[`searchParams` API shape in non-standard Next 16]** → Mitigation: an explicit task step to read the relevant guide in `node_modules/next/dist/docs/` and confirm whether `searchParams` is a Promise and how `<Link>` preserves other query params, before writing the page code.
- **[Adding a record while on page > 1]** → `UsageDialog` calls `router.refresh()`, which re-renders with the same `?page` param. The newly added (newest) record lands on page 1; the user stays on their current page and sees the list shift by one. Not broken, mildly suboptimal. Mitigation: noted as an open question; a future tweak can navigate to page 1 after a successful add.
- **[Numbering drift if records are ever deleted]** → Today usage records are never deleted (no delete action exists), so global numbering is stable. If deletion is added later, the `#{N}` scheme would need revisiting. Non-issue for now.
- **[Quota-based left using inline rendering]** → Minor duplication until quota adopts the extracted component. Acceptable; keeps this change in scope.

## Migration Plan

- No data migration, no schema changes, no new server actions. Fully code-local.
- Deploy: standard `next build` + `next start`.
- Rollback: revert the code change. Any bookmarked `/assets/[id]?page=N` URLs remain valid — out-of-range pages clamp to the last page, so no broken links.
- No breaking changes to existing URLs: `?page` absent → page 1 (current behavior).

## Open Questions

- After adding a usage record while on `page > 1`, should the dialog navigate the user back to page 1 so they see their new entry? Leaning **no** for this change (keep the diff minimal and `router.refresh()`-based); revisit if users report confusion.
- Should the page-size constant (10) be configurable per locale or asset later? Defaulting to a single global constant for now.
