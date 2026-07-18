## Context

WorthMeter scores *existing* purchases via three break-even calculators (`calculateTimeBased`, `calculateCountBased`, `calculateQuotaBased`) operating on persisted assets and usage records. The simulator extends this to *prospective* purchases by projecting the same math forward, and personalizes the projection with the user's own behavioral history (how fast they actually use things). The app is Next.js 16 + React 19, server components by default, with a single-user SQLite data layer exposed through `getAllAssetsWithRecords()`.

## Goals / Non-Goals

**Goals:**
- Project break-even for a not-yet-purchased item using the *existing* calculation functions, so projections are consistent with real assets.
- Personalize the projection with a "historical velocity" derived from the user's actual usage records.
- Render a verdict (`worth-it` / `on-the-fence` / `unlikely`) and a 6/12-month cost-per-unit decay.
- Keep the simulator stateless: zero database writes, zero new schema.
- Reuse the existing design system (tokens, `Card`, `Progress`, `Badge`, `EmptyState`) so the page matches the rest of the app.

**Non-Goals:**
- No persistence of simulations, no new tables or migrations.
- No pre-filling `/assets/new` from the simulator in this change (plain link only).
- No push notifications or scheduling; the "track record" is computed on demand.
- No changes to existing calculators' behavior - they are reused as-is.

## Decisions

### Decision 1 - Project via a synthetic asset, not a parallel formula
The simulator constructs an in-memory `Asset`-shaped object (same fields as the schema, no `id`/timestamps persisted) and calls the existing calculator. Projection of "cost-per-use after N uses" is produced by feeding the calculator a synthetic `UsageRecord[]` of length N.
- *Alternative:* Write a dedicated projection formula. Rejected - it would drift from how real assets are scored, violating the "consistent math" goal.
- *Consequence:* The synthetic asset must satisfy the calculators' non-null assumptions (`totalCost`, `purchaseDate` required; `purchaseDate` defaults to today in the simulator). Calculators already guard division-by-zero (`Math.max(days, 1)`, `usedCount > 0`).

### Decision 2 - Historical velocity is computed server-side and passed as props
The `/simulate` page (server component) reads `getAllAssetsWithRecords()` once and computes a per-type velocity, then passes the relevant slice to the client form. Projection itself runs client-side for live preview without round-trips.
- *Velocity definitions:*
  - count: `Σ uses / Σ days-since-purchase` across non-archived count assets (uses/day).
  - time: `Σ effectiveCost / Σ days` (realized ¥/day) across non-archived time assets.
  - quota: average `usageRatio` across non-archived quota assets.
- *Alternative:* Compute velocity client-side. Rejected - it duplicates data access and bloats the client bundle.
- *Consequence:* The client form receives a small serializable `TrackRecord` object, not raw DB rows.

### Decision 3 - Verdict uses velocity-adjusted projection, not just the stated target
The user states a target (e.g. "target ¥60/use"), but their *actual* pace matters more. The verdict compares the velocity-adjusted break-even date against a horizon constant (`SIM_HORIZON_DAYS = 365`). `worth-it`: velocity-adjusted break-even ≤ horizon. `on-the-fence`: target-based break-even ≤ horizon but velocity-adjusted > horizon (optimistic target, realistic pace falls short). `unlikely`: both exceed horizon.
- *Alternative:* Single threshold on target only. Rejected - it ignores the user's actual behavior, which is the whole point.
- *Consequence:* With no history (empty track record), the velocity-adjusted path is skipped and the verdict falls back to target-only, surfaced as "based on your target" (not "based on your pace").

### Decision 4 - New pure module `src/lib/calculations/simulation.ts`
`simulatePurchase(input, trackRecord)` returns `{ projectedBreakEvenDays, projectedBreakEvenDate, verdict, costPerUnitAt6m, costPerUnitAt12m, targetBasedDays }`. `deriveHistoricalVelocity(assets)` returns the per-type `TrackRecord`. Both are pure and unit-tested, matching the existing `src/__tests__/calculations/*` pattern.
- *Alternative:* Inline the math in the page/component. Rejected - untestable and duplicates calc logic.
- *Consequence:* `Date.now()`/`new Date()` are unavailable in the Next server render for stable output; "today" is read once in the server page and threaded through `simulatePurchase` as an injected `now` parameter (ISO string), keeping functions pure and testable.

### Decision 5 - One client form component, no server action
The form is a single `'use client'` component holding input state; it calls `simulatePurchase` locally on every change and renders the result panel. No server action is needed because nothing is persisted. The "Create this asset" link is a plain `<Link href="/assets/new">`.
- *Alternative:* A server action round-trip per projection. Rejected - unnecessary latency and complexity for a pure function.
- *Consequence:* The client bundle gains the small `simulation` module (already tree-shakeable).

## Risks / Trade-offs

- [Velocity is a crude predictor] -> It averages across heterogeneous items (a ¥50 gym pass and a ¥3000 course). *Mitigation:* Surface the most-recent same-type asset as a concrete peer (Requirement: most recent same-type asset) so the aggregate isn't the only signal; document the limitation in copy.
- [Synthetic asset reuse couples the simulator to calculator internals] -> If calculators change signature, the simulator breaks. *Mitigation:* Keep the synthetic-asset builder adjacent to the calculators package; covered by the simulation test suite.
- [`new Date()` determinism] -> Server-rendered "today" must be injected, not computed inside pure functions. *Mitigation:* `simulatePurchase` takes `nowIso: string`; tests pass fixed dates.
- [No history edge case] -> Verdict and track-record panel must degrade gracefully. *Mitigation:* Explicit requirement + test for the empty-history path.

## Migration Plan

Additive only - new route, new module, new tests, new i18n keys. No existing route, schema, or calculation behavior changes. Rollback is deleting `src/app/simulate/` and `src/lib/calculations/simulation.ts` and reverting i18n keys. No migration, no feature flag needed.

## Open Questions

None blocking. A future change may add query-param pre-fill of `/assets/new` from the simulator (out of scope here).
