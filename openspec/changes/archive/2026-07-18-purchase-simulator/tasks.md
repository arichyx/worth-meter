# Tasks: purchase-simulator

## 1. Calculation module

- [x] 1.1 Create `src/lib/calculations/simulation.ts` with types: `SimulationInput`, `TrackRecord`, `SimulationResult`, `Verdict`.
- [x] 1.2 Implement `buildSyntheticAsset(input, nowIso)` returning an `Asset`-shaped object (no id/timestamps persisted) usable by the existing calculators.
- [x] 1.3 Implement `simulatePurchase(input, trackRecord, nowIso)` reusing `calculateTimeBased`/`calculateCountBased`/`calculateQuotaBased` over the synthetic asset + synthetic usage records of projected length; returns `projectedBreakEvenDays`, `projectedBreakEvenDate`, `targetBasedDays`, `costPerUnitAt6m`, `costPerUnitAt12m`, `verdict`.
- [x] 1.4 Implement `deriveHistoricalVelocity(assets)` computing per-type velocity (count uses/day, time realized ¥/day, quota avg usageRatio) plus the most-recent non-archived same-type asset snapshot.
- [x] 1.5 Implement verdict logic: `worth-it` / `on-the-fence` / `unlikely` against `SIM_HORIZON_DAYS = 365`, with empty-track-record fallback to target-only.
- [x] 1.6 Re-export from `src/lib/calculations/index.ts`.
- [x] 1.7 Add `src/__tests__/calculations/simulation.test.ts` covering: synthetic-asset reuse matches real calc, velocity derivation, verdict thresholds (all three), 6/12m projection math, and empty-history fallback.

## 2. i18n

- [x] 2.1 Add simulator translation keys to `src/lib/i18n/locales/en.ts` (the `TranslationKey` source): page title/desc, input labels & placeholders, verdict strings (`worthIt`/`onTheFence`/`unlikely`), horizon headings, track-record sentences, empty-history copy, create-asset CTA.
- [x] 2.2 Mirror all new keys in `zh.ts`, `zh-TW.ts`, `ja.ts`.
- [x] 2.3 Verify `t()` lookups type-check across locales (no missing-key compile errors).

## 3. Simulator route & UI

- [x] 3.1 Create `src/app/simulate/page.tsx` (server component): read locale/currency cookies, compute `deriveHistoricalVelocity(getAllAssetsWithRecords())`, pass `TrackRecord` + locale strings to the client form.
- [x] 3.2 Create `src/app/simulate/simulator-form.tsx` (`'use client'`): form state for type, totalCost, purchaseDate (default today), type-specific target field, optional resale/expiry; live-calls `simulatePurchase` on every change.
- [x] 3.3 Render the result panel: verdict badge, projected break-even date, 6/12-month cost-per-unit decay, using `Card`/`Badge`/`Progress` and type tokens (`text-type-*`).
- [x] 3.4 Render the "track record" panel: per-type velocity + most-recent same-type asset name + its current break-even progress; show `EmptyState` when no history for the type.
- [x] 3.5 Render "Create this asset" `<Link href="/assets/new">`.
- [x] 3.6 Add a "Simulate" entry point in `src/components/dashboard-header.tsx` linking to `/simulate`.

## 4. Validation & docs

- [x] 4.1 Run `pnpm lint` and fix issues.
- [x] 4.2 Run `pnpm test` and ensure simulation tests pass.
- [x] 4.3 Run `pnpm build` and confirm `/simulate` builds and no existing route regresses.
