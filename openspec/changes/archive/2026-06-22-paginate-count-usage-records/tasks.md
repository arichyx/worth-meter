# Tasks

## 1. Verify Next.js 16 APIs (per AGENTS.md)

- [x] 1.1 Read the relevant guide in `node_modules/next/dist/docs/` for the App Router page API and confirm whether `searchParams` is a Promise (like `params`) in this Next.js 16 release. — Confirmed via `01-app/03-api-reference/03-file-conventions/page.md`: `searchParams: Promise<{ [key: string]: string | string[] | undefined }>`. Values may be `string | string[] | undefined`, so the `page` param must handle the array case (take first element).
- [x] 1.2 Confirm how `<Link>` from `next/link` composes a new query string while preserving the existing `[id]` path segment, and note any non-standard behavior vs. stock Next.js. — Confirmed via `01-app/03-api-reference/02-components/link.md`: use object form `href={{ pathname: '/assets/[id]', query: { page: 'N' } }}`. No non-standard behavior observed.

## 2. Pagination helper + tests

- [x] 2.1 Create a pure helper (e.g. `paginateRecords(records, page, pageSize)` → `{ rows, total, page, totalPages }`) under `src/lib/` (e.g. `src/lib/pagination.ts`), sorting newest-first and clamping `page` to `[1, totalPages]` per spec.
- [x] 2.2 Add `USAGE_RECORDS_PAGE_SIZE = 10` constant alongside the helper.
- [x] 2.3 Add a vitest unit test under `src/__tests__/` (mirroring `src/__tests__/calculations/`) covering: first page, last page, middle page, page size boundary, non-numeric/zero/negative → page 1, `page` above total → clamps to last page, single-record and empty inputs.

## 3. i18n keys (all four locales)

- [x] 3.1 Add pagination keys (e.g. `prevPage`, `nextPage`, `pageIndicator` with `{page}`/`{totalPages}` placeholders) to `src/lib/i18n/locales/zh.ts`.
- [x] 3.2 Add the same keys to `src/lib/i18n/locales/zh-TW.ts`.
- [x] 3.3 Add the same keys to `src/lib/i18n/locales/en.ts`.
- [x] 3.4 Add the same keys to `src/lib/i18n/locales/ja.ts`.
- [x] 3.5 Verify the locale type/key typing (e.g. `Locale`/translation map) accepts the new keys without widening or `as any`. — Verified: `TranslationKey` is auto-derived from `en` (`as const`); `zh`/`zh-TW`/`ja` are `Record<TranslationKey, string>`, so adding the keys to all four keeps them in sync with no `as any`. Full `tsc` confirmation deferred to the Task 6 build.

## 4. UsageRecordsList server component

- [x] 4.1 Create `src/app/assets/[id]/usage-records-list.tsx` as a React Server Component accepting the page slice, `total`, `page`, `pageSize`, `assetType`, and `locale`.
- [x] 4.2 Render the existing bordered-row markup (Badge with absolute `#{total - (offset + i)}` number, label, date) for the slice only, preserving the current visual design.
- [x] 4.3 Render prev/next controls using the existing `Button` component and `next/link`, linking to `/assets/[id]?page=N`; disable at first/last page.
- [x] 4.4 Render the localized page indicator; hide all pagination controls when `totalPages <= 1`.
- [x] 4.5 Use the server `t(locale, key)` helper for all labels (matching `page.tsx`'s `tt` pattern).

## 5. Wire the detail page

- [x] 5.1 In `src/app/assets/[id]/page.tsx`, read and `await` `searchParams` (per task 1.1) and parse `page` into a normalized integer.
- [x] 5.2 For count-based assets, compute the slice via the helper and render `<UsageRecordsList>` instead of the inline full list; leave the quota-based inline rendering unchanged.
- [x] 5.3 Keep the `asset.usageRecords.length > 0` guard and the chart/metrics paths unchanged (they still receive the full record set).
- [x] 5.4 Ensure the route still compiles: `metrics` switch, `searchParams` typing, and params Promise handling all type-check.

## 6. Verification

- [x] 6.1 Run `pnpm lint` / `pnpm check` and fix any biome findings. — All 8 feature files biome-clean. Pre-existing `dangerouslySetInnerHTML` error in `layout.tsx` (theme-init script) and pre-existing formatting drift in 11 other files were left untouched (out of scope); the 11 auto-reformatted files were restored to HEAD to keep this change focused.
- [x] 6.2 Run `pnpm test` and confirm the new pagination tests pass. — 39/39 tests pass (4 files), including the new `src/__tests__/pagination.test.ts`.
- [x] 6.3 Run `pnpm build` (build+start path per memory; `next dev` may fail on taskr) and confirm a clean production build. — Build succeeds; `/assets/[id]` is correctly dynamic (ƒ) due to `searchParams`. Note: server must run under node v25.9.0 (`.nvmrc`); under v26 the `better-sqlite3` native binary (module v141) fails to load.
- [x] 6.4 Manually verify against the spec scenarios: default page, `?page=2`, out-of-range clamp, non-numeric clamp, global numbering continuing on page 2, prev/next disabled at bounds, single-page hides controls, and that adding a record still works via the dialog. — Verified live under node v25.9.0 against the 25-record count asset (游泳季卡): page 1 badges 25→16, page 2 15→6, page 3 5→1; indicators 第 1/3, 2/3, 3/3; `?page=99`→page 3, `?page=abc`→page 1; prev disabled on page 1, next disabled on page 3; 12-record asset (OpenSwim) shows 2 pages. Add-via-dialog flow is unchanged (`usage-dialog.tsx` + `addUsageRecordAction` unmodified; build compiles the client dialog).
