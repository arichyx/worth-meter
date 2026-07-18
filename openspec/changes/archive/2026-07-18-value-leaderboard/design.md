## Context

WorthMeter already computes a per-asset `breakEvenProgress` (0-1) for time/count/quota types. The dashboard renders assets grouped by type with no cross-type ranking, so the "best and worst purchases" insight - the most compelling thing the dataset can show - is not surfaced. This change adds a ranked view that reuses the existing calculators' progress as a normalized, cross-type `valueScore` and highlights the two extremes users care about: the champion and the biggest regret.

## Goals / Non-Goals

**Goals:**
- Rank all non-archived assets by a single normalized value score derived from existing calculators.
- Surface the champion (best value) and biggest regret (most unrecovered money).
- Provide a bookmarkable type filter via URL query param, consistent with the existing `?page` convention.
- Keep the ranking logic pure and unit-tested.

**Non-Goals:**
- No schema changes, no new server actions, no mutations.
- No archived-asset view in this change (only active assets are ranked).
- No changes to existing calculators' behavior.

## Decisions

### Decision 1 - Reuse `breakEvenProgress` as the value score, no new metric
The calculators already produce a 0-1 progress for every type (time: `days/targetDays`, count: `uses/targetUseCount`, quota: `min(usageRatio, 1)`). Clamping and using it directly yields a comparable cross-type score without inventing a new formula.
- *Alternative:* A bespoke "value per currency" score (e.g. valueRecovered/totalCost). Rejected - it duplicates calculator output and its semantics differ per type, making cross-type ranking less honest, not more.
- *Consequence:* Assets with no target field (null progress) cannot be ranked; they sort to a "not yet measurable" group. This is acceptable and accurate - without a target, "value recovered" is undefined.

### Decision 2 - Pure `leaderboard.ts` module, thin page
`rankAssetsByValue(assets, nowIso)` returns `RankedAsset[]` sorted by `valueScore` desc with `rank` assigned; null-progress assets get `rank: null` and sort last. `pickExtremes(ranked)` returns `{ champion, regret }` where regret = max `(1 - valueScore) * totalCost` over non-broke-even assets. The page only reads cookies, applies the `?type=` filter, and renders.
- *Alternative:* Compute inline in the page. Rejected - untestable ranking logic and duplicated clamping.
- *Consequence:* `nowIso` is injected for determinism (time progress uses `new Date()` inside `calculateTimeBased`, which is fine for live display; the injected `nowIso` is used only for the regret/champion tie-breaks and is passed for testability of the pure helper where needed).

### Decision 3 - Champion tie-break by lower cost, regret by unrecovered value
When two assets share the top `valueScore`, the cheaper one wins (it recovered the same fraction for less spend). The regret is not simply the lowest progress - a ¥50 unused item is not a regret - so it is weighted by `(1 - progress) * totalCost` (unrecovered money).
- *Alternative:* Regret = lowest progress. Rejected - ignores cost, which is the whole point of "biggest regret."
- *Consequence:* A broke-even asset is never the regret (excluded by the `!isBreakEven` filter).

### Decision 4 - URL-driven type filter
`?type=all|time|count|quota`, defaulting to `all`, with invalid values falling back to `all`. Matches the existing `?page` pattern in `usage-records`.
- *Alternative:* Client-side filter state. Rejected - not bookmarkable/shareable, inconsistent with the codebase convention.

## Risks / Trade-offs

- [Cross-type progress comparison is approximate] -> A quota's `usageRatio` and a count's `uses/target` are both 0-1 but mean different things. *Mitigation:* Show the type badge and primary metric on each row so users interpret the score in context; the ranking is a heuristic, not a precise claim.
- [Time progress uses real `now()`] -> `calculateTimeBased` reads `new Date()` for non-archived assets, so the server render's score drifts with time. *Mitigation:* Acceptable for a live dashboard; the pure helper's tie-break logic is tested with injected data, and the progress value itself comes straight from the existing (already-shipped) calculators.

## Migration Plan

Additive only - new route, new module, new tests, new i18n keys. No existing route, schema, or calculation behavior changes. Rollback is deleting `src/app/leaderboard/` and `src/lib/calculations/leaderboard.ts` and reverting i18n keys.

## Open Questions

None blocking. A future change may add archived-asset inclusion and historical "champion of all time" views.
