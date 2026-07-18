# Tasks: value-leaderboard

## 1. Calculation module

- [x] 1.1 Create `src/lib/calculations/leaderboard.ts` with types `RankedAsset`, `LeaderboardExtremes`.
- [x] 1.2 Implement `rankAssetsByValue(assets)` returning assets sorted by clamped `breakEvenProgress` desc, with `rank` (1-based for measurable, null for no-target) and `valueScore`; null-progress assets sort last.
- [x] 1.3 Implement `pickExtremes(ranked)` returning `{ champion, regret }`: champion = highest valueScore (tie-break lower totalCost); regret = max `(1 - valueScore) * totalCost` over non-broke-even assets.
- [x] 1.4 Re-export from `src/lib/calculations/index.ts`.
- [x] 1.5 Add `src/__tests__/calculations/leaderboard.test.ts` covering: ordering, null-progress sorts last, quota capping at 1, champion tie-break, regret weighting by cost, empty input.

## 2. i18n

- [x] 2.1 Add leaderboard keys to `en.ts`: nav label, title, filter labels (`all`/`time`/`count`/`quota`), champion heading, regret heading, rank column, primary-metric column, "not yet measurable" note, empty state.
- [x] 2.2 Mirror all new keys in `zh.ts`, `zh-TW.ts`, `ja.ts`.

## 3. Leaderboard route & UI

- [x] 3.1 Create `src/app/leaderboard/page.tsx` (server component): read locale/currency cookies, parse `?type=` (default `all`, invalid -> `all`), compute `rankAssetsByValue(getAllAssetsWithRecords())`, apply type filter, derive `pickExtremes`.
- [x] 3.2 Render champion and regret summary cards (hidden when no measurable assets).
- [x] 3.3 Render the ranked list: rank badge, name (link to `/assets/[id]`), type badge, primary metric value, progress bar, total cost; null-progress rows show the "not yet measurable" note.
- [x] 3.4 Render the type filter control (all/time/count/quota) as links that update `?type=`, marking the active one; render empty state when no assets.
- [x] 3.5 Add a "Leaderboard" link in `src/components/dashboard-header.tsx` to `/leaderboard`.

## 4. Validation

- [x] 4.1 Run `pnpm lint` and fix issues.
- [x] 4.2 Run `pnpm test` and ensure leaderboard tests pass.
- [x] 4.3 Run `pnpm build` and confirm `/leaderboard` builds with no regressions.
