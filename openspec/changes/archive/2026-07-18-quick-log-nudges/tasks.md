# Tasks: quick-log-nudges

## 1. Pure helper

- [x] 1.1 Create `src/lib/calculations/nudges.ts` exporting `NUDGE_STALE_DAYS = 7`, type `Nudge`, and `deriveNudges(assets, nowIso)`.
- [x] 1.2 Implement days-since-last-use (max `recordedAt` or `purchaseDate` fallback) and the stale + non-broke-even filter, reusing `calculateCountBased` for break-even.
- [x] 1.3 Re-export from `src/lib/calculations/index.ts`.
- [x] 1.4 Add `src/__tests__/calculations/nudges.test.ts` covering: stale asset flagged, recent asset not flagged, broke-even asset not flagged, no-records falls back to purchase date, non-count assets ignored, archived ignored.

## 2. QuickLogButton component

- [x] 2.1 Create `src/components/quick-log-button.tsx` (`'use client'`) calling `addUsageRecordAction(assetId, 1)` from `@/app/assets/[id]/actions`, then `router.refresh()` + success toast (`useLogged`), with `useTransition` pending state.
- [x] 2.2 Add an aria-label and the "+1" visual; accept a `className` prop for placement.
- [x] 2.3 Add i18n keys to `en.ts`: `quickLog` (aria/label "Log one use"), `nudgesHeading`, `nudgeStale` sentence with `{name}`/`{days}`. Mirror in `zh.ts`, `zh-TW.ts`, `ja.ts`.

## 3. Dashboard wiring

- [x] 3.1 Refactor `AssetCard` in `src/app/page.tsx`: wrap card in a `relative` container; render `<QuickLogButton>` as a sibling (absolute top-right) only for active count assets.
- [x] 3.2 Compute `deriveNudges(assets, nowIso)` in the dashboard and render a nudge section above the type-group grid; each nudge row shows the stale sentence + an inline `<QuickLogButton>`.
- [x] 3.3 Hide the nudge section when there are no nudges.

## 4. Validation

- [x] 4.1 Run `pnpm lint` and fix issues.
- [x] 4.2 Run `pnpm test` and ensure nudge tests pass.
- [x] 4.3 Run `pnpm build` and confirm no regressions; smoke-test that the dashboard still renders and the +1 button does not navigate.
