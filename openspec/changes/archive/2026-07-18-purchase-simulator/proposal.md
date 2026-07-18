## Why

WorthMeter currently only answers "was this purchase worth it?" *after* the fact. The most valuable moment is *before* buying, when the decision can still be changed. Users have no way to sanity-check "given how I actually use things, will this ¥8000 lens break even in a reasonable time?" — they decide on gut feel, then track the regret later. This change adds a pre-purchase simulator that reuses the existing break-even math and the user's own historical usage velocity to project whether a prospective purchase is likely to pay off.

## What Changes

- Add a new `/simulate` route: a pre-purchase value simulator that does NOT persist anything.
- Inputs mirror the asset model: type (time/count/quota), price, purchase date, and the type-specific target field (`targetDailyCost` / `targetUnitCost` / billing cycle), plus an optional resale value / expiry.
- Project break-even by running the *existing* `calculateTimeBased` / `calculateCountBased` / `calculateQuotaBased` functions over a synthetic (non-persisted) asset, so projections are consistent with how real assets are scored.
- Add a "your track record" panel that derives the user's historical usage velocity for the selected type (e.g. avg uses/day for count, avg daily cost achieved for time) from existing assets, and surfaces the most recent same-type asset's actual break-even outcome as a concrete comparison.
- Emit a verdict (`worth-it` / `on-the-fence` / `unlikely`) plus projected break-even date, projected cost-per-unit at a 6/12-month horizon, and an inline comparison ("at your average pace, break-even ≈ X months; your last similar purchase took Y months").
- Add a "Create this asset" call-to-action that links to `/assets/new` (no pre-fill wiring in this change — future work).
- Add a dashboard entry point (button/link in the dashboard header) to reach the simulator.

## Capabilities

### New Capabilities

- `purchase-simulation`: A non-persisting pre-purchase simulator that projects break-even for a prospective purchase using the existing calculation engine and the user's historical usage velocity, then renders a verdict, a track-record comparison, and a dashboard entry point to reach it.

### Modified Capabilities

<!-- None. The simulator entry point is specified within `purchase-simulation` rather than modifying `navigation-header`, because `navigation-header` is not yet a synced main spec (it is introduced by the in-progress `optimize-frontend-ui-ux` change). -->

## Impact

- **Code**:
  - New route `src/app/simulate/page.tsx` (server component, computes historical stats) and `src/app/simulate/simulator-form.tsx` (client component, live projection).
  - New calculation module `src/lib/calculations/simulation.ts` with a pure, tested `simulatePurchase` function plus a `deriveHistoricalVelocity` helper.
  - New `src/lib/calculations/index.ts` re-exports.
  - `src/components/dashboard-header.tsx` — add a "Simulate" link/button.
  - `src/lib/i18n/locales/*` — new translation keys for the simulator UI, inputs, verdicts, and track-record copy.
- **Data layer**: No schema changes, no migrations. Reads only via existing `getAllAssetsWithRecords`.
- **Routing**: Adds `/simulate`. No existing routes change.
- **Tests**: Add `src/__tests__/calculations/simulation.test.ts` covering projection math, velocity derivation, and verdict thresholds; run `pnpm lint`, `pnpm test`, `pnpm build`.
